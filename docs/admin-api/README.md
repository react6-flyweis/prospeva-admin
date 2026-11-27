# Prospeva Admin API — Control Plane Reference

Reference for the admin panel endpoints used by this app. Every example in `responses/` is a real response captured from the QA backend on 2026-11-26, using the seeded QA admin `qa.admin.controlplane@prospeva.test`. The source material is `../Prospeva_Websites_API_Guide.html` (§4) and the Postman collection (folders 18–19).

All captured calls are read-only except one ProspevaAI question. No actions or toggles were sent, so `POST` and `PATCH` responses below are described from the guide, not observed.

## Basics

| Item | Value |
|---|---|
| Base URL (Render QA) | `https://mr-prospera-backend-kza5.onrender.com/api/v1/admin` |
| Base URL (local backend) | `http://localhost:2041/api/v1/admin` |
| Auth | `Authorization: Bearer <accessToken>` on every call except `signin` |
| CORS | `Access-Control-Allow-Origin: *`, so the browser can call the API directly |
| Envelope | `{ "status": 200, "message": "...", "data": ... }` |

The Render backend sleeps when idle. The first call after a pause can take 30–60 seconds.

### Errors

Errors return only `{ "message": "..." }`, without `status` or `data`. Show `message` to the user.

| Case | HTTP | Body | File |
|---|---|---|---|
| No token | 403 | `{"message":"Please Login to Continue."}` | `responses/error.no-token.403.json` |
| Invalid or expired token | 401 | `{"message": ...}` | — |
| Wrong password | 401 | `{"message":"Wrong password"}` | `responses/error.signin-wrong-password.401.json` |
| Unknown record id | 404 | `{"message": ...}` | — |
| Unknown module key | 404 | `{"status":404,"message":"Module not found"}` | `responses/modules/employers_liveEvents/summary.json` |

Treat both 401 and 403 as "signed out": clear the token and go to the login screen.

## Session and shell

| Call | Purpose | Example |
|---|---|---|
| `POST /signin` with `{email, password}` | Sign in. Returns **201**. `accessToken` sits at the top level, **outside** `data`. `data` holds `fullName`, `email`, `mobileNumber` and `userType: "ADMIN"`. | `responses/signin.json` |
| `GET /controlPlane/session` | Top bar: `environment`, `environments[]`, `controlPlaneStatus`, `notificationsCount`, `admin {name, role}`, `secureWorkspace {mfaEnforced, sessionMonitored}` | `responses/session.json` |
| `GET /controlPlane/badges` | Sidebar counts, as a map from module key to number | `responses/badges.json` |
| `GET /controlPlane/modules` | Sidebar menu: `[{key, title, subtitle, section}]`. Sections are `Command`, `Money Movement`, `Control` and `Platform`. | `responses/modules.json` |
| `GET /controlPlane/overview` | Home: `heading`, `metrics[]`, `openControlCases`, `moneyMovement`, `alertBanner`, `railHealth[] {name,status,uptime}`, `latestTransactions[]` (records) and more | `responses/overview.json` |
| `GET /controlPlane/search?q=` | Global search: `{ people: [{_id, fullName, mobileNumber, email?, userType}], records: [Record] }`. Records can belong to any module. | `responses/search.q=Martha.json` |
| `GET /controlPlane/viewAsUser?search=` | Read-only full user profile: `{ user: {...}, notice }`. Contains personal data, so display only. | `responses/viewAsUser.search=Kelvin.json` |
| `GET /controlPlane/prospevaAI/greeting` | AI page header: `message`, `quickPrompts[]`, `badges`, `inputPlaceholder`, `disclaimer` | `responses/prospevaAI.greeting.json` |
| `POST /controlPlane/prospevaAI/ask` | Ask with `{prompt}` or `{capability, context}`. Returns `{prompt, answer, disclaimer}`. | `responses/prospevaAI.ask.prompt=Compare-rails.json` |

## Module pattern

Every module uses the same endpoints. `<module>` is a `key` from `/controlPlane/modules`.

