import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import { File, Storage } from '@google-cloud/storage';

import {
  canAccessObject,
  getObjectAclPolicy,
  ObjectAclPolicy,
  ObjectPermission,
  setObjectAclPolicy,
} from './objectAcl';

const REPLIT_SIDECAR_ENDPOINT = 'http://127.0.0.1:1106';
const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabasePrivateBucket = process.env.SUPABASE_PRIVATE_BUCKET || 'private-documents';
const supabasePublicBucket = process.env.SUPABASE_PUBLIC_BUCKET || 'public-assets';

export const objectStorageClient = new Storage({
  credentials: {
    audience: 'replit',
    subject_token_type: 'access_token',
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: 'external_account',
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: 'json',
        subject_token_field_name: 'access_token',
      },
    },
    universe_domain: 'googleapis.com',
  },
  projectId: '',
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super('Object not found');
    this.name = 'ObjectNotFoundError';
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

type SupabaseObject = {
  provider: 'supabase';
  bucket: string;
  objectName: string;
};

type StoredObject = File | SupabaseObject;

export class ObjectStorageService {
  constructor() {}

  private usesSupabase(): boolean {
    return Boolean(supabaseUrl && supabaseServiceKey);
  }

  private requireSupabaseConfig(): { url: string; key: string } {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for portable object storage.',
      );
    }
    return { url: supabaseUrl, key: supabaseServiceKey };
  }

  getPublicObjectSearchPaths(): Array<string> {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || '';
    const paths = Array.from(
      new Set(
        pathsStr
          .split(',')
          .map((path) => path.trim())
          .filter((path) => path.length > 0),
      ),
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Create a bucket in 'Object Storage' " +
          'tool and set PUBLIC_OBJECT_SEARCH_PATHS env var (comma-separated paths).',
      );
    }
    return paths;
  }

  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || '';
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          'tool and set PRIVATE_OBJECT_DIR env var.',
      );
    }
    return dir;
  }

  async searchPublicObject(filePath: string): Promise<StoredObject | null> {
    if (this.usesSupabase()) {
      return {
        provider: 'supabase',
        bucket: supabasePublicBucket,
        objectName: filePath.replace(/^\/+/, ''),
      };
    }

    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;

      const { bucketName, objectName } = parseObjectPath(fullPath);
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);

      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }

    return null;
  }

  async downloadObject(
    file: StoredObject,
    cacheTtlSec: number = 3600,
  ): Promise<Response> {
    if (isSupabaseObject(file)) {
      const { url, key } = this.requireSupabaseConfig();
      const response = await fetch(
        `${url}/storage/v1/object/${file.bucket}/${encodeStoragePath(file.objectName)}`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
        },
      );
      if (response.status === 404) {
        throw new ObjectNotFoundError();
      }
      if (!response.ok) {
        throw new Error(`Supabase Storage download failed with ${response.status}`);
      }
      const headers = new Headers(response.headers);
      headers.set(
        'Cache-Control',
        `${file.bucket === supabasePublicBucket ? 'public' : 'private'}, max-age=${cacheTtlSec}`,
      );
      return new Response(response.body, { status: response.status, headers });
    }

    const aclPolicy = await getObjectAclPolicy(file);
    const isPublic = aclPolicy?.visibility === 'public';

    const nodeStream = file.createReadStream();
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;

    const headers: Record<string, string> = {
      'Content-Type':
        (await file.getMetadata())[0].contentType as string || 'application/octet-stream',
      'Cache-Control': `${isPublic ? 'public' : 'private'}, max-age=${cacheTtlSec}`,
    };
    const [metadata] = await file.getMetadata();
    if (metadata.size) {
      headers['Content-Length'] = String(metadata.size);
    }

    return new Response(webStream, { headers });
  }

  async getObjectEntityUploadURL(): Promise<string> {
    if (this.usesSupabase()) {
      const objectName = `uploads/${randomUUID()}`;
      return `/api/storage/uploads/put?object=${encodeURIComponent(objectName)}`;
    }

    const privateObjectDir = this.getPrivateObjectDir();
    if (!privateObjectDir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          'tool and set PRIVATE_OBJECT_DIR env var.',
      );
    }

    const objectId = randomUUID();
    const fullPath = `${privateObjectDir}/uploads/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(fullPath);
    return signObjectURL({
      bucketName,
      objectName,
      method: 'PUT',
      ttlSec: 900,
    });
  }

  async uploadSupabaseObject(objectName: string, body: Buffer, contentType: string): Promise<void> {
    const { url, key } = this.requireSupabaseConfig();
    const response = await fetch(
      `${url}/storage/v1/object/${supabasePrivateBucket}/${encodeStoragePath(objectName)}`,
      {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': contentType || 'application/octet-stream',
          'x-upsert': 'true',
        },
        body,
      },
    );
    if (!response.ok) {
      throw new Error(`Supabase Storage upload failed with ${response.status}`);
    }
  }

  async deleteObject(file: StoredObject): Promise<void> {
    if (isSupabaseObject(file)) {
      const { url, key } = this.requireSupabaseConfig();
      const response = await fetch(
        `${url}/storage/v1/object/${file.bucket}/${encodeStoragePath(file.objectName)}`,
        {
          method: 'DELETE',
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
        },
      );
      if (!response.ok && response.status !== 404) {
        throw new Error(`Supabase Storage delete failed with ${response.status}`);
      }
      return;
    }
    await file.delete({ ignoreNotFound: true });
  }

  normalizeUploadObjectPath(rawObjectName: string): string {
    return `/objects/${rawObjectName.replace(/^\/+/, '')}`;
  }

  async getObjectEntityFile(objectPath: string): Promise<StoredObject> {
    if (this.usesSupabase()) {
      if (!objectPath.startsWith('/objects/')) {
        throw new ObjectNotFoundError();
      }
      const objectName = objectPath.slice('/objects/'.length);
      if (!objectName) {
        throw new ObjectNotFoundError();
      }
      const storedObject: SupabaseObject = {
        provider: 'supabase',
        bucket: supabasePrivateBucket,
        objectName,
      };
      const { url, key } = this.requireSupabaseConfig();
      const response = await fetch(
        `${url}/storage/v1/object/${storedObject.bucket}/${encodeStoragePath(objectName)}`,
        {
          method: 'HEAD',
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
        },
      );
      if (response.status === 404) {
        throw new ObjectNotFoundError();
      }
      if (!response.ok) {
        throw new Error(`Supabase Storage lookup failed with ${response.status}`);
      }
      return storedObject;
    }

    if (!objectPath.startsWith('/objects/')) {
      throw new ObjectNotFoundError();
    }

    const parts = objectPath.slice(1).split('/');
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }

    const entityId = parts.slice(1).join('/');
    let entityDir = this.getPrivateObjectDir();
    if (!entityDir.endsWith('/')) {
      entityDir = `${entityDir}/`;
    }
    const objectEntityPath = `${entityDir}${entityId}`;
    const { bucketName, objectName } = parseObjectPath(objectEntityPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const objectFile = bucket.file(objectName);
    const [exists] = await objectFile.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }
    return objectFile;
  }

  async trySetObjectEntityAclPolicy(
    rawPath: string,
    aclPolicy: ObjectAclPolicy,
  ): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (this.usesSupabase()) {
      return normalizedPath;
    }
    if (!normalizedPath.startsWith('/')) {
      return normalizedPath;
    }

    const objectFile = await this.getObjectEntityFile(normalizedPath);
    if (isSupabaseObject(objectFile)) {
      return normalizedPath;
    }
    await setObjectAclPolicy(objectFile, aclPolicy);
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: StoredObject;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    if (isSupabaseObject(objectFile)) {
      return true;
    }
    return canAccessObject({
      userId,
      objectFile,
      requestedPermission: requestedPermission ?? ObjectPermission.READ,
    });
  }
  normalizeObjectEntityPath(rawPath: string): string {
    if (!rawPath.startsWith('https://storage.googleapis.com/')) {
      return rawPath;
    }

    const url = new URL(rawPath);
    const rawObjectPath = url.pathname;

    let objectEntityDir = this.getPrivateObjectDir();
    if (!objectEntityDir.endsWith('/')) {
      objectEntityDir = `${objectEntityDir}/`;
    }

    if (!rawObjectPath.startsWith(objectEntityDir)) {
      return rawObjectPath;
    }

    const entityId = rawObjectPath.slice(objectEntityDir.length);
    return `/objects/${entityId}`;
  }

}

function isSupabaseObject(object: StoredObject): object is SupabaseObject {
  return 'provider' in object && object.provider === 'supabase';
}

function encodeStoragePath(path: string): string {
  return path.split('/').map((segment) => encodeURIComponent(segment)).join('/');
}

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  const pathParts = path.split('/');
  if (pathParts.length < 3) {
    throw new Error('Invalid path: must contain at least a bucket name');
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join('/');

  return {
    bucketName,
    objectName,
  };
}

async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
}: {
  bucketName: string;
  objectName: string;
  method: 'GET' | 'PUT' | 'DELETE' | 'HEAD';
  ttlSec: number;
}): Promise<string> {
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
  };
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(30_000),
    },
  );
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}, ` +
        `make sure you're running on Replit`,
    );
  }

  const { signed_url: signedURL } = (await response.json()) as {
    signed_url: string;
  };
  return signedURL;
}
