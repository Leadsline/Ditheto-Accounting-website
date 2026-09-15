# Ditheto Accountants

Professional public website and secure staff portal for managing accounting clients, documents, communications, and future Odoo synchronization.

## Run & Operate

- `pnpm --filter @workspace/ditheto-accountants run dev` — run the website
- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/ditheto-accountants run typecheck` — check the website
- `pnpm --filter @workspace/api-server run typecheck` — check the API
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas after changing OpenAPI
- `pnpm --filter @workspace/db run push` — push development schema changes

## Stack

- React 19, Vite, TypeScript, Tailwind CSS and Wouter
- Clerk authentication with a production Frontend API proxy
- Express 5 API with generated Zod request/response validation
- PostgreSQL with Drizzle ORM
- Replit App Storage for private client documents
- OpenAPI and Orval for generated React Query clients

## Where things live

- Public and admin UI: `artifacts/ditheto-accountants/src`
- API routes: `artifacts/api-server/src/routes`
- Authentication and role enforcement: `artifacts/api-server/src/middlewares`
- Source-of-truth API contract: `lib/api-spec/openapi.yaml`
- Database schema: `lib/db/src/schema`

## Architecture decisions

- Browser authentication is cookie-based through Clerk; browser code must not add bearer tokens.
- The first authenticated staff account is bootstrapped as `super_admin`; later accounts default to read-only `staff`.
- Super Admin permissions are enforced on the server for uploads, edits, deletes, requests, and sync actions. Hiding buttons is not treated as authorization.
- Client files upload directly to private App Storage with short-lived signed URLs; PostgreSQL stores metadata and object paths, not file blobs.
- Odoo is modular and disabled by default. Its UI and API report `Disconnected` until an authorized connector is attached.
- Without messaging connectors, email and WhatsApp requests are logged in PostgreSQL and opened in the staff member's email app or WhatsApp for final sending.

## Product

- Public Home, Services, Quote, About, Team, and Contact pages
- Secure staff sign-in and sign-up
- Searchable client database and detailed client profiles
- Client document library with status/category management and private uploads
- Outstanding-document request composer and communication history
- Role-based Super Admin and Staff access
- Odoo connection status and client sync foundation

## Gotchas

- Run OpenAPI code generation immediately after editing `lib/api-spec/openapi.yaml`.
- Private object routes must remain behind Clerk staff authentication.
- Do not present Odoo, email, or WhatsApp delivery as connected until the relevant integration has been authorized.