| Call | Purpose |
|---|---|
| `GET /controlPlane/<module>/summary` | Page header, metric cards, action buttons, top toggle, extra panels |
| `GET /controlPlane/<module>/records?search=&status=&page=&limit=` | Table rows, paginated. `search` and `status` filter on the server (verified). |
| `GET /controlPlane/<module>/records/:id` | One record. `:id` is the record's `_id`, not `reference`. |
| `POST /controlPlane/<module>/records/:id/action` with `{action, note}` | Row action, e.g. `{"action":"Review","note":"..."}` |
| `PATCH /controlPlane/<module>/topToggle` with `{enabled}` | Only modules whose summary has `topToggle`: `rails`, `connectivity`, `risk`, `loanEligibility`, `employers` |
| `PATCH /controlPlane/<module>/records/:id/toggle` with `{enabled}` | Rows of `kind: "toggleCard"` (`featureControls`, `connectivity`) |
| `POST /controlPlane/<module>/actions/<actionKey>` | Module-level button. `actionKey` comes from `summary.actions[].key`. |

### Summary (`data`)

```ts
{
  key: string; title: string; subtitle: string; section: string;
  badge?: number;
  metrics: { label: string; value: string; sublabel?: string }[];
  actions: { key: string; label: string; primary: boolean }[];
  topToggle?: { label: string; sublabel: string; enabled: boolean };
  panels?: Record<string, unknown>;   // module-specific, see below
}
```

### Records list (`data`)

The list is paginated in mongoose-paginate format. The default `limit` is 50.

```ts
{
  docs: Record[];
  totalDocs: number; limit: number; page: number; totalPages: number;
  hasPrevPage: boolean; hasNextPage: boolean; prevPage: number | null; nextPage: number | null;
}

Record = {
  _id: string; module: string; reference: string; title: string; subtitle?: string;
  kind: "table" | "toggleCard" | "policyCard";
  status?: string; severity?: string;
  columns?: Record<string, string | number>;   // table cells; keys vary per module
  detail?: { nameType: string; subject: string; value: string; route: string };
  enabled?: boolean;                             // toggleCard rows
  hasToggle: boolean; isOpen: boolean; sortOrder: number;
  createdAt: string; updatedAt: string;
}
```

The API sends no header labels for `columns`, so the UI derives them from the keys (`affectedParty` becomes "Affected party").

### Modules

Captured examples are in `responses/modules/<key>/summary.json` and `records.json`.

