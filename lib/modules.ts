import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Banknote,
  Bot,
  Building2,
  CircleDollarSign,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Gauge,
  HandCoins,
  Headphones,
  Landmark,
  LayoutDashboard,
  Network,
  ReceiptText,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** A screen in the admin app. `key` is the control-plane module key; null = no API (demo screen). */
export type PageDef = { slug: string; name: string; key: string | null; icon: LucideIcon };

const p = (name: string, key: string | null, icon: LucideIcon, slug?: string): PageDef => ({
  name,
  key,
  icon,
  slug:
    slug ??
    name
      .toLowerCase()
      .replace(/&/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
});

export const NAV: { group: string; items: PageDef[] }[] = [
  {
    group: "Command",
    items: [
      p("Overview", "overview", LayoutDashboard, ""),
      p("Exception Center", "exceptionCenter", AlertTriangle),
      p("Customers", "customers", Users),
      p("Organizations", "organizations", Building2),
      p("Employers", "employers", Landmark),
      p("Employer 360", "employer360", Gauge),
      p("Employer Reliability", "employerReliability", Activity),
      p("View as User", "viewAsUser", Search),
      p("Onboarding & KYC", "kyc", BadgeCheck),
    ],
  },
  {
    group: "Money movement",
    items: [
      p("Payroll Operations", "payroll", Banknote),
      p("Transactions", "transactions", ReceiptText),
      p("Ledger Explorer", "ledger", FileText),
      p("Payment Rails", "rails", Network),
      p("Connectivity Operations", "connectivity", RefreshCw),
      p("Agents", "agents", Store),
      p("Lenders", "lenders", HandCoins),
      p("Loan Eligibility", "loanEligibility", ShieldCheck),
      p("Bills & Vendors", "bills", Zap),
    ],
  },
  {
    group: "Control",
    items: [
      p("Risk & Fraud", "risk", ShieldAlert),
      p("Account Restrictions", null, ShieldCheck),
      p("Reconciliation", "reconciliation", RefreshCw),
      p("Incident Command", "incidents", Activity),
      p("Support Cases", "supportCases", Headphones),
      p("Partner Management", "partners", Building2),
      p("Fees & FX", "feesFx", SlidersHorizontal),
      p("Revenue & Settlements", null, CircleDollarSign),
      p("Compliance", "compliance", ShieldCheck),
      p("Approvals", "approvals", ClipboardCheck),
    ],
  },
  {
    group: "Platform",
    items: [
      p("Privacy & Consent", "privacyConsent", ShieldCheck),
      p("Feature Controls", "featureControls", SlidersHorizontal),
      p("Launch Readiness", "launchReadiness", ClipboardCheck),
      p("ProspevaAI", "prospevaAI", Bot),
      p("Reports", "reports", FileText),
      p("Audit Log", "auditLog", FileCheck2),
      p("Roles & Access", "rolesAccess", Users),
      p("Settings", "settings", Settings),
    ],
  },
];

export const PAGES = NAV.flatMap((g) => g.items);

/** Old or alternate paths that should land on a page. */
const ALIASES: Record<string, string> = { dashboard: "", overview: "" };

export function pageFromPath(pathname: string): PageDef | undefined {
  const raw = decodeURIComponent(pathname.replace(/^\/+|\/+$/g, "").split("/")[0] || "");
  const slug = raw in ALIASES ? ALIASES[raw] : raw;
  return PAGES.find((x) => x.slug === slug || x.key === slug);
}

export const pageByKey = (key: string) =>
  PAGES.find((x) => x.key === key || (x.key && key.startsWith(x.key + "_")));
export const hrefFor = (page: PageDef) => "/" + page.slug;

/** "affectedParty" -> "Affected party", "payeInLrd" -> "Paye in lrd" */
export function humanize(key: string) {
  const s = key
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
