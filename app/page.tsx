"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Banknote,
  Bell,
  Bot,
  Building2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Gauge,
  HandCoins,
  Headphones,
  Landmark,
  LayoutDashboard,
  Menu,
  Network,
  ReceiptText,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  Users,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WorkforceSync } from "./workforce-sync";

type Page =
  | "Overview"
  | "Exception Center"
  | "Customers"
  | "Organizations"
  | "Employers"
  | "Employer 360"
  | "Employer Reliability"
  | "View as User"
  | "Onboarding & KYC"
  | "Payroll Operations"
  | "Transactions"
  | "Ledger Explorer"
  | "Payment Rails"
  | "Connectivity Operations"
  | "Agents"
  | "Lenders"
  | "Loan Eligibility"
  | "Bills & Vendors"
  | "Risk & Fraud"
  | "Reconciliation"
  | "Incident Command"
  | "Support Cases"
  | "Partner Management"
  | "Fees & FX"
  | "Compliance"
  | "Approvals"
  | "Privacy & Consent"
  | "Feature Controls"
  | "Launch Readiness"
  | "ProspevaAI"
  | "Reports"
  | "Audit Log"
  | "Roles & Access"
  | "Settings";
type Tone = "green" | "amber" | "red" | "blue" | "slate";
const NAV: {
  group: string;
  items: { name: Page; icon: any; badge?: string }[];
}[] = [
  {
    group: "Command",
    items: [
      { name: "Overview", icon: LayoutDashboard },
      { name: "Exception Center", icon: AlertTriangle, badge: "27" },
      { name: "Customers", icon: Users },
      { name: "Organizations", icon: Building2 },
      { name: "Employers", icon: Landmark },
      { name: "Employer 360", icon: Gauge },
      { name: "Employer Reliability", icon: Activity },
      { name: "View as User", icon: Search },
      { name: "Onboarding & KYC", icon: BadgeCheck, badge: "12" },
    ],
  },
  {
    group: "Money movement",
    items: [
      { name: "Payroll Operations", icon: Banknote },
      { name: "Transactions", icon: ReceiptText },
      { name: "Ledger Explorer", icon: FileText },
      { name: "Payment Rails", icon: Network },
      { name: "Connectivity Operations", icon: RefreshCw, badge: "17" },
      { name: "Agents", icon: Store },
      { name: "Lenders", icon: HandCoins },
      { name: "Loan Eligibility", icon: ShieldCheck },
      { name: "Bills & Vendors", icon: Zap },
    ],
  },
  {
    group: "Control",
    items: [
      { name: "Risk & Fraud", icon: ShieldAlert, badge: "6" },
      { name: "Reconciliation", icon: RefreshCw, badge: "3" },
      { name: "Incident Command", icon: Activity, badge: "1" },
      { name: "Support Cases", icon: Headphones, badge: "18" },
      { name: "Partner Management", icon: Building2 },
      { name: "Fees & FX", icon: SlidersHorizontal },
      { name: "Compliance", icon: ShieldCheck },
      { name: "Approvals", icon: ClipboardCheck, badge: "9" },
    ],
  },
  {
    group: "Platform",
    items: [
      { name: "Privacy & Consent", icon: ShieldCheck },
      { name: "Feature Controls", icon: SlidersHorizontal },
      { name: "Launch Readiness", icon: ClipboardCheck },
      { name: "ProspevaAI", icon: Bot },
      { name: "Reports", icon: FileText },
      { name: "Audit Log", icon: FileCheck2 },
      { name: "Roles & Access", icon: Users },
      { name: "Settings", icon: Settings },
    ],
  },
];
const txs = [
  [
    "TX-894201",
    "Payroll",
    "Monrovia Business Group",
    "LRD 13,206,500",
    "IIPS / NEPS",
    "Settled",
  ],
  [
    "TX-894198",
    "Cross-border",
    "Martha K. → Fatu B.",
    "USD 425.00",
    "PAPSS",
    "Processing",
  ],
  [
    "TX-894175",
    "Bill payment",
    "Kelvin F. → LEC",
    "LRD 1,500",
    "Direct vendor",
    "Settled",
  ],
  [
    "TX-894166",
    "Merchant",
    "Samuel K. → Stop & Shop",
    "USD 82.40",
    "Onafriq Card",
    "Review",
  ],
  [
    "TX-894142",
    "Agent deposit",
    "Agent Sinkor → Hawa S.",
    "LRD 10,000",
    "Prospeva ledger",
    "Settled",
  ],
];
const orgs = [
  [
    "Monrovia Business Group",
    "Employer",
    "248 employees",
    "Verified",
    "LRD 18.45M",
  ],
  ["Stop & Shop", "Merchant", "4 locations", "Verified", "USD 28,460"],
  ["Unity Bank", "Lender", "1,284 active loans", "Verified", "USD 425,000"],
  ["Divine Academy", "School", "486 students", "Review", "LRD 1.84M"],
  ["Grace Community Church", "Church", "3 branches", "Verified", "USD 38,450"],
  [
    "Forward Together Susu",
    "Susu group",
    "12 members",
    "Verified",
    "LRD 286,000",
  ],
];
const rails = [
  {
    name: "IIPS / NEPS",
    role: "Domestic bank & wallet transfers",
    status: "Operational",
    rate: "99.96%",
    latency: "1.8 sec",
    currencies: "LRD • USD",
  },
  {
    name: "PAPSS",
    role: "African cross-border settlement",
    status: "Operational",
    rate: "99.82%",
    latency: "42 sec",
    currencies: "African currencies",
  },
  {
    name: "Onafriq",
    role: "Cards, mobile money & remittances",
    status: "Operational",
    rate: "99.71%",
    latency: "7.4 sec",
    currencies: "LRD • USD • GHS • NGN",
  },
  {
    name: "Pay-Na Na",
    role: "Inclusive instant payments",
    status: "Monitoring",
    rate: "98.64%",
    latency: "3.2 sec",
    currencies: "LRD • USD",
  },
  {
    name: "Visa / Mastercard",
    role: "External card pay-ins",
    status: "Degraded",
    rate: "96.81%",
    latency: "8.7 sec",
    currencies: "USD",
  },
];
const riskCases = [
  [
    "RSK-2081",
    "Ghost employee pattern",
    "Monrovia Business Group",
    "High",
    "Biometric and destination overlap",
    "Open",
  ],
  [
    "RSK-2078",
    "Account takeover",
    "Samuel K.",
    "Critical",
    "New device + beneficiary",
    "Held",
  ],
  [
    "RSK-2071",
    "Agent velocity",
    "Prospeva Agent – Sinkor",
    "Medium",
    "Cash-ins above baseline",
    "Review",
  ],
  [
    "RSK-2064",
    "Duplicate destination",
    "Divine Academy",
    "High",
    "3 employees, one wallet",
    "Open",
  ],
];
const queue = [
  [
    "APR-6082",
    "Release held transfer",
    "USD 7,850",
    "Risk Operations",
    "2 of 3",
    "High",
  ],
  [
    "APR-6079",
    "Approve LRD/USD rate",
    "199.25",
    "Treasury",
    "1 of 2",
    "Medium",
  ],
  [
    "APR-6072",
    "Activate new LEC route",
    "Direct API",
    "Partner Ops",
    "2 of 2",
    "Ready",
  ],
  [
    "APR-6066",
    "Suspend agent",
    "Agent Broad Street",
    "Compliance",
    "1 of 3",
    "High",
  ],
];
const desc: Record<Page, string> = {
  Overview:
    "Platform health, money movement and required actions across Prospeva.",
  "Exception Center":
    "One prioritized queue for financial, service, identity and regulatory exceptions.",
  Customers: "Verified identities, wallets, profiles and account controls.",
  Organizations:
    "Merchants, lenders, landlords, agents, schools, churches, hospitals and susu groups.",
  Employers:
    "Employer accounts, workforce, payroll readiness, approvals and connected business systems.",
  "Employer 360":
    "Complete employer operating record across people, payroll, funding, loans and support.",
  "Employer Reliability":
    "Transparent payroll consistency, funding and data-quality indicators for approved credit decisions.",
  "View as User":
    "Enter an audited, read-only support view without requesting a user password.",
  "Onboarding & KYC":
    "Review identity, organization and beneficial-owner verification queues.",
  "Payroll Operations":
    "Monitor payroll calculations, funding, releases, PAYE and ghost-name controls.",
  Transactions:
    "Trace every payment from instruction through rail and destination settlement.",
  "Ledger Explorer":
    "Follow every debit, fee, FX conversion, clearing entry and destination credit.",
  "Payment Rails":
    "Availability, routing, performance and settlement across domestic and partner networks.",
  "Connectivity Operations":
    "Monitor offline channels, queued instructions, synchronization and duplicate protection.",
  Agents:
    "Manage authorized agents, cash availability, float, commissions and reconciliation.",
  Lenders:
    "Oversee licenses, employer assignments, credit offers and payroll collections.",
  "Loan Eligibility":
    "Enforce employee-only marketplace access, verified payroll linkage, consent and lender underwriting.",
  "Bills & Vendors":
    "Manage Liberian billers, product catalogs, availability and settlement routes.",
  "Risk & Fraud":
    "Investigate identity, transaction, device and payroll risk signals.",
  Reconciliation:
    "Resolve ledger-to-partner and destination mismatches without repeating successful payments.",
  "Incident Command":
    "Coordinate service incidents, route failover, communications and recovery.",
  "Support Cases":
    "Work customer and organization issues with full transaction context.",
  "Partner Management":
    "Contracts, credentials, settlement accounts, fees and service performance.",
  "Fees & FX":
    "Control service fees, partner costs, rate sources and customer disclosures.",
  Compliance:
    "Monitor AML, sanctions, CBL reporting and statutory obligations.",
  Approvals: "Maker-checker queue for high-impact operational changes.",
  "Privacy & Consent":
    "Govern payroll, credit, identity and spending-data permission throughout its lifecycle.",
  "Feature Controls":
    "Activate services by country, currency, profile and partner with approval safeguards.",
  "Launch Readiness":
    "Production gate for partners, regulation, security, support and recovery.",
  ProspevaAI: "Role-aware analysis and controlled operational assistance.",
  Reports: "Download operational, financial and regulatory reports.",
  "Audit Log":
    "Immutable record of staff actions, approvals and system events.",
  "Roles & Access": "Least-privilege roles, permissions and session controls.",
  Settings:
    "Platform preferences, notifications and integration configuration.",
};

