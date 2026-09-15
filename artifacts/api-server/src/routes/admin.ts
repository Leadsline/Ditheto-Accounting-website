import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq } from "drizzle-orm";
import {
  CreateClientDocumentBody,
  CreateClientDocumentParams,
  CreateClientDocumentResponse,
  CreateDocumentRequestBody,
  CreateDocumentRequestParams,
  CreateDocumentRequestResponse,
  DeleteClientDocumentParams,
  GetAdminClientParams,
  GetAdminClientResponse,
  GetOdooStatusResponse,
  ListAdminClientsResponse,
  ListClientDocumentsParams,
  ListClientDocumentsResponse,
  ListDocumentRequestsParams,
  ListDocumentRequestsResponse,
  SyncOdooClientBody,
  UpdateClientDocumentBody,
  UpdateClientDocumentParams,
  UpdateClientDocumentResponse,
} from "@workspace/api-zod";
import {
  adminClientsTable,
  clientDocumentsTable,
  db,
  documentRequestsTable,
  integrationStateTable,
  staffUsersTable,
} from "@workspace/db";
import { requireFullAccess, requireStaff, type AdminRequest, type StaffRole } from "../middlewares/adminAuth";
import { ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const storage = new ObjectStorageService();

router.get("/admin/me", requireStaff, async (req: Request, res: Response): Promise<void> => {
  const staffUser = (req as AdminRequest).staffUser;
  res.json({ role: staffUser?.role ?? "staff" });
});

router.post("/admin/staff-users", requireFullAccess, async (req: Request, res: Response): Promise<void> => {
  const body = req.body as {
    email?: unknown;
    password?: unknown;
    firstName?: unknown;
    lastName?: unknown;
    role?: unknown;
  };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
  const allowedRoles: StaffRole[] = ["ceo", "senior_manager", "marketing_staff"];
  const role = typeof body.role === "string" && allowedRoles.includes(body.role as StaffRole)
    ? body.role as StaffRole
    : null;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "Enter a valid staff email address." });
    return;
  }
  if (password.length < 12) {
    res.status(400).json({ error: "Staff passwords must be at least 12 characters." });
    return;
  }
  if (!role) {
    res.status(400).json({ error: "Select a valid portal role." });
    return;
  }
  if (!process.env.CLERK_SECRET_KEY) {
    res.status(503).json({ error: "Staff account creation is not configured yet." });
    return;
  }

  const clerkResponse = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email_address: [email],
      password,
      ...(firstName ? { first_name: firstName } : {}),
      ...(lastName ? { last_name: lastName } : {}),
    }),
  });

  if (!clerkResponse.ok) {
    const clerkError = await clerkResponse.json().catch(() => null) as { errors?: Array<{ message?: string }> } | null;
    const message = clerkError?.errors?.[0]?.message;
    res.status(clerkResponse.status === 422 ? 409 : 502).json({
      error: message || "The staff account could not be created.",
    });
    return;
  }

  const clerkUser = await clerkResponse.json() as { id?: string };
  if (!clerkUser.id) {
    res.status(502).json({ error: "The authentication account was created without a usable user ID." });
    return;
  }

  try {
    const [staffUser] = await db.insert(staffUsersTable)
      .values({ clerkUserId: clerkUser.id, role })
      .returning({ id: staffUsersTable.id, role: staffUsersTable.role });
    res.status(201).json({ id: staffUser.id, email, role: staffUser.role });
  } catch (error) {
    await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(clerkUser.id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    }).catch(() => undefined);
    req.log.error({ err: error }, "Staff account database record could not be created");
    res.status(500).json({ error: "The staff account could not be completed." });
  }
});

router.get("/admin/clients", requireFullAccess, async (_req: Request, res: Response): Promise<void> => {
  const clients = await db.select().from(adminClientsTable).orderBy(adminClientsTable.name);
  res.json(ListAdminClientsResponse.parse(clients));
});

router.get("/admin/clients/:clientId", requireFullAccess, async (req: Request, res: Response): Promise<void> => {
  const params = GetAdminClientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid client ID" });
    return;
  }
  const [client] = await db.select().from(adminClientsTable).where(eq(adminClientsTable.id, params.data.clientId)).limit(1);
  if (!client) {
    res.status(404).json({ error: "Client not found" });
    return;
  }
  res.json(GetAdminClientResponse.parse(client));
});

