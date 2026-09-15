---
name: Vercel monorepo deployment
description: Deployment constraints for the Ditheto monorepo when publishing directly to Vercel.
---

Vercel may apply its own NodeNext TypeScript check to a TypeScript file under `api/`, even when the workspace uses bundler module resolution. For this monorepo, the reliable deployment pattern is to bundle the Express app during the Vercel build and have a JavaScript serverless adapter dynamically load the generated bundle. If `vercel.json` defines custom routes, `/api/*` must be explicitly routed to the catch-all function before the SPA fallback.

**Why:** Direct Vercel deployments initially built the frontend but sent API requests to the SPA fallback, and Vercel's standalone TypeScript check rejected the workspace's extensionless imports.

**How to apply:** Keep the API bundle step in the Vercel build command, keep the adapter JavaScript-only, and smoke-test both a public page and an unauthenticated `/api` endpoint after every deployment configuration change.