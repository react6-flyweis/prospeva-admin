# Prospeva Admin Control

Internal operations, risk, payments and compliance control center for Prospeva staff.

Built with Next.js (App Router), React 19, Tailwind CSS 4 and shadcn/ui.

## Getting started

Requires Node.js >= 22.13 and pnpm.

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build
pnpm start
pnpm lint
```

## Project layout

- `app/page.tsx` — admin portal shell and module screens
- `app/action-workspace.tsx`, `app/workflow-schema.ts` — request forms, validation and saved requests
- `app/enterprise-table.tsx` — table search, sorting, column controls, pagination and CSV export
- `app/revenue.tsx`, `lib/revenue-model.ts` — Revenue & Settlements
- `app/restrictions.tsx` — Account Restrictions
- `components/ui/` — shadcn/ui components
- `docs/` — backend API guide and Postman collection/environment

## Status

The UI currently runs on demo data stored in the browser. No real payment, credential, identity or partner verification occurs. Backend integration follows the admin control-plane API described in `docs/Prospeva_Websites_API_Guide.html` (base path `/api/v1/admin`).