| Key | Screen | Row kinds | Columns | Top toggle | Panels | Module actions |
|---|---|---|---|---|---|---|
| overview | Overview | — | — | | moneyMovement, aiInsight, alertBanner | refresh, askAI, viewRouting, reviewBreaks, viewAllTransactions, reviewApprovals, investigate |
| exceptionCenter | Exception Center | table | affectedParty, impact, owner | | | openPriorityWorklist, assignException, escalateToIncident, askAIToPrioritize |
| customers | Customers | table | profiles, wallets, kyc | | | export |
| organizations | Organizations | table | type, scale, value30Day | | categoryCounts | export |
| employers | Employers | — (see sub-modules) | | ✓ | sourceOfTruthBanner, flowSteps, noRoutineInput, controlledCorrections | syncNow, reviewFailedEvents, approveCorrections, downloadSyncAudit |
| employers_liveEvents | Employers → live events | table | eventType, timeLabel, location, device | | records only, summary returns 404 | |
| employers_connectionHealth | Employers → connection health | table | linked, total | | records only | |
| employers_leaveRequests | Employers → leave requests | table | employer, leaveType, dateRangeLabel | | records only | |
| employer360 | Employer 360 | table | currentPosition, controlOwner, lastActivity, nextRequirement | | | switchEmployer, openAllEmployees, reviewPayrollFunding, manageAuthorizedOfficers, openSupportHistory, viewConnectedSystems |
| employerReliability | Employer Reliability | table | score, onTimePayroll, fundingConsistency, dataQuality | | | reviewScoringFactors, openLenderVisibleSummary, correctVerifiedData, restrictNewCreditOffers |
| viewAsUser | View as User | table | staffMember, viewedAs, reason, expires | | | startAuditedView, searchUserOrOrganization, requestElevatedSupport, reviewSessionHistory |
| kyc | Onboarding & KYC | table | serviceCurrencies, requiredEvidence, submitted | | sectionHeading, footerNote | — |
| payroll | Payroll Operations | table | employer, employees, gross, payeInLrd | | | employeeBreakdown, lockedFxRate, ghostNameEvidence |
| transactions | Transactions | table | type, parties, amount, rail | | | export |
| ledger | Ledger Explorer | table | sequence, currency, debit, credit | | | traceAnother, feeFxDisclosure, compareSettlement, createReconciliationCase |
| rails | Payment Rails | table | subtitle, success, medianDelivery, currencies | ✓ | disclosureStandard | — |
| connectivity | Connectivity Operations | table, toggleCard | channel, value, age | ✓ | channelsMonitored, safetyPolicy, productBoundaries, sharedStates, mandatoryDisclosure | reviewPolicy, runRecoveryDrill, refreshQueue |
| agents | Agents | table | location, lrdFloat, usdFloat, cashAvailable | | | manageFloat, reviewCashReservations, reconcileCommissions |
| lenders | Lenders | table | license, activeLoans, collectionRate, employerLinks | | | reviewCreditOffers, auditEmployerConsent, inspectPayrollCollections |
| loanEligibility | Loan Eligibility | table | employerLink, payroll, consent | ✓ | steps, hardControl | reviewExceptions, scanPreApprovals, reviewLenderPolicy |
| bills | Bills & Vendors | table | service, catalog, route, success | | | syncCatalog, openIncident, reviewSettlementFile |
| risk | Risk & Fraud | table | subject, evidence | ✓ | — | — |
| reconciliation | Reconciliation | table | partner, prosperaRecord, partnerRecord, difference | | | matchEvidence, createPartnerInquiry, postAdjustment |
| incidents | Incident Command | table | impact, commander, started | | | openIncidentRoom, activateFailover, notifyCustomers, updateStatus, closeIncident |
| supportCases | Support Cases | table | customer, linkedRecord, owner | | | assignCase, openCustomerContext, draftWithAI |
| partners | Partner Management | table | capability, commercialModel, settlementAccount, sla | | | addPartner, reviewContractVault, rotateCredentials, manageSettlementAccounts, openSlaHistory |
| feesFx | Fees & FX | table | rail, prospevaFee, partnerFee, customerDisplay | | | draftFeeChange, compareRailEconomics, lockFxRate |
| compliance | Compliance | table | period, owner, evidence, due | | | generateCompliancePack, reviewScreeningAlert, exportSignedEvidence |
| approvals | Approvals | table, policyCard | value, owner, checks | | policyHeading | — |
| privacyConsent | Privacy & Consent | table | purpose, recipient, expires | | | openConsentEvidence, notifyExpiring, confirmDeletion, reviewPurposeScope |
| featureControls | Feature Controls | toggleCard | availability, currencies, provider, status | | banner | — |
| launchReadiness | Launch Readiness | table | owner, dependency, evidence, due | | | openCommandRoom, assignOwner, uploadEvidence, runSimulation, prepareReport |
| prospevaAI | ProspevaAI | — | | | banner, capabilities | — |
| reports | Reports | table | scope, frequency, owner, lastRun | | | runReport, scheduleDelivery, requestExport |
| auditLog | Audit Log | table | time, actor, role, object | | | verifySignature, filterPrivileged, requestExport |
| rolesAccess | Roles & Access | table | members, keyScope, approvalRights, lastReview | | | inviteStaff, reviewPermissions, revokeSession |
| settings | Settings | table | owner, environment, lastChanged, changedBy | | | manageNotifications, configureIntegrations, reviewLimits |

### Panel shapes

Panels vary by module. These are the recurring shapes:

- **Line list**: `{ title, lines: string[] }`, e.g. `rails.disclosureStandard` and `connectivity.safetyPolicy`
- **Steps**: `[{ step, title, subtitle }]`, e.g. `employers.flowSteps` and `loanEligibility.steps`
- **Banner or note**: `{ title, subtitle?, description?, text?, badge? }`
- **Label/value list**: `[{ label, value }]`, e.g. `organizations.categoryCounts`
- **Capabilities**: `[{ key, title, subtitle }]`, as in `prospevaAI.capabilities`
- **Scalar**: e.g. `connectivity.channelsMonitored` and `approvals.policyHeading`

## Screens with no API

**Revenue & Settlements** and **Account Restrictions** have no control-plane module. They stay on browser-local demo data.

## Not covered here

The guide also lists admin endpoints outside the control plane that this UI doesn't use yet:
- `/api/v1/admin/mobile/organizations`: approvals for mobile "Add a business" applications
- `/api/v1/admin/mobile/settlements`: payout settlement queue
- The older CRUD routes: KYC, loans, commissions, agents, complaints, notifications, static pages, holidays

See the HTML guide §4.2 to §4.3 and Postman folders 20 onward.