function Pill({
  children,
  tone = "slate",
}: {
  children: React.ReactNode;
  tone?: Tone;
}) {
  return <span className={`pill ${tone}`}>{children}</span>;
}
function Status({ value }: { value: string }) {
  const tone: Tone =
    /settled|verified|operational|ready|resolved|active|allowed|approved|connected/i.test(
      value,
    )
      ? "green"
      : /review|processing|monitoring|pending|open|priority/i.test(value)
        ? "amber"
        : /critical|degraded|held|failed|high|restricted|suspended|escalated/i.test(
              value,
            )
          ? "red"
          : "blue";
  return <Pill tone={tone}>{value}</Pill>;
}
function Metric({
  label,
  value,
  delta,
  icon: Icon,
  tone = "blue",
}: {
  label: string;
  value: string;
  delta: string;
  icon: any;
  tone?: Tone;
}) {
  return (
    <article className="metric">
      <div className={`metric-icon ${tone}`}>
        <Icon size={20} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <span>{delta}</span>
      </div>
    </article>
  );
}
function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel-head">
        <h2>{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}
function DataTable({
  headers,
  rows,
  select,
}: {
  headers: string[];
  rows: string[][];
  select: (x: any[]) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((h) => (
            <TableHead key={h}>{h}</TableHead>
          ))}
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r[0]} onClick={() => select(r)} className="click-row">
            {r.map((c, j) => (
              <TableCell key={j}>
                {j === r.length - 1 ? <Status value={c} /> : c}
              </TableCell>
            ))}
            <TableCell>
              <ChevronRight size={16} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function Home() {
  const [page, setPage] = useState<Page>("Overview"),
    [menu, setMenu] = useState(false),
    [selected, setSelected] = useState<any[] | null>(null),
    [query, setQuery] = useState(""),
    [notice, setNotice] = useState(""),
    [aiOpen, setAiOpen] = useState(false),
    [environment, setEnvironment] = useState("Production"),
    [isOnline, setIsOnline] = useState(true),
    [aiInput, setAiInput] = useState("");
  const [messages, setMessages] = useState<
    { who: "ai" | "user"; text: string }[]
  >([
    {
      who: "ai",
      text: "Good morning, Aisha. I found 3 settlement mismatches and one high-risk payroll exception. What would you like to review?",
    },
  ]);
  const go = (p: Page) => {
    setPage(p);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const act = (m: string) => {
    setNotice(m);
    setTimeout(() => setNotice(""), 3400);
  };
  const sendAI = () => {
    if (!aiInput.trim()) return;
    const q = aiInput;
    setMessages((m) => [
      ...m,
      { who: "user", text: q },
      {
        who: "ai",
        text: /rail|route/i.test(q)
          ? "PAPSS is the best supported route for this corridor: USD 2.10 total fees, a 42-second estimate and GHS 6,104 exact recipient amount. I can draft a Treasury recommendation."
          : /risk|fraud|ghost/i.test(q)
            ? "The priority signal is a duplicate salary destination across three employee records. Payroll remains held. I can open the evidence bundle or draft a Risk escalation."
            : "I can summarize exceptions, trace a payment, compare rail costs or draft a controlled action for approval.",
      },
    ]);
    setAiInput("");
  };
  useEffect(() => {
    const sync = () => setIsOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  return (
    <div className="app-shell">
      {notice && (
        <div className="toast">
          <BadgeCheck size={18} />
          {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      )}
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><CircleDollarSign /></div>
          <div>
            <b>Prospeva</b>
            <span>Admin Control</span>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMenu(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>
        <div className="operator">
          <div className="avatar">AF</div>
          <div>
            <b>Aisha Fallah</b>
            <span>Super Administrator</span>
          </div>
          <ShieldCheck size={17} />
        </div>
        <nav>
          {NAV.map((s) => (
            <div className="nav-group" key={s.group}>
              <p>{s.group}</p>
              {s.items.map((i) => (
                <button
                  className={page === i.name ? "active" : ""}
                  onClick={() => go(i.name)}
                  key={i.name}
                >
                  <i.icon size={18} />
                  <span>{i.name}</span>
                  {i.badge && <em>{i.badge}</em>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="secure">
          <ShieldCheck size={18} />
          <div>
            <b>Secure workspace</b>
            <span>MFA • session monitored</span>
          </div>
        </div>
      </aside>
      {menu && (
        <button
          className="scrim"
          onClick={() => setMenu(false)}
          aria-label="Close navigation"
        />
      )}
      <main className="main">
        <header className="topbar">
          <button
            className="menu-button"
            onClick={() => setMenu(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>
          <div className="top-search">
            <Search size={18} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people, organizations, transactions or cases"
            />
          </div>
          <Select value={environment} onValueChange={setEnvironment}>
            <SelectTrigger className="env">
              <span className="live-dot" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Production">Production</SelectItem>
              <SelectItem value="Sandbox">Sandbox</SelectItem>
              <SelectItem value="Read-only">Read-only</SelectItem>
            </SelectContent>
          </Select>
          <button
            className={`connection-chip ${isOnline ? "online" : "offline"}`}
            onClick={() => go("Connectivity Operations")}
          >
            <i />
            {isOnline ? "Control plane online" : "Console offline"}
          </button>
          <button
            className="icon-btn"
            onClick={() => act("You have 5 new operational alerts.")}
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span>5</span>
          </button>
          <button className="profile" onClick={() => go("Roles & Access")}>
            <div className="avatar small">AF</div>
            <span>Aisha</span>
          </button>
        </header>
        <div className="page-head">
          <div>
            <p className="eyebrow">Prospeva control plane</p>
            <h1>{page}</h1>
            <p>{desc[page]}</p>
          </div>
          <div className="head-actions">
            <Button
              variant="outline"
              onClick={() => act("Platform data refreshed just now.")}
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
            <Button onClick={() => setAiOpen(true)}>
              <Sparkles size={16} />
              Ask ProspevaAI
            </Button>
          </div>
        </div>
        <div className="content">
          <PageContent
            page={page}
            query={query}
            go={go}
            select={setSelected}
            act={act}
          />
        </div>
        <footer>
          <span>Prospeva Admin Control</span>
          <span>Production • Liberia • UTC</span>
          <span>Last sync: just now</span>
        </footer>
      </main>
      <button className="ai-launcher" onClick={() => setAiOpen(true)}>
        <Sparkles size={18} />
        ProspevaAI
      </button>
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="record-sheet">
          <SheetHeader>
            <SheetTitle>
              {selected?.[1] || selected?.[0] || "Record details"}
            </SheetTitle>
            <SheetDescription>
              Authoritative Prospeva record and connected activity.
            </SheetDescription>
          </SheetHeader>
          {selected && (
            <div className="sheet-body">
              <div className="identity-card">
                <div className="avatar large">
                  {String(selected[1] || selected[0])
                    .split(" ")
                    .map((x) => x[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <h3>{selected[1] || selected[0]}</h3>
                  <Status value={selected[selected.length - 1]} />
                </div>
              </div>
              <dl>
                {selected.map((v, i) => (
                  <div key={i}>
                    <dt>
                      {[
                        "Reference",
                        "Name / type",
                        "Subject",
                        "Value",
                        "Route",
                        "Status",
                      ][i] || `Field ${i + 1}`}
                    </dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <Panel title="Connected controls">
                <div className="control-list">
                  <button onClick={() => act("Activity timeline opened.")}>
                    View activity timeline
                    <ChevronRight />
                  </button>
                  <button onClick={() => act("Verification evidence opened.")}>
                    Review verification evidence
                    <ChevronRight />
                  </button>
                  <button
                    onClick={() =>
                      act("Draft action created for maker-checker approval.")
                    }
                  >
                    Create controlled action
                    <ChevronRight />
                  </button>
                </div>
              </Panel>
            </div>
          )}
        </SheetContent>
      </Sheet>
      <Sheet open={aiOpen} onOpenChange={setAiOpen}>
        <SheetContent className="ai-sheet">
          <SheetHeader>
            <SheetTitle>
              <Sparkles size={18} />
              ProspevaAI Control Copilot
            </SheetTitle>
            <SheetDescription>
              Analyzes permitted data. It cannot approve or release funds.
            </SheetDescription>
          </SheetHeader>
          <div className="ai-scope">
            <Pill tone="blue">Role: Super Admin</Pill>
            <Pill>Scope: Liberia</Pill>
            <Pill tone="green">Read access active</Pill>
          </div>
          <div className="ai-prompts">
            <button onClick={() => setAiInput("Show the highest risk case")}>
              Highest risk case
            </button>
            <button
              onClick={() => setAiInput("Compare PAPSS and Onafriq routes")}
            >
              Compare rails
            </button>
            <button
              onClick={() => setAiInput("Summarize reconciliation issues")}
            >
              Reconciliation summary
            </button>
          </div>
          <div className="messages">
            {messages.map((m, i) => (
              <div className={`message ${m.who}`} key={i}>
                {m.who === "ai" && <Bot size={17} />}
                <p>{m.text}</p>
              </div>
            ))}
          </div>
          <div className="ai-compose">
            <Input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendAI()}
              placeholder="Ask about operations, risk, rails or cases…"
            />
            <Button onClick={sendAI}>Send</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function PageContent({
  page,
  query,
  go,
  select,
  act,
}: {
  page: Page;
  query: string;
  go: (p: Page) => void;
  select: (x: any[]) => void;
  act: (s: string) => void;
}) {
  if (page === "Overview") return <Overview go={go} select={select} />;
  if (page === "Customers")
    return (
      <Directory kind="customers" query={query} select={select} act={act} />
    );
  if (page === "Organizations")
    return (
      <Directory kind="organizations" query={query} select={select} act={act} />
    );
  if (page === "Transactions")
    return (
      <Directory kind="transactions" query={query} select={select} act={act} />
    );
  if (page === "Payment Rails") return <Rails act={act} />;
  if (page === "Connectivity Operations")
    return <ConnectivityOperations act={act} select={select} />;
  if (page === "Risk & Fraud") return <Risk select={select} act={act} />;
  if (page === "Approvals") return <Approvals select={select} act={act} />;
  if (page === "Loan Eligibility")
    return <LoanEligibility select={select} act={act} />;
  if (page === "Feature Controls") return <FeatureControls act={act} />;
  if (page === "ProspevaAI") return <AIPage act={act} />;
  if (page === "Employers") return <WorkforceSync select={select} act={act} />;
  if (page === "Onboarding & KYC")
    return <AgentKycQueue select={select} act={act} />;
  return <OperationsPage page={page} select={select} act={act} />;
}

function AgentKycQueue({
  select,
  act,
}: {
  select: (x: any[]) => void;
  act: (s: string) => void;
}) {
  const initial = [
    {
      id: "AGT-KYC-2084",
      name: "Kelvin Fallah",
      location: "Sinkor, Monrovia",
      currencies: "LRD + USD",
      checks: "NIR • location • source of float",
      submitted: "Just now",
      status: "Review",
    },
    {
      id: "KYC-3108",
      name: "Faith Medical Clinic",
      location: "Congo Town",
      currencies: "Organization",
      checks: "KYB • owners • settlement",
      submitted: "Today 09:14",
      status: "Review",
    },
    {
      id: "KYC-3104",
      name: "Abraham Doe",
      location: "Broad Street",
      currencies: "LRD",
      checks: "NIR • location • source of float",
      submitted: "Today 08:42",
      status: "Review",
    },
    {
      id: "KYC-3099",
      name: "Hope Academy",
      location: "Paynesville",
      currencies: "Organization",
      checks: "KYB • banking",
      submitted: "Yesterday",
      status: "Escalated",
    },
  ];
  const [cases, setCases] = useState(initial),
    [filter, setFilter] = useState("all");
  const update = (id: string, status: string) => {
    setCases((all) => all.map((c) => (c.id === id ? { ...c, status } : c)));
    act(`${id} ${status.toLowerCase()} and recorded in the audit log.`);
  };
  const shown = cases.filter(
    (c) => filter === "all" || c.status.toLowerCase() === filter,
  );
  return (
    <section className="agent-kyc-workspace">
      <div className="metrics compact">
        <Metric
          label="Pending agent reviews"
          value={String(cases.filter((c) => c.status === "Review").length)}
          delta="Mobile and web applications"
          icon={Store}
        />
        <Metric
          label="Approved this week"
          value="48"
          delta="96% first-pass"
          icon={BadgeCheck}
          tone="green"
        />
        <Metric
          label="Escalated"
          value={String(cases.filter((c) => c.status === "Escalated").length)}
          delta="Compliance review"
          icon={AlertTriangle}
          tone="amber"
        />
      </div>
      <div className="kyc-toolbar">
        <div>
          <p className="eyebrow">AGENT ONBOARDING</p>
          <h2>Identity, location and float verification</h2>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cases</SelectItem>
            <SelectItem value="review">Needs review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="kyc-cards">
        {shown.map((c) => (
          <article key={c.id}>
            <header>
              <span>
                <Store />
              </span>
              <div>
                <small>{c.id}</small>
                <h3>{c.name}</h3>
                <p>{c.location}</p>
              </div>
              <Status value={c.status} />
            </header>
            <dl>
              <div>
                <dt>Service currencies</dt>
                <dd>{c.currencies}</dd>
              </div>
              <div>
                <dt>Required evidence</dt>
                <dd>{c.checks}</dd>
              </div>
              <div>
                <dt>Submitted</dt>
                <dd>{c.submitted}</dd>
              </div>
            </dl>
            <div className="kyc-actions">
              <Button
                variant="outline"
                onClick={() =>
                  select([
                    c.id,
                    c.name,
                    "Prospeva Agent",
                    c.checks,
                    c.submitted,
                    c.status,
                  ])
                }
              >
                Review evidence
              </Button>
              <Button
                variant="outline"
                onClick={() => update(c.id, "Returned")}
              >
                Return
              </Button>
              <Button
                onClick={() => update(c.id, "Approved")}
                disabled={c.status === "Approved"}
              >
                Approve agent
              </Button>
            </div>
          </article>
        ))}
      </div>
      <div className="kyc-policy">
        <ShieldCheck />
        <div>
          <b>
            Approval activates the Agent workspace only after every required
            check passes.
          </b>
          <p>
            Customer cash visibility remains off until float, location,
            operating hours and LRD/USD availability are configured.
          </p>
        </div>
      </div>
    </section>
  );
}

function ConnectivityOperations({
  act,
  select,
}: {
  act: (s: string) => void;
  select: (x: any[]) => void;
}) {
  const [liteEnabled, setLiteEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const queue = [
    ["OFF-82041", "Personal transfer draft", "USSD", "LRD 4,500", "12 min", "Waiting for connection"],
    ["OFF-82039", "Agent withdrawal code", "Agent network", "USD 85.00", "8 min", "Awaiting validation"],
    ["OFF-82034", "Employer attendance batch", "Device sync", "34 events", "5 min", "Ready to synchronize"],
    ["OFF-82028", "Susu contribution", "SMS", "LRD 2,000", "18 min", "Needs customer review"],
  ];
  return (
    <>
      <div className="route-banner">
        <div><Network/><span><b>Offline-channel control is active</b><small>Server confirmation remains authoritative across mobile, Business and Employer products.</small></span></div>
        <Pill tone="green">4 channels monitored</Pill>
      </div>
      <div className="metrics compact">
        <Metric label="Queued instructions" value="17" delta="None marked completed" icon={RefreshCw} tone="amber"/>
        <Metric label="Lite channel success" value="98.7%" delta="USSD + SMS acknowledgements" icon={BadgeCheck} tone="green"/>
        <Metric label="Duplicate attempts stopped" value="6" delta="Last 24 hours" icon={ShieldAlert} tone="red"/>
      </div>
      <div className="connectivity-grid">
        <Panel title="Channel controls">
          <div className="connectivity-switch"><Network/><span><b>Prospeva Lite · USSD/SMS</b><small>Feature-phone initiation and status checks</small></span><Switch checked={liteEnabled} onCheckedChange={v=>{setLiteEnabled(v);act(`Lite channel ${v?"enabled":"paused"} — approval recorded.`)}}/></div>
          <div className="connectivity-switch"><RefreshCw/><span><b>Automatic synchronization</b><small>Revalidate expiry, identity, balance and idempotency</small></span><Switch checked={autoSync} onCheckedChange={v=>{setAutoSync(v);act(`Automatic synchronization ${v?"enabled":"paused"}.`)}}/></div>
          <div className="connectivity-switch"><Store/><span><b>Agent cash channel</b><small>Six-digit code validation and live cash availability</small></span><Status value="Operational"/></div>
          <div className="connectivity-switch"><ShieldCheck/><span><b>High-risk offline release</b><small>Payroll, bulk payouts and privileged approvals</small></span><Status value="Restricted"/></div>
        </Panel>
        <Panel title="Safety policy">
          <div className="offline-policy">{["Never show Completed before ledger confirmation","Reject expired or replayed codes","Detect duplicates before submission","Preserve original device timestamps","Require online maker-checker for bulk money movement"].map(x=><p key={x}><BadgeCheck/>{x}</p>)}</div>
          <div className="button-row"><Button variant="outline" onClick={()=>act("Offline policy opened.")}>Review policy</Button><Button variant="outline" onClick={()=>act("Recovery drill started in sandbox.")}>Run recovery drill</Button></div>
        </Panel>
      </div>
      <Panel title="Cross-portal synchronization queue" action={<Button variant="outline" onClick={()=>act("Queue refreshed and checked for duplicates.")}><RefreshCw size={15}/>Refresh queue</Button>}>
        <DataTable headers={["Reference","Instruction","Channel","Value","Age","State"]} rows={queue} select={select}/>
      </Panel>
      <section className="ecosystem-standard" aria-label="Prospeva ecosystem standards">
        <div><small>PRODUCT BOUNDARIES</small><b>Personal: Mobile · Organizations: Business · Employers: Employer · Oversight: Admin</b><p>One Prospeva identity may connect approved workspaces without mixing profiles, permissions or balances.</p></div>
        <div><small>SHARED TRANSACTION STATES</small><b>Draft · Waiting for connection · Submitted · Processing · Completed · Failed · Reversed</b><p>Settlement and reconciliation remain separate operational substatuses.</p></div>
        <div><small>MANDATORY DISCLOSURE</small><b>Rail · FX rate · Prospeva fee · Partner fee · Total debit · Recipient amount · Settlement estimate</b><p>Admin exceptions identify any channel that omits or conflicts with this pre-authorization breakdown.</p></div>
      </section>
    </>
  );
}

function Overview({
  go,
  select,
}: {
  go: (p: Page) => void;
  select: (x: any[]) => void;
}) {
  return (
    <>
      <div className="metrics">
        <Metric
          label="Verified users"
          value="128,460"
          delta="+4.8% this month"
          icon={Users}
        />
        <Metric
          label="24h payment value"
          value="LRD 46.8M"
          delta="USD 284,920 equivalent"
          icon={CircleDollarSign}
          tone="green"
        />
        <Metric
          label="Settlement rate"
          value="99.72%"
          delta="Across 18,294 instructions"
          icon={Gauge}
        />
        <Metric
          label="Open control cases"
          value="27"
          delta="6 require action today"
          icon={ShieldAlert}
          tone="red"
        />
      </div>
      <div className="attention">
        <div className="attention-icon">
          <AlertTriangle />
        </div>
        <div>
          <b>
            3 reconciliation breaks require action before the 16:00 settlement
            window
          </b>
          <p>
            Two Onafriq card settlements and one mobile-money payout differ from
            the Prospeva ledger.
          </p>
        </div>
        <Button onClick={() => go("Reconciliation")}>Review breaks</Button>
      </div>
      <div className="grid-main">
        <Panel
          title="Money movement — last 7 days"
          action={
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All currencies</SelectItem>
                <SelectItem value="lrd">LRD</SelectItem>
                <SelectItem value="usd">USD</SelectItem>
              </SelectContent>
            </Select>
          }
        >
          <div className="chart">
            <div className="chart-total">
              <span>Processed value</span>
              <strong>LRD 294.6M</strong>
              <em>+12.4%</em>
            </div>
            <div className="bars">
              {[45, 68, 54, 79, 62, 88, 73].map((h, i) => (
                <div key={i}>
                  <span style={{ height: `${h}%` }} />
                  <b>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</b>
                </div>
              ))}
            </div>
          </div>
          <div className="legend">
            <span>
              <i className="blue-dot" />
              Domestic 61%
            </span>
            <span>
              <i className="green-dot" />
              Cross-border 22%
            </span>
            <span>
              <i className="amber-dot" />
              Cards & bills 17%
            </span>
          </div>
        </Panel>
        <Panel
          title="Rail health"
          action={
            <button className="text-action" onClick={() => go("Payment Rails")}>
              View routing <ChevronRight />
            </button>
          }
        >
          <div className="rail-list">
            {rails.slice(0, 4).map((r) => (
              <button key={r.name} onClick={() => go("Payment Rails")}>
                <div className="rail-logo">
                  <Network size={18} />
                </div>
                <div>
                  <b>{r.name}</b>
                  <span>{r.role}</span>
                </div>
                <Status value={r.status} />
                <strong>{r.rate}</strong>
              </button>
            ))}
          </div>
        </Panel>
      </div>
      <div className="grid-main lower">
        <Panel
          title="Latest transactions"
          action={
            <button className="text-action" onClick={() => go("Transactions")}>
              View all <ChevronRight />
            </button>
          }
        >
          <DataTable
            headers={[
              "Reference",
              "Type",
              "Party",
              "Amount",
              "Route",
              "Status",
            ]}
            rows={txs.slice(0, 4)}
            select={select}
          />
        </Panel>
        <Panel
          title="Approval queue"
          action={
            <button className="text-action" onClick={() => go("Approvals")}>
              Open queue <ChevronRight />
            </button>
          }
        >
          <div className="approval-list">
            {queue.slice(0, 3).map((q) => (
              <button key={q[0]} onClick={() => select(q)}>
                <div>
                  <b>{q[1]}</b>
                  <span>
                    {q[2]} • {q[3]}
                  </span>
                </div>
                <Pill
                  tone={
                    q[5] === "Ready"
                      ? "green"
                      : q[5] === "High"
                        ? "red"
                        : "amber"
                  }
                >
                  {q[4]}
                </Pill>
              </button>
            ))}
          </div>
          <Button
            className="full"
            variant="outline"
            onClick={() => go("Approvals")}
          >
            Review all approvals
          </Button>
        </Panel>
      </div>
      <div className="insight">
        <div>
          <Sparkles />
          <span>ProspevaAI insight</span>
        </div>
        <p>
          Successful PAPSS routing saved an estimated <b>USD 1,284</b> in
          partner fees this week. Card failures increased 1.9% after 18:00
          yesterday.
        </p>
        <button onClick={() => go("ProspevaAI")}>
          Investigate <ChevronRight />
        </button>
      </div>
    </>
  );
}

function Toolbar({
  placeholder,
  act,
}: {
  placeholder: string;
  act: (s: string) => void;
}) {
  return (
    <div className="toolbar">
      <div>
        <Search size={18} />
        <Input placeholder={placeholder} />
      </div>
      <Select defaultValue="all">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="review">Needs review</SelectItem>
          <SelectItem value="held">Held / restricted</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        onClick={() => act("Export request sent for approval.")}
      >
        Export
      </Button>
    </div>
  );
}
function Directory({
  kind,
  query,
  select,
  act,
}: {
  kind: "customers" | "organizations" | "transactions";
  query: string;
  select: (x: any[]) => void;
  act: (s: string) => void;
}) {
  let rows: string[][], headers: string[], placeholder: string;
  if (kind === "customers") {
    rows = [
      [
        "CUS-84201",
        "Kelvin Fallah",
        "Personal • Employer linked",
        "LRD + USD + USDC",
        "Verified",
        "Low",
      ],
      [
        "CUS-84194",
        "Martha Konah",
        "Personal • Merchant",
        "LRD + USD",
        "Verified",
        "Low",
      ],
      ["CUS-84172", "Samuel Kromah", "Personal", "USD", "Restricted", "High"],
      [
        "CUS-84161",
        "Hawa Sheriff",
        "Personal • Susu member",
        "LRD + USD",
        "Review",
        "Medium",
      ],
      [
        "CUS-84133",
        "Fatu Brown",
        "Personal • Church member",
        "LRD",
        "Verified",
        "Low",
      ],
    ];
    headers = ["Customer ID", "Customer", "Profiles", "Wallets", "KYC", "Risk"];
    placeholder = "Search name, phone, NIR or ProspevaTag";
  } else if (kind === "organizations") {
    rows = orgs;
    headers = ["Organization", "Type", "Scale", "Status", "30-day value"];
    placeholder = "Search organizations or license numbers";
  } else {
    rows = txs;
    headers = ["Reference", "Type", "Parties", "Amount", "Rail", "Status"];
    placeholder = "Search transaction, reference or destination";
  }
  rows = rows.filter((r) =>
    r.join(" ").toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <Toolbar placeholder={placeholder} act={act} />
      {kind === "organizations" && (
        <div className="type-strip">
          {[
            ["Employers", "412"],
            ["Merchants", "2,840"],
            ["Lenders", "18"],
            ["Agents", "326"],
            ["Schools", "147"],
            ["Churches", "204"],
            ["Hospitals", "63"],
            ["Landlords", "518"],
            ["Susu groups", "1,092"],
          ].map((x) => (
            <button onClick={() => act(`${x[0]} filter applied.`)} key={x[0]}>
              <b>{x[1]}</b>
              <span>{x[0]}</span>
            </button>
          ))}
        </div>
      )}
      <div className="metrics compact">
        <Metric
          label={
            kind === "customers"
              ? "Total customers"
              : kind === "transactions"
                ? "Today’s instructions"
                : "Verified organizations"
          }
          value={
            kind === "customers"
              ? "128,460"
              : kind === "transactions"
                ? "18,294"
                : "5,620"
          }
          delta="Current production view"
          icon={Users}
        />
        <Metric
          label={kind === "transactions" ? "Pending" : "Active & operational"}
          value={kind === "transactions" ? "84" : "99.4%"}
          delta="Within expected range"
          icon={BadgeCheck}
          tone="green"
        />
        <Metric
          label="Requires action"
          value={kind === "transactions" ? "37" : "12"}
          delta="Open control queue"
          icon={AlertTriangle}
          tone="amber"
        />
      </div>
      <Panel title={`${kind[0].toUpperCase() + kind.slice(1)} directory`}>
        <DataTable headers={headers} rows={rows} select={select} />
      </Panel>
    </>
  );
}

function Rails({ act }: { act: (s: string) => void }) {
  const [auto, setAuto] = useState(true);
  return (
    <>
      <div className="route-banner">
        <div>
          <Network />
          <span>
            <b>Smart routing is {auto ? "active" : "paused"}</b>
            <small>
              Prospeva selects cost, currency support, reliability and delivery
              speed.
            </small>
          </span>
        </div>
        <Switch
          checked={auto}
          onCheckedChange={(v) => {
            setAuto(v);
            act(
              v
                ? "Smart routing activated."
                : "Smart routing pause sent for approval.",
            );
          }}
        />
      </div>
      <div className="rail-cards">
        {rails.map((r) => (
          <Panel
            title={r.name}
            key={r.name}
            action={<Status value={r.status} />}
          >
            <p className="muted">{r.role}</p>
            <div className="rail-stats">
              <div>
                <span>Success</span>
                <b>{r.rate}</b>
              </div>
              <div>
                <span>Median delivery</span>
                <b>{r.latency}</b>
              </div>
              <div>
                <span>Currencies</span>
                <b>{r.currencies}</b>
              </div>
            </div>
            <Progress value={parseFloat(r.rate)} />
            <div className="button-row">
              <Button
                variant="outline"
                onClick={() => act(`${r.name} route details opened.`)}
              >
                View route
              </Button>
              <Button
                variant="outline"
                onClick={() => act(`${r.name} test instruction queued.`)}
              >
                Send test
              </Button>
            </div>
          </Panel>
        ))}
      </div>
      <Panel title="Customer disclosure standard">
        <div className="disclosures">
          {[
            "Payment rail selected",
            "Exchange rate and source",
            "Prospeva fee",
            "Partner / network fee",
            "Total payer debit",
            "Exact recipient amount",
            "Settlement estimate",
          ].map((x) => (
            <span key={x}>
              <BadgeCheck size={16} />
              {x}
            </span>
          ))}
        </div>
      </Panel>
    </>
  );
}
function Risk({
  select,
  act,
}: {
  select: (x: any[]) => void;
  act: (s: string) => void;
}) {
  const [ghost, setGhost] = useState(true);
  return (
    <>
      <div className="route-banner risk">
        <div>
          <ShieldAlert />
          <span>
            <b>Ghost-name prevention is {ghost ? "enforced" : "paused"}</b>
            <small>
              NIR match, liveness, employer roster, attendance and
              duplicate-destination controls.
            </small>
          </span>
        </div>
        <Switch
          checked={ghost}
          onCheckedChange={(v) => {
            setGhost(v);
            act(
              v
                ? "Ghost-name controls enforced."
                : "Pause request sent for Compliance approval.",
            );
          }}
        />
      </div>
      <div className="metrics compact">
        <Metric
          label="Critical cases"
          value="2"
          delta="Funds held automatically"
          icon={ShieldAlert}
          tone="red"
        />
        <Metric
          label="Payroll identities checked"
          value="18,906"
          delta="99.4% passed"
          icon={BadgeCheck}
          tone="green"
        />
        <Metric
          label="Prevented exposure"
          value="LRD 2.84M"
          delta="Last 30 days"
          icon={ShieldCheck}
        />
      </div>
      <Panel title="Risk investigation queue">
        <DataTable
          headers={[
            "Case",
            "Signal",
            "Subject",
            "Severity",
            "Evidence",
            "State",
          ]}
          rows={riskCases}
          select={select}
        />
      </Panel>
    </>
  );
}
function Approvals({
  select,
  act,
}: {
  select: (x: any[]) => void;
  act: (s: string) => void;
}) {
  return (
    <>
      <div className="metrics compact">
        <Metric
          label="Waiting for me"
          value="9"
          delta="3 high-priority"
          icon={ClipboardCheck}
        />
        <Metric
          label="Approved today"
          value="24"
          delta="Median 18 minutes"
          icon={BadgeCheck}
          tone="green"
        />
        <Metric
          label="Expiring soon"
          value="2"
          delta="Within 45 minutes"
          icon={AlertTriangle}
          tone="amber"
        />
      </div>
      <Panel title="Maker-checker approval queue">
        <DataTable
          headers={["Approval", "Action", "Value", "Owner", "Checks", "Risk"]}
          rows={queue}
          select={select}
        />
      </Panel>
      <Panel title="Approval policy">
        <div className="policy-grid">
          {[
            "Fund release",
            "Account restriction",
            "Rail or fee change",
            "Organization activation",
            "Data export",
            "Role elevation",
          ].map((p, i) => (
            <div key={p}>
              <ShieldCheck />
              <span>
                <b>{p}</b>
                <small>
                  {i < 2
                    ? "3 approvers • Risk + Compliance"
                    : "2 approvers • Assigned functions"}
                </small>
              </span>
              <Button
                variant="outline"
                onClick={() => act(`${p} policy opened.`)}
              >
                Review
              </Button>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
function AIPage({ act }: { act: (s: string) => void }) {
  return (
    <div className="ai-page">
      <div className="ai-hero">
        <div className="orb">
          <Sparkles />
        </div>
        <div>
          <Pill tone="blue">Control Copilot</Pill>
          <h2>Ask ProspevaAI about the platform</h2>
          <p>
            Analyze operational data, surface anomalies and draft controlled
            actions. ProspevaAI cannot release funds, approve itself or bypass
            role permissions.
          </p>
        </div>
      </div>
      <div className="ai-grid">
        {[
          [
            "Payment operations",
            "Compare PAPSS, Onafriq and domestic routes by cost, reliability and delivery.",
          ],
          [
            "Risk investigation",
            "Summarize linked identities, devices, destinations and behavior signals.",
          ],
          [
            "Support assistance",
            "Build a case timeline and draft a customer-safe response.",
          ],
          [
            "Payroll oversight",
            "Explain funding, PAYE, deductions, ghost-name holds and failed destinations.",
          ],
          [
            "Reconciliation",
            "Locate ledger differences and propose the next non-duplicating action.",
          ],
          [
            "Executive insight",
            "Summarize growth, revenue, service levels and emerging risk.",
          ],
        ].map((x) => (
          <button
            key={x[0]}
            onClick={() => act(`${x[0]} workspace opened in ProspevaAI.`)}
          >
            <Sparkles />
            <b>{x[0]}</b>
            <span>{x[1]}</span>
            <ChevronRight />
          </button>
        ))}
      </div>
    </div>
  );
}

function LoanEligibility({
  select,
  act,
}: {
  select: (x: any[]) => void;
  act: (s: string) => void;
}) {
  const [enforced, setEnforced] = useState(true);
  const rows = [
    [
      "CUS-84201",
      "Kelvin Fallah",
      "Verified • active",
      "Confirmed • monthly",
      "Active",
      "Eligible for assessment",
    ],
    [
      "CUS-84194",
      "Martha Konah",
      "Not linked",
      "None",
      "Not requested",
      "Marketplace unavailable",
    ],
    [
      "CUS-84172",
      "Samuel Kromah",
      "Former employer",
      "Inactive",
      "Expired",
      "New offers blocked",
    ],
    [
      "CUS-84161",
      "Hawa Sheriff",
      "Verified • active",
      "Confirmed • biweekly",
      "Active",
      "Pre-approved",
    ],
    [
      "CUS-84133",
      "Fatu Brown",
      "Not linked",
      "None",
      "Not requested",
      "Marketplace unavailable",
    ],
    [
      "CUS-84092",
      "Abraham Doe",
      "Verified • active",
      "Confirmed • monthly",
      "Active",
      "Lender approved",
    ],
  ];
  return (
    <>
      <div className="route-banner">
        <div>
          <ShieldCheck />
          <span>
            <b>
              Employee-only loan eligibility is{" "}
              {enforced ? "enforced" : "paused"}
            </b>
            <small>
              A Prospeva personal account alone never creates pre-approval or
              Loan Marketplace access.
            </small>
          </span>
        </div>
        <Switch
          checked={enforced}
          onCheckedChange={(v) => {
            setEnforced(v);
            act(
              v
                ? "Employee-only eligibility enforced."
                : "Pause request sent for Risk and Compliance approval.",
            );
          }}
        />
      </div>
      <div className="eligibility-steps">
        {[
          ["1", "Personal account", "May remain standalone"],
          ["2", "Employment verified", "Active employer relationship"],
          ["3", "Payroll confirmed", "Processed through Prospeva"],
          ["4", "Consent active", "Purpose-bound data access"],
          ["5", "Eligibility assessed", "Affordability and policy"],
          ["6", "Lender decision", "Approved or declined"],
        ].map((s, i) => (
          <div key={s[0]}>
            <i>{s[0]}</i>
            <span>
              <b>{s[1]}</b>
              <small>{s[2]}</small>
            </span>
            {i < 5 && <ChevronRight />}
          </div>
        ))}
      </div>
      <div className="metrics compact">
        <Metric
          label="Standalone personal accounts"
          value="79,840"
          delta="No employee loan access"
          icon={Users}
        />
        <Metric
          label="Eligible for assessment"
          value="31,406"
          delta="Verified payroll + consent"
          icon={BadgeCheck}
          tone="green"
        />
        <Metric
          label="New offers blocked"
          value="1,284"
          delta="Inactive employment or consent"
          icon={ShieldAlert}
          tone="red"
        />
      </div>
      <div className="action-strip">
        <Button onClick={() => act("Eligibility exception review opened.")}>
          Review eligibility exceptions
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            act(
              "Incorrect pre-approval scan completed: 3 records require review.",
            )
          }
        >
          Scan incorrect pre-approvals
        </Button>
        <Button
          variant="outline"
          onClick={() => act("Lender data-access policy opened.")}
        >
          Review lender data policy
        </Button>
      </div>
      <Panel
        title="Customer loan-access controls"
        action={
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All eligibility states</SelectItem>
              <SelectItem value="standalone">Standalone personal</SelectItem>
              <SelectItem value="eligible">Eligible employees</SelectItem>
              <SelectItem value="blocked">Blocked offers</SelectItem>
            </SelectContent>
          </Select>
        }
      >
        <DataTable
          headers={[
            "Customer",
            "Name",
            "Employer link",
            "Payroll",
            "Consent",
            "Loan status",
          ]}
          rows={rows}
          select={select}
        />
      </Panel>
      <div className="loan-rule">
        <ShieldAlert />
        <div>
          <b>Hard control</b>
          <p>
            If employment ends, payroll becomes inactive or consent is
            withdrawn, Prospeva stops new offers immediately. Existing lawful
            repayment obligations remain visible and manageable.
          </p>
        </div>
      </div>
    </>
  );
}

function FeatureControls({ act }: { act: (s: string) => void }) {
  const initial = [true, true, true, true, false, false, true, true];
  const [states, setStates] = useState(initial);
  const features = [
    [
      "PAPSS cross-border",
      "Liberia • Ghana • Nigeria",
      "African currencies",
      "PAPSS",
    ],
    [
      "Onafriq remittances",
      "Liberia • 18 corridors",
      "LRD • USD • local",
      "Onafriq",
    ],
    ["Agent cash reservations", "Liberia", "LRD • USD", "Prospeva Agents"],
    ["Employer payroll", "Liberia", "LRD • USD", "IIPS / NEPS"],
    ["Tap on Phone", "Pilot merchants", "USD", "Card acquirer"],
    ["USDC settlement", "Approved profiles", "USDC", "Digital asset partner"],
    ["Bill payments", "Liberia", "LRD • USD", "Direct + VAS"],
    ["Prospeva Lite", "Liberia", "LRD", "USSD • SMS"],
  ];
  return (
    <>
      <div className="route-banner">
        <div>
          <SlidersHorizontal />
          <span>
            <b>Country and service controls</b>
            <small>
              Changes are staged, impact-checked and require maker-checker
              approval before production.
            </small>
          </span>
        </div>
        <Pill tone="amber">2 draft changes</Pill>
      </div>
      <div className="feature-grid">
        {features.map((f, i) => (
          <Panel
            key={f[0]}
            title={f[0]}
            action={
              <Switch
                checked={states[i]}
                onCheckedChange={(v) => {
                  setStates((s) => s.map((x, j) => (j === i ? v : x)));
                  act(`${f[0]} change staged for approval.`);
                }}
              />
            }
          >
            <dl>
              <div>
                <dt>Availability</dt>
                <dd>{f[1]}</dd>
              </div>
              <div>
                <dt>Currencies</dt>
                <dd>{f[2]}</dd>
              </div>
              <div>
                <dt>Provider</dt>
                <dd>{f[3]}</dd>
              </div>
            </dl>
            <div className="feature-state">
              <Status value={states[i] ? "Active" : "Pilot / unavailable"} />
              <Button
                variant="outline"
                onClick={() => act(`${f[0]} targeting rules opened.`)}
              >
                Configure
              </Button>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}

const workspaces: Record<
  string,
  {
    metrics: [string, string, string][];
    headers: string[];
    rows: string[][];
    controls: string[];
  }
> = {
  "Exception Center": {
    metrics: [
      ["Open exceptions", "27", "6 require action today"],
      ["Financial exposure", "LRD 3.12M", "USD 8,670 equivalent"],
      ["SLA at risk", "4", "Escalates within 60 minutes"],
    ],
    headers: [
      "Exception",
      "Category",
      "Affected party",
      "Impact",
      "Owner",
      "Status",
    ],
    rows: [
      [
        "EXC-9102",
        "Payroll identity",
        "Monrovia Business Group",
        "6 employees held",
        "Risk Ops",
        "Critical",
      ],
      [
        "EXC-9098",
        "Settlement break",
        "Onafriq Card",
        "USD 770 unmatched",
        "Reconciliation",
        "High",
      ],
      [
        "EXC-9092",
        "Insufficient funding",
        "Golden Coast Logistics",
        "LRD 4.8M gap",
        "Payroll Ops",
        "Open",
      ],
      [
        "EXC-9087",
        "Vendor delivery",
        "DStv",
        "118 activations delayed",
        "Partner Ops",
        "Monitoring",
      ],
      [
        "EXC-9081",
        "Expired KYC",
        "Agent Broad Street",
        "Cash-out restricted",
        "Compliance",
        "Review",
      ],
    ],
    controls: [
      "Open priority worklist",
      "Assign exception",
      "Escalate to incident",
      "Ask ProspevaAI to prioritize",
    ],
  },
  "Employer 360": {
    metrics: [
      ["Selected employer", "Monrovia Business Group", "Verified since 2025"],
      ["Workforce", "248", "242 payroll-ready"],
      ["Reliability score", "91 / 100", "Consistent payer"],
    ],
    headers: [
      "Area",
      "Current position",
      "Last activity",
      "Control owner",
      "Next requirement",
      "Status",
    ],
    rows: [
      [
        "Payroll",
        "August 2026 • LRD/USD",
        "Calculated 10:06",
        "Finance",
        "Fund LRD 1.54M gap",
        "Awaiting funding",
      ],
      [
        "Employees",
        "248 active • 6 held",
        "Synced 09:48",
        "HR",
        "Resolve duplicate destinations",
        "Review",
      ],
      [
        "Attendance",
        "241 approved • 7 exceptions",
        "Approved 08:52",
        "Supervisors",
        "Finalize 7 records",
        "Open",
      ],
      [
        "Leave",
        "14 approved • 2 pending",
        "Updated yesterday",
        "HR",
        "Review manager decisions",
        "Open",
      ],
      [
        "Benefits",
        "216 enrolled",
        "Synced Aug 28",
        "HR + Finance",
        "7 elections pending",
        "Active",
      ],
      [
        "Payroll loans",
        "96 active",
        "Reconciled Aug 31",
        "Finance",
        "2 deduction exceptions",
        "Review",
      ],
      [
        "Microsoft 365",
        "SharePoint + Entra ID",
        "Connected Sep 4",
        "IT Admin",
        "None",
        "Connected",
      ],
    ],
    controls: [
      "Switch employer",
      "Open all employees",
      "Review payroll funding",
      "Manage authorized officers",
      "Open support history",
      "View connected systems",
    ],
  },
  "View as User": {
    metrics: [
      ["Active support views", "3", "All read-only"],
      ["Sessions today", "28", "100% reason-coded"],
      ["Elevated requests", "2", "Awaiting approval"],
    ],
    headers: [
      "Session",
      "Staff member",
      "Viewed as",
      "Reason",
      "Expires",
      "Status",
    ],
    rows: [
      [
        "VAS-3028",
        "Mary Johnson",
        "Kelvin Fallah • Personal",
        "Deposit support case SUP-7318",
        "11 minutes",
        "Active",
      ],
      [
        "VAS-3024",
        "James Doe",
        "Monrovia Business Group • Employer",
        "Payroll funding issue",
        "Ended 10:12",
        "Closed",
      ],
      [
        "VAS-3019",
        "J. Kollie",
        "Stop & Shop • Merchant",
        "Settlement mismatch",
        "Ended 09:44",
        "Closed",
      ],
    ],
    controls: [
      "Start audited read-only view",
      "Search user or organization",
      "Request temporary elevated support",
      "Review session history",
    ],
  },
  "Ledger Explorer": {
    metrics: [
      ["Selected transaction", "TX-894198", "Cross-border transfer"],
      ["Ledger balanced", "Yes", "7 entries • zero difference"],
      ["Settlement estimate", "42 seconds", "PAPSS selected"],
    ],
    headers: [
      "Sequence",
      "Ledger entry",
      "Currency",
      "Debit",
      "Credit",
      "Reference",
    ],
    rows: [
      ["1", "Payer wallet", "USD", "425.00", "—", "WAL-MARTHA-USD"],
      ["2", "Prospeva fee receivable", "USD", "—", "1.49", "FEE-894198"],
      ["3", "PAPSS network payable", "USD", "—", "0.50", "NET-894198"],
      ["4", "FX clearing position", "USD", "—", "423.01", "FX-894198-USD"],
      ["5", "FX clearing position", "GHS", "6,104.00", "—", "FX-894198-GHS"],
      [
        "6",
        "Recipient settlement payable",
        "GHS",
        "—",
        "6,104.00",
        "PAPSS-73190",
      ],
      ["7", "Recipient confirmed", "GHS", "6,104.00", "—", "DST-FATU-GHS"],
    ],
    controls: [
      "Trace another transaction",
      "Open fee and FX disclosure",
      "Compare partner settlement",
      "Create reconciliation case",
    ],
  },
  "Incident Command": {
    metrics: [
      ["Active incidents", "1", "External card degradation"],
      ["Affected payments", "84", "No duplicate retries"],
      ["Recovery objective", "14 minutes", "Failover prepared"],
    ],
    headers: [
      "Incident",
      "Service",
      "Started",
      "Impact",
      "Commander",
      "Status",
    ],
    rows: [
      [
        "INC-1042",
        "External card pay-ins",
        "Today 09:37",
        "3.19% elevated failure rate",
        "S. Cooper",
        "Active",
      ],
      [
        "INC-1038",
        "DStv activation",
        "Sep 5 18:12",
        "118 delayed activations",
        "Partner Ops",
        "Monitoring",
      ],
      [
        "INC-1031",
        "Pay-Na Na latency",
        "Sep 2 13:44",
        "612 delayed transfers",
        "Treasury",
        "Resolved",
      ],
    ],
    controls: [
      "Open incident room",
      "Activate approved failover",
      "Notify affected customers",
      "Update public status",
      "Close after reconciliation",
    ],
  },
  "Partner Management": {
    metrics: [
      ["Active partners", "18", "Banks, rails, cards and vendors"],
      ["SLA compliant", "94.4%", "1 partner below target"],
      ["Credentials expiring", "2", "Within 30 days"],
    ],
    headers: [
      "Partner",
      "Capability",
      "Settlement account",
      "Commercial model",
      "SLA",
      "Status",
    ],
    rows: [
      [
        "Onafriq",
        "Cards • mobile money • VAS",
        "USD • LRD partner accounts",
        "Volume + network fee",
        "99.71%",
        "Active",
      ],
      [
        "PAPSS",
        "Cross-border clearing",
        "PAPSS settlement account",
        "Per transfer",
        "99.82%",
        "Active",
      ],
      [
        "Partner Bank Liberia",
        "Banking • FX • IIPS",
        "LRD • USD safeguarded",
        "Account + transaction",
        "99.96%",
        "Active",
      ],
      [
        "LEC",
        "Electricity billing",
        "LRD vendor payable",
        "Per successful payment",
        "99.60%",
        "Active",
      ],
      [
        "DStv",
        "TV subscriptions",
        "USD vendor payable",
        "Catalog margin",
        "96.20%",
        "Monitoring",
      ],
    ],
    controls: [
      "Add or renew partner",
      "Review contract vault",
      "Rotate API credentials",
      "Manage settlement accounts",
      "Open SLA history",
    ],
  },
  "Employer Reliability": {
    metrics: [
      ["Employers scored", "386", "Payroll-active employers"],
      ["Portfolio average", "86 / 100", "Stable"],
      ["High-risk employers", "8", "Lender offers restricted"],
    ],
    headers: [
      "Employer",
      "Score",
      "On-time payroll",
      "Funding consistency",
      "Data quality",
      "Status",
    ],
    rows: [
      ["Monrovia Business Group", "91", "98%", "Strong", "97%", "Consistent"],
      ["Divine University", "94", "100%", "Strong", "99%", "Consistent"],
      ["Mercy Hospital", "89", "96%", "Strong", "95%", "Stable"],
      ["Liberia Retail Group", "72", "84%", "Variable", "88%", "Review"],
      ["Golden Coast Logistics", "64", "71%", "Funding gaps", "91%", "High"],
    ],
    controls: [
      "Review scoring factors",
      "Open lender-visible summary",
      "Correct verified data",
      "Restrict new credit offers",
    ],
  },
  "Privacy & Consent": {
    metrics: [
      ["Active consents", "74,820", "Purpose-bound access"],
      ["Expiring in 30 days", "1,284", "Renewal notices queued"],
      ["Revocations today", "42", "Downstream access removed"],
    ],
    headers: [
      "Consent",
      "Customer",
      "Purpose",
      "Recipient",
      "Expires",
      "Status",
    ],
    rows: [
      [
        "CON-77102",
        "Kelvin Fallah",
        "Payroll-connected credit",
        "Unity Bank",
        "Dec 31, 2026",
        "Active",
      ],
      [
        "CON-77088",
        "Martha Konah",
        "Spending-based recommendations",
        "ProspevaAI",
        "Until revoked",
        "Active",
      ],
      [
        "CON-77061",
        "Hawa Sheriff",
        "Financial identity check",
        "Liberty Microfinance",
        "Sep 14, 2026",
        "Expiring",
      ],
      [
        "CON-77024",
        "Samuel Kromah",
        "Employer payroll data",
        "Community Credit",
        "Revoked Sep 6",
        "Revoked",
      ],
    ],
    controls: [
      "Open consent evidence",
      "Notify expiring consents",
      "Confirm downstream deletion",
      "Review purpose and scope",
    ],
  },
  "Launch Readiness": {
    metrics: [
      ["Overall readiness", "84%", "21 of 25 gates passed"],
      ["Critical blockers", "2", "Regulatory + acquiring"],
      ["Target launch", "Oct 15, 2026", "38 days remaining"],
    ],
    headers: [
      "Launch gate",
      "Owner",
      "Evidence",
      "Due",
      "Dependency",
      "Status",
    ],
    rows: [
      [
        "CBL partner authorization",
        "Legal & Compliance",
        "Application package",
        "Sep 20",
        "Partner bank",
        "In progress",
      ],
      [
        "Onafriq production certification",
        "Partner Ops",
        "Test results",
        "Sep 18",
        "Onafriq",
        "Ready",
      ],
      [
        "PAPSS corridor testing",
        "Treasury",
        "Settlement evidence",
        "Sep 22",
        "PAPSS sponsor",
        "In progress",
      ],
      [
        "Tap on Phone acquiring approval",
        "Cards",
        "Certification plan",
        "Oct 2",
        "Acquirer",
        "Blocked",
      ],
      [
        "Reconciliation dry run",
        "Finance",
        "3-day parallel run",
        "Sep 28",
        "All rails",
        "Ready",
      ],
      [
        "Support & incident simulation",
        "Operations",
        "Runbook exercise",
        "Oct 5",
        "Support team",
        "Scheduled",
      ],
      [
        "Disaster recovery test",
        "Security",
        "Recovery evidence",
        "Oct 8",
        "Cloud platform",
        "Scheduled",
      ],
    ],
    controls: [
      "Open launch command room",
      "Assign readiness owner",
      "Upload gate evidence",
      "Run launch simulation",
      "Prepare executive readiness report",
    ],
  },
  Employers: {
    metrics: [
      ["Verified employers", "412", "386 running payroll"],
      ["Covered employees", "48,620", "96.8% payroll-ready"],
      ["Employer exceptions", "14", "Funding, identity or attendance"],
    ],
    headers: [
      "Employer",
      "Industry",
      "Employees",
      "Payroll model",
      "Connected systems",
      "Status",
    ],
    rows: [
      [
        "Monrovia Business Group",
        "Professional services",
        "248",
        "Mixed LRD / USD",
        "Microsoft 365 • SharePoint",
        "Active",
      ],
      [
        "Divine University",
        "Higher education",
        "892",
        "USD net • PAYE in LRD",
        "Microsoft 365 • Attendance",
        "Active",
      ],
      [
        "Liberia Retail Group",
        "Retail",
        "164",
        "LRD",
        "Prospeva HR • Lender network",
        "Ghost check",
      ],
      [
        "Mercy Hospital",
        "Healthcare",
        "406",
        "Mixed LRD / USD",
        "SharePoint • Scheduling",
        "Active",
      ],
      [
        "Golden Coast Logistics",
        "Transportation",
        "318",
        "USD net • PAYE in LRD",
        "External HRIS",
        "Awaiting funding",
      ],
      [
        "Hope Community School",
        "Education",
        "126",
        "LRD",
        "Prospeva HR",
        "Review",
      ],
    ],
    controls: [
      "Add or verify employer",
      "Open employee directory",
      "Review employer payroll controls",
      "Manage HR, Finance & Head roles",
      "Check attendance & leave approvals",
      "Manage Microsoft connections",
    ],
  },
  "Onboarding & KYC": {
    metrics: [
      ["Pending reviews", "12", "4 due today"],
      ["Approved this week", "184", "96% first-pass"],
      ["Escalated", "3", "Compliance review"],
    ],
    headers: [
      "Case",
      "Applicant",
      "Profile",
      "Verification",
      "Submitted",
      "Status",
    ],
    rows: [
      [
        "KYC-3108",
        "Faith Medical Clinic",
        "Hospital",
        "KYB + owners",
        "Today 09:14",
        "Review",
      ],
      [
        "KYC-3104",
        "Abraham Doe",
        "Prospeva Agent",
        "NIR + source of funds",
        "Today 08:42",
        "Review",
      ],
      [
        "KYC-3099",
        "Hope Academy",
        "School",
        "KYB + banking",
        "Yesterday",
        "Escalated",
      ],
      [
        "KYC-3091",
        "Forward Market",
        "Merchant",
        "KYB + location",
        "Yesterday",
        "Ready",
      ],
    ],
    controls: [
      "Approve verified case",
      "Return for information",
      "Escalate to Compliance",
    ],
  },
  "Payroll Operations": {
    metrics: [
      ["Payrolls in progress", "34", "18 employers"],
      ["Awaiting funding", "9", "LRD 22.4M gap"],
      ["Employees held", "6", "Ghost-name checks"],
    ],
    headers: [
      "Payroll",
      "Employer",
      "Employees",
      "Gross",
      "PAYE in LRD",
      "State",
    ],
    rows: [
      [
        "PAY-2086",
        "Monrovia Business Group",
        "248",
        "LRD 18.45M",
        "LRD 2.06M",
        "Awaiting funding",
      ],
      [
        "PAY-2084",
        "Divine University",
        "892",
        "USD 184,200",
        "LRD 3.81M",
        "Approved",
      ],
      [
        "PAY-2079",
        "Liberia Retail Group",
        "164",
        "Mixed",
        "LRD 1.24M",
        "Ghost check",
      ],
      [
        "PAY-2072",
        "Mercy Hospital",
        "406",
        "LRD 42.1M",
        "LRD 4.63M",
        "Settled",
      ],
    ],
    controls: [
      "Open employee breakdown",
      "Review locked FX rate",
      "Inspect ghost-name evidence",
    ],
  },
  Agents: {
    metrics: [
      ["Authorized agents", "326", "281 currently open"],
      ["Available LRD cash", "LRD 84.6M", "Across network"],
      ["Float exceptions", "7", "Action required"],
    ],
    headers: [
      "Agent",
      "Location",
      "LRD float",
      "USD float",
      "Cash available",
      "Status",
    ],
    rows: [
      [
        "Agent – Sinkor",
        "Monrovia",
        "LRD 485,000",
        "USD 6,250",
        "LRD + USD",
        "Open",
      ],
      [
        "Agent – Broad Street",
        "Monrovia",
        "LRD 242,500",
        "USD 1,840",
        "LRD",
        "Review",
      ],
      [
        "Agent – Ganta Central",
        "Nimba",
        "LRD 618,000",
        "USD 3,100",
        "LRD + USD",
        "Open",
      ],
      [
        "Agent – Buchanan Port",
        "Grand Bassa",
        "LRD 194,000",
        "USD 900",
        "LRD",
        "Open",
      ],
    ],
    controls: [
      "Manage float",
      "Review cash reservations",
      "Reconcile commissions",
    ],
  },
  Lenders: {
    metrics: [
      ["Licensed lenders", "18", "16 active"],
      ["Active portfolio", "USD 2.84M", "1,284 loans"],
      ["Payroll collections", "98.7%", "This cycle"],
    ],
    headers: [
      "Lender",
      "License",
      "Employer links",
      "Active loans",
      "Collection rate",
      "Status",
    ],
    rows: [
      ["Unity Bank", "CBL-LND-1098", "42", "684", "99.2%", "Active"],
      ["Liberty Microfinance", "CBL-MFI-2081", "18", "326", "98.1%", "Active"],
      ["Community Credit", "CBL-LND-1412", "12", "274", "97.8%", "Monitoring"],
      ["Monrovia Finance", "CBL-LND-0955", "8", "0", "0%", "Suspended"],
    ],
    controls: [
      "Review credit offers",
      "Audit employer data consent",
      "Inspect payroll collections",
    ],
  },
  "Bills & Vendors": {
    metrics: [
      ["Active vendors", "24", "7 direct integrations"],
      ["Today’s bill value", "LRD 8.42M", "4,186 payments"],
      ["Provider incidents", "1", "DStv delayed"],
    ],
    headers: ["Provider", "Service", "Route", "Catalog", "Success", "Status"],
    rows: [
      [
        "LEC",
        "Prepaid + postpaid",
        "Direct API",
        "Live",
        "99.6%",
        "Operational",
      ],
      ["LWSC", "Water", "Direct API", "Live", "99.1%", "Operational"],
      [
        "DStv",
        "TV subscriptions",
        "Onafriq VAS",
        "Packages synced",
        "96.2%",
        "Monitoring",
      ],
      [
        "Starlink",
        "Internet",
        "Direct partner",
        "Packages synced",
        "98.8%",
        "Operational",
      ],
      [
        "Orange Liberia",
        "Airtime + data",
        "Onafriq VAS",
        "Live",
        "99.4%",
        "Operational",
      ],
    ],
    controls: [
      "Sync package catalog",
      "Open provider incident",
      "Review settlement file",
    ],
  },
  Reconciliation: {
    metrics: [
      ["Unmatched items", "3", "LRD 94,500 + USD 820"],
      ["Auto-matched", "99.93%", "18,281 today"],
      ["Next window", "16:00", "Domestic settlement"],
    ],
    headers: [
      "Break",
      "Partner",
      "Prospeva record",
      "Partner record",
      "Difference",
      "State",
    ],
    rows: [
      ["REC-4812", "Onafriq", "USD 5,400", "USD 5,350", "USD 50", "Open"],
      [
        "REC-4808",
        "Orange Money",
        "LRD 248,000",
        "LRD 244,000",
        "LRD 4,000",
        "Review",
      ],
      ["REC-4794", "Onafriq Card", "USD 770", "No record", "USD 770", "Open"],
    ],
    controls: [
      "Match evidence",
      "Create partner inquiry",
      "Post approved adjustment",
    ],
  },
  "Support Cases": {
    metrics: [
      ["Open cases", "18", "4 priority"],
      ["Within SLA", "92%", "Target 95%"],
      ["First response", "8 min", "Median today"],
    ],
    headers: ["Case", "Customer", "Issue", "Linked record", "Owner", "State"],
    rows: [
      [
        "SUP-7318",
        "Hawa Sheriff",
        "Agent deposit pending",
        "PA-829174",
        "M. Johnson",
        "Priority",
      ],
      [
        "SUP-7314",
        "Stop & Shop",
        "Card settlement mismatch",
        "REC-4812",
        "J. Kollie",
        "Open",
      ],
      [
        "SUP-7308",
        "Kelvin Fallah",
        "LEC token not received",
        "TX-894175",
        "A. Doe",
        "Review",
      ],
      [
        "SUP-7299",
        "Divine Academy",
        "Invoice payer mismatch",
        "INV-2048",
        "S. Brown",
        "Open",
      ],
    ],
    controls: [
      "Assign case",
      "Open full customer context",
      "Draft response with ProspevaAI",
    ],
  },
  "Fees & FX": {
    metrics: [
      ["Locked LRD / USD", "199.25", "Partner Bank source"],
      ["Fee revenue MTD", "USD 84,620", "+8.4%"],
      ["Pending changes", "2", "Maker-checker required"],
    ],
    headers: [
      "Service",
      "Rail / method",
      "Prospeva fee",
      "Partner fee",
      "Customer display",
      "State",
    ],
    rows: [
      [
        "Send across Africa",
        "PAPSS",
        "0.35%",
        "USD 0.50",
        "Itemized",
        "Active",
      ],
      ["Card PayLink", "Prospeva card", "0.45%", "0.10%", "Itemized", "Active"],
      ["Card PayLink", "External card", "1.25%", "2.10%", "Itemized", "Active"],
      [
        "Mobile money cash-in",
        "Onafriq",
        "0.30%",
        "0.50%",
        "Itemized",
        "Review",
      ],
    ],
    controls: [
      "Draft fee change",
      "Compare rail economics",
      "Lock new FX rate",
    ],
  },
  Compliance: {
    metrics: [
      ["Screening alerts", "4", "2 need review"],
      ["CBL reports due", "2", "Within 5 days"],
      ["Record retention", "100%", "7-year policy"],
    ],
    headers: ["Obligation", "Period", "Owner", "Due", "Evidence", "State"],
    rows: [
      [
        "AML transaction report",
        "August 2026",
        "Compliance",
        "Sep 10",
        "Draft generated",
        "Review",
      ],
      [
        "IIPS settlement return",
        "Week 36",
        "Treasury",
        "Sep 8",
        "Validated",
        "Ready",
      ],
      [
        "PAYE liability file",
        "August 2026",
        "Payroll Ops",
        "Sep 15",
        "32 employers",
        "Processing",
      ],
      [
        "NASSCORP contribution file",
        "August 2026",
        "Payroll Ops",
        "Sep 15",
        "28 employers",
        "Processing",
      ],
    ],
    controls: [
      "Generate compliance pack",
      "Review screening alert",
      "Export signed evidence",
    ],
  },
  Reports: {
    metrics: [
      ["Scheduled reports", "18", "12 delivered today"],
      ["Regulatory packs", "6", "Current"],
      ["Data exports", "3", "Awaiting approval"],
    ],
    headers: ["Report", "Scope", "Frequency", "Last run", "Owner", "State"],
    rows: [
      [
        "Platform settlement",
        "All rails",
        "Daily",
        "Today 06:00",
        "Treasury",
        "Ready",
      ],
      [
        "Agent float & cash",
        "Liberia network",
        "Daily",
        "Today 06:10",
        "Agent Ops",
        "Ready",
      ],
      ["Credit portfolio", "All lenders", "Weekly", "Sep 5", "Risk", "Ready"],
      [
        "Board operating pack",
        "Platform",
        "Monthly",
        "Aug 31",
        "Executive",
        "Approved",
      ],
    ],
    controls: [
      "Run authorized report",
      "Schedule delivery",
      "Request governed export",
    ],
  },
  "Audit Log": {
    metrics: [
      ["Events today", "24,806", "All services"],
      ["Privileged actions", "41", "100% attributed"],
      ["Integrity checks", "Passed", "Immutable log"],
    ],
    headers: ["Time", "Actor", "Role", "Action", "Object", "Outcome"],
    rows: [
      [
        "10:42:18",
        "Aisha Fallah",
        "Super Admin",
        "Viewed risk case",
        "RSK-2081",
        "Allowed",
      ],
      [
        "10:38:04",
        "James Doe",
        "Payroll Ops",
        "Requested payroll release",
        "PAY-2086",
        "Approval created",
      ],
      [
        "10:31:55",
        "System",
        "Smart routing",
        "Selected PAPSS",
        "TX-894198",
        "Allowed",
      ],
      [
        "10:24:11",
        "Mary Johnson",
        "Support",
        "Viewed customer record",
        "CUS-84161",
        "Allowed",
      ],
    ],
    controls: [
      "Verify event signature",
      "Filter privileged actions",
      "Request audit export",
    ],
  },
  "Roles & Access": {
    metrics: [
      ["Staff users", "86", "82 active"],
      ["Privileged roles", "12", "Reviewed Sep 1"],
      ["MFA coverage", "100%", "Enforced"],
    ],
    headers: [
      "Role",
      "Members",
      "Key scope",
      "Approval rights",
      "Last review",
      "State",
    ],
    rows: [
      [
        "Super Administrator",
        "2",
        "Platform configuration",
        "Final checker",
        "Sep 1",
        "Active",
      ],
      [
        "Risk Operations",
        "8",
        "Cases + holds",
        "Risk checker",
        "Sep 1",
        "Active",
      ],
      [
        "Treasury",
        "6",
        "Rails + settlement",
        "Financial checker",
        "Sep 1",
        "Active",
      ],
      ["Support", "28", "Customer cases", "None", "Aug 28", "Active"],
      ["Read-only Auditor", "4", "Reports + logs", "None", "Sep 1", "Active"],
    ],
    controls: [
      "Invite staff member",
      "Review permissions",
      "Revoke active session",
    ],
  },
  Settings: {
    metrics: [
      ["Core services", "24", "23 healthy"],
      ["Partner integrations", "18", "17 connected"],
      ["Configuration changes", "2", "Pending approval"],
    ],
    headers: [
      "Configuration",
      "Owner",
      "Environment",
      "Last changed",
      "Changed by",
      "State",
    ],
    rows: [
      [
        "Transaction limits",
        "Risk",
        "Production",
        "Aug 31",
        "A. Fallah",
        "Active",
      ],
      [
        "Notification channels",
        "Operations",
        "Production",
        "Sep 2",
        "M. Johnson",
        "Active",
      ],
      [
        "Microsoft 365 / SharePoint",
        "IT",
        "Production",
        "Sep 4",
        "System Admin",
        "Connected",
      ],
      [
        "Onafriq credentials",
        "Partner Ops",
        "Production",
        "Sep 1",
        "Secrets service",
        "Active",
      ],
    ],
    controls: [
      "Manage notifications",
      "Configure integrations",
      "Review platform limits",
    ],
  },
};
function OperationsPage({
  page,
  select,
  act,
}: {
  page: Page;
  select: (x: any[]) => void;
  act: (s: string) => void;
}) {
  const d = workspaces[page];
  if (!d) return null;
  return (
    <>
      <div className="metrics compact">
        {d.metrics.map((m, i) => (
          <Metric
            key={m[0]}
            label={m[0]}
            value={m[1]}
            delta={m[2]}
            icon={[Activity, BadgeCheck, AlertTriangle][i]}
            tone={i === 1 ? "green" : i === 2 ? "amber" : "blue"}
          />
        ))}
      </div>
      <div className="action-strip">
        {d.controls.map((c, i) => (
          <Button
            key={c}
            variant={i === 0 ? "default" : "outline"}
            onClick={() => act(`${c}: workflow opened.`)}
          >
            {c}
          </Button>
        ))}
      </div>
      <Panel title={`${page} workspace`}>
        <DataTable headers={d.headers} rows={d.rows} select={select} />
      </Panel>
    </>
  );
}
