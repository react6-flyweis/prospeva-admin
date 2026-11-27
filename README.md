# Prospeva Admin Control

Internal operations, risk, payments and compliance control center for Prospeva staff.

Built with Next.js (App Router), React 19, Tailwind CSS 4 and shadcn/ui.

## Getting started

Requires Node.js >= 22.13 and pnpm.

```bash
cp .env.example .env   # then set NEXT_PUBLIC_ADMIN_API_URL
pnpm install
pnpm dev               # http://localhost:3000, sends you to /login
pnpm build && pnpm start
pnpm lint
```

Sign in with a Prospeva admin account. The seeded QA account is listed in the Postman collection in `docs/`.

## How it works

The app runs entirely in the browser. It calls the admin API directly (the backend allows any origin). There are no Next.js API routes and no server-side data fetching.

**Stack:** TanStack Query for server data, Zustand with `persist` for client state, Zod for API response schemas and form validation, React Hook Form for forms, and sonner for toasts.

```
lib/api/client.ts      fetch wrapper: base URL, bearer token, {status,message,data} envelope,
                       Zod validation of `data`, ApiError; a 401/403 signs out
lib/api/schemas.ts     Zod schemas and inferred types for every response
lib/api/endpoints.ts   plain API functions (no React)
lib/api/queries.ts     query keys (qk), useQuery hooks, useMutation hooks (toast + invalidation)
lib/stores/auth.ts     Zustand + persist: token and signed-in admin
lib/stores/ui.ts       Zustand: sidebar groups (persisted), environment, record sheet, AI sheet
lib/stores/table-prefs.ts  Zustand + persist: page size and hidden columns per table
lib/forms.ts           Zod schemas for the forms (login, record action, module action, search)
lib/modules.ts         every screen: URL slug, label, API module key, icon, sidebar group
lib/navigation.ts      useGo(), useEnvironment(), useReadOnly()
lib/records.ts         record → table columns / CSV rows
lib/use-export.ts      export as a mutation (≥1 s pending, then download + toast)
lib/csv.ts, values.ts  CSV download; helpers for reading loosely-typed `panels`

app/                   routes only
  providers.tsx        QueryClientProvider and Toaster
  [[...slug]]/         every admin URL renders <AdminApp/> from components/shell
  login/               sign-in page (React Hook Form + Zod)

components/
  ui/                  shadcn/ui primitives (generated, don't edit by hand)
  common/              display.tsx (Pill, Status, Metric, MetricGrid, Panel),
                       states.tsx (ErrorState, EmptyState, inline LoadingState),
                       data-table.tsx (TanStack Table), skeletons.tsx
  shell/               admin-app (auth guard + SidebarProvider layout), sidebar, topbar,
                       top-search (⌘K combobox), page-head, page-content (picks the screen),
                       record-sheet, ai-sheet
  screens/
    module/            module-screen (generic) + records-table, panels, module-actions,
                       toggles, policy-cards, view-as-user
    overview-screen.tsx, ai-screen.tsx
  legacy/              minified v13 demo code: revenue, restrictions
```

- **Data flow:** components call hooks from `lib/api/queries.ts`. Those call `endpoints`, which call `request()`. Each response is checked against its Zod schema, so a backend change shows up as a clear error instead of broken UI.
- **Writes:** actions and toggles invalidate that module's queries, the sidebar badges and the overview, so screens refetch.
- **Auth:** the token lives in the persisted auth store. When it's cleared (sign-out, or a 401/403 from the API), the shell redirects to `/login?next=…`.
- **UI components:** everything is built from shadcn/ui (Card, Badge, Alert, Sidebar, Command, Field, Item, Table…). The wrappers in `components/common/` add the original design's CSS classes from `globals.css`, which override shadcn's defaults, so the look matches the original design.
- **Tables:** `DataTable` (TanStack Table v8 + shadcn Table). Module tables page and search on the server (`/records?page&limit&search`). Sorting is client-side within the page, because the API has no sort parameter yet. The overview's lists are paged in the browser. Page size and hidden columns persist per table.
- **Pending states:** forms submit with `mutateAsync`, so `formState.isSubmitting` disables the fields and shows a spinner. Exports go through `useExport`.
- **Loading:** data loads show skeletons shaped like the real layout (`components/common/skeletons.tsx`). The inline spinner (`LoadingState`) is only for in-progress actions such as searching or the AI thinking.
- **Not migrated yet:** `components/legacy/`: Revenue and Restrictions (no API yet, demo data in the browser).
- **Reference:** `docs/admin-api/README.md` documents the admin API.

## Adding a screen

Add an entry to `NAV` in `lib/modules.ts` with its control-plane module key. The generic screen then renders the module's metrics, actions, top toggle, panels and records. Write a custom component in `components/screens/` and route to it from `PageContent` (`components/shell/page-content.tsx`) only when the generic layout isn't enough.
