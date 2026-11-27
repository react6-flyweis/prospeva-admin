# Prospeva Admin Control

Admin panel for Prospeva staff. Next.js 16 App Router, React 19, Tailwind 4, shadcn/ui, pnpm. See README.md for the architecture.

## Working preferences

- **Libraries:** use standard libraries rather than hand-rolled code, and suggest them up front.
- **Next.js features:** keep them to a minimum.
- **Scope:** work in stages, e.g. architecture/API first and UI later. Don't touch areas outside the current stage.
- **Testing:** the user tests manually. Don't run long browser/e2e passes or write tests unless asked.
- **Commits:** the user commits. Don't commit unless asked.
- **Memory:** save anything worth remembering in this file, never in global or home-folder memory.

## Conventions

- **Browser only.** The app calls the admin API directly from the browser. Don't add Next API routes, server actions, middleware/proxy, or server-side data fetching.
- **Server data** goes through TanStack Query hooks in `lib/api/queries.ts`. Add each endpoint in three places: a Zod schema in `lib/api/schemas.ts`, a function in `lib/api/endpoints.ts`, and a hook in `queries.ts`. Mutations invalidate with `qk.*` and toast through sonner.
- **Client state** goes in Zustand stores under `lib/stores/`. Use `persist` only for what must survive a reload. Never put server data in Zustand.
- **Forms** use React Hook Form with `zodResolver`. Form schemas live in `lib/forms.ts`.
- **Screens** are listed in `lib/modules.ts` (`NAV`). Most render through the generic `ModuleScreen` in `components/screens/module/`, driven by `/controlPlane/<module>/summary` and `/records`. `components/shell/page-content.tsx` picks the screen.
- **Layout:** `app/` holds routes only. UI lives in `components/` (`ui/` = shadcn, `common/` = shared bits and skeletons, `shell/`, `screens/`, `legacy/`). Keep files small: one concern per file.
- **shadcn first:** build UI from `components/ui/` primitives, not hand-rolled elements. To keep the original look, put the existing `globals.css` class on the shadcn component. Plain CSS overrides Tailwind's layered utilities, so only add utilities to cancel shadcn defaults the CSS doesn't set (e.g. `gap-0 py-0` on Card).
- **Inputs with icons or buttons** use `InputGroup`, so the focus ring wraps the whole box. Old rules like `.content button{min-height}` hit shadcn's button-based controls (Switch, Checkbox); `globals.css` resets them.
- **Tables** use `DataTable` in `components/common/data-table.tsx`. Module records page on the server through `ModuleRecords`; in-memory lists use `RecordsTable`.
- **Pending states:** forms await `mutateAsync` and use `formState.isSubmitting`. Exports use `useExport` (`lib/use-export.ts`).
- **Loading states:** use the skeletons in `components/common/skeletons.tsx` for data loads. `LoadingState` (spinner) is only for in-progress actions.
- **Persisted stores** must not be read before hydration. Use `useHydrated()` as `AdminApp` does.

## API

- **Base URL:** `NEXT_PUBLIC_ADMIN_API_URL` in `.env` (see `.env.example`). The QA backend is on Render and can take 30–60 seconds to wake up.
- **Reference:** `docs/admin-api/README.md` covers endpoints, data shapes and the 34 modules. `docs/admin-api/responses/` holds real captured responses (gitignored). The full guide and Postman collection are also in `docs/`.
- **Unconfirmed write payloads:** the guide only shows "Review" as a row action (`POST …/records/:id/action`), and module-action request bodies were never captured. Confirm both with the backend team.

## Current state

- **Legacy UI not yet refactored:** `components/legacy/` (`revenue.tsx`, `restrictions.tsx`) comes from the v13 demo export. They're minified one-liners, and they're the only source of `pnpm lint` errors. They're out of scope until their API exists.
- **Demo-only screens:** Revenue & Settlements and Account Restrictions have no API and use browser-local demo data.
- **API gaps to raise with the backend team:** `/records` has no `sort` parameter, so sorting only reorders the current page. It also has no `kind` filter, so page counts for Approvals and Connectivity include their cards. Module "Export" fetches at most 500 records.
- **More admin APIs exist beyond the control plane:** Postman folders 20–36 (`/api/v1/admin/...` CRUD: KYC, push notifications, user/agent/lender management, CMS settings, etc.) and the guide's `/admin/mobile/organizations` and `/admin/mobile/settlements` (likely the Revenue & Settlements API). The docs don't say whether this panel should use them; ask the backend team before integrating.
- **Auth (folder 20) is integrated except registration**, which is a public admin sign-up and was left out on purpose. Success responses were never captured. `changePassword/:id` needs an account id that the code looks for in the `forgotVerifyOtp` response (`_id`/`userId`/`id`), which is unconfirmed. Signin returns no `_id`, so there is no change-password-while-signed-in.
- **Environment** comes from the session (`/controlPlane/session`). It isn't shown in the top bar and can't be switched; the footer shows it. "Read-only" disables writes.
- **CSV export** (`lib/csv.ts`) still prefixes every file with a "DEMONSTRATION DATA" line, including real module exports.
- **Styling:** mostly plain CSS classes in `app/globals.css`, from the original design.
