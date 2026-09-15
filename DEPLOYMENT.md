# Ditheto Accountants deployment

The repository supports two Node hosting models:

- **Vercel:** Vite frontend plus the Express API as a serverless function.
- **cPanel/Afrihost:** Vite static files plus the Express API as a persistent
  Node application.

Never commit production credentials. Use the host's environment-variable
manager and use `.env.production.example` only as a list of required keys.

## Vercel

Project settings:

- Root directory: repository root
- Install: `pnpm install --frozen-lockfile`
- Build: `pnpm --filter @workspace/ditheto-accountants run build`
- Output: `artifacts/ditheto-accountants/dist/public`
- Node.js: 20 or later

The root `vercel.json` contains these settings and sends `/api/*` requests to
the Express function in `api/[...path].ts`. All other unknown routes return the
React application so direct links such as `/services` and `/admin/team` work.

Before promoting the deployment, configure every value listed in
`.env.production.example`. The PostgreSQL service must accept secure external
connections from serverless functions and should use a pooled connection URL.

Replit Object Storage depends on a local Replit credential sidecar and is not
portable to Vercel. The API uses Supabase Storage when `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` are present, with `private-documents` for private
files and `public-assets` for public files. The same provider works from
Afrihost/cPanel, so staff photos and private documents remain portable.

## cPanel / Afrihost

Confirm that the Afrihost package includes **Setup Node.js App**, Node.js 20+,
SSH access, and PostgreSQL access. Some shared-hosting packages provide only
PHP/MySQL and cannot run this application API.

Build commands:

```sh
corepack enable
pnpm install --frozen-lockfile
BASE_PATH=/ pnpm --filter @workspace/ditheto-accountants run build
pnpm --filter @workspace/api-server run build
```

Run the API with:

```sh
PORT=$PORT NODE_ENV=production pnpm --filter @workspace/api-server run start
```

Serve `artifacts/ditheto-accountants/dist/public` as the website document root.
Configure Apache to return `index.html` for frontend routes and proxy `/api/*`
to the Node application. Set the same environment variables used on Vercel.

Before moving from Vercel to Afrihost:

1. Export and import the PostgreSQL database.
2. Copy object-storage files to the selected portable storage provider.
3. Add the final domain to Clerk and update its allowed redirect URLs.
4. Configure TLS, `/api` proxying, SPA fallback, and environment variables.
5. Test sign-in, role restrictions, contact submissions, photos, and private
   document upload/download before changing DNS.