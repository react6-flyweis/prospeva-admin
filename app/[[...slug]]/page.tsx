import { AdminApp } from "@/components/shell/admin-app";

// Every admin path ("/", "/customers", "/payment-rails", …) renders the client app,
// which picks the screen from the URL. See lib/modules.ts for the slugs.
export default function Page() {
  return <AdminApp />;
}