router.get("/admin/clients/:clientId/documents", requireFullAccess, async (req: Request, res: Response): Promise<void> => {
  const params = ListClientDocumentsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid client ID" });
    return;
  }
  const documents = await db.select().from(clientDocumentsTable)
    .where(eq(clientDocumentsTable.clientId, params.data.clientId))
    .orderBy(desc(clientDocumentsTable.updatedAt));
  res.json(ListClientDocumentsResponse.parse(documents));
});

router.post("/admin/clients/:clientId/documents", requireFullAccess, async (req: Request, res: Response): Promise<void> => {
  const params = CreateClientDocumentParams.safeParse(req.params);
  const body = CreateClientDocumentBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid document metadata" });
    return;
  }
  const uploadedBy = (req as AdminRequest).authUserId ?? "unknown";
  const [document] = await db.insert(clientDocumentsTable).values({
    ...body.data,
    expiresAt: body.data.expiresAt?.toISOString().slice(0, 10) ?? null,
    clientId: params.data.clientId,
    uploadedBy,
  }).returning();
  res.status(201).json(CreateClientDocumentResponse.parse(document));
});

router.patch("/admin/documents/:documentId", requireFullAccess, async (req: Request, res: Response): Promise<void> => {
  const params = UpdateClientDocumentParams.safeParse(req.params);
  const body = UpdateClientDocumentBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid document update" });
    return;
  }
  const patch = {
    ...body.data,
    expiresAt: body.data.expiresAt === undefined
      ? undefined
      : body.data.expiresAt?.toISOString().slice(0, 10) ?? null,
  };
  const [document] = await db.update(clientDocumentsTable).set(patch)
    .where(eq(clientDocumentsTable.id, params.data.documentId)).returning();
  if (!document) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  res.json(UpdateClientDocumentResponse.parse(document));
});

router.delete("/admin/documents/:documentId", requireFullAccess, async (req: Request, res: Response): Promise<void> => {
  const params = DeleteClientDocumentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid document ID" });
    return;
  }
  const [document] = await db.delete(clientDocumentsTable)
    .where(eq(clientDocumentsTable.id, params.data.documentId)).returning();
  if (!document) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  try {
    const file = await storage.getObjectEntityFile(document.objectPath);
     await storage.deleteObject(file);
  } catch (error) {
    req.log.warn({ err: error, documentId: document.id }, "Document metadata deleted but stored object cleanup failed");
  }
  res.sendStatus(204);
});

router.get("/admin/clients/:clientId/document-requests", requireFullAccess, async (req: Request, res: Response): Promise<void> => {
  const params = ListDocumentRequestsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid client ID" });
    return;
  }
  const requests = await db.select().from(documentRequestsTable)
    .where(eq(documentRequestsTable.clientId, params.data.clientId))
    .orderBy(desc(documentRequestsTable.sentAt));
  res.json(ListDocumentRequestsResponse.parse(requests));
});

router.post("/admin/clients/:clientId/document-requests", requireFullAccess, async (req: Request, res: Response): Promise<void> => {
  const params = CreateDocumentRequestParams.safeParse(req.params);
  const body = CreateDocumentRequestBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Select at least one document and provide a message" });
    return;
  }
  const [request] = await db.insert(documentRequestsTable).values({
    ...body.data,
    clientId: params.data.clientId,
    sentBy: (req as AdminRequest).authUserId ?? "unknown",
    deliveryStatus: "logged",
  }).returning();
  res.status(201).json(CreateDocumentRequestResponse.parse(request));
});

router.get("/admin/integrations/odoo/status", requireFullAccess, async (_req: Request, res: Response): Promise<void> => {
  const [state] = await db.select().from(integrationStateTable)
    .where(eq(integrationStateTable.provider, "odoo")).limit(1);
  res.json(GetOdooStatusResponse.parse({
    enabled: state?.enabled === 1,
    connected: state?.connected === 1,
    message: state?.message ?? "Odoo authorization was not completed. Connect Odoo to enable sync.",
    lastSyncAt: state?.lastSyncAt ?? null,
  }));
});

router.post("/admin/integrations/odoo/sync", requireFullAccess, async (req: Request, res: Response): Promise<void> => {
  const body = SyncOdooClientBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid client ID" });
    return;
  }
  const [state] = await db.select().from(integrationStateTable)
    .where(and(eq(integrationStateTable.provider, "odoo"), eq(integrationStateTable.connected, 1))).limit(1);
  if (!state) {
    res.status(409).json({ error: "Odoo is disconnected. Authorize the Odoo integration before syncing clients." });
    return;
  }
  res.json({ success: false, message: "Odoo connector is enabled but no sync adapter has been attached.", externalId: null });
});

export default router;