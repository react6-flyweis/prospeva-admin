import { redirect } from "next/navigation";

// The admin portal is a single page at "/" with hash-based sections (e.g. /#Overview).
export default function DashboardRedirect() {
  redirect("/");
}
