import { z } from "zod";

// Response schemas for the admin control-plane API.
// Built from the captured responses in docs/admin-api/responses/.
// Objects are non-strict (extra fields are dropped), optional where the backend omits them.

export const adminUserSchema = z.object({
  fullName: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string(),
  mobileNumber: z.string().optional(),
  userType: z.string(),
});
export type AdminUser = z.infer<typeof adminUserSchema>;

export const metricSchema = z.object({
  label: z.string(),
  value: z.coerce.string(),
  sublabel: z.string().optional(),
});
export type Metric = z.infer<typeof metricSchema>;

export const moduleActionSchema = z.object({
  key: z.string(),
  label: z.string(),
  primary: z.boolean().default(false),
});
export type ModuleAction = z.infer<typeof moduleActionSchema>;

export const topToggleSchema = z.object({
  label: z.string(),
  sublabel: z.string().default(""),
  enabled: z.boolean(),
});

export const moduleSummarySchema = z.object({
  key: z.string(),
  title: z.string(),
  subtitle: z.string().default(""),
  section: z.string().default(""),
  badge: z.number().optional(),
  metrics: z.array(metricSchema).default([]),
  actions: z.array(moduleActionSchema).default([]),
  topToggle: topToggleSchema.optional(),
  /** Module-specific blocks; shapes vary (see docs/admin-api/README.md → Panel shapes). */
  panels: z.record(z.unknown()).optional(),
});
export type ModuleSummary = z.infer<typeof moduleSummarySchema>;

export const controlRecordSchema = z.object({
  _id: z.string(),
  module: z.string(),
  reference: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  kind: z.string().default("table"),
  status: z.string().optional(),
  severity: z.string().optional(),
  columns: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  detail: z.record(z.string()).optional(),
  enabled: z.boolean().optional(),
  hasToggle: z.boolean().default(false),
  isOpen: z.boolean().default(false),
  sortOrder: z.number().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type ControlRecord = z.infer<typeof controlRecordSchema>;

export const paginatedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    docs: z.array(item),
    totalDocs: z.number(),
    limit: z.number(),
    page: z.number(),
    totalPages: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
  });
export const recordPageSchema = paginatedSchema(controlRecordSchema);
export type RecordPage = z.infer<typeof recordPageSchema>;

export const sessionSchema = z.object({
  environment: z.string(),
  environments: z.array(z.string()).default([]),
  controlPlaneStatus: z.string().default("unknown"),
  notificationsCount: z.number().default(0),
  admin: z.object({ name: z.string(), role: z.string().default("") }),
  secureWorkspace: z
    .object({ mfaEnforced: z.boolean().default(false), sessionMonitored: z.boolean().default(false) })
    .default({}),
});
export type Session = z.infer<typeof sessionSchema>;

export const badgesSchema = z.record(z.number());
export type Badges = z.infer<typeof badgesSchema>;

export const moduleInfoSchema = z.object({
  key: z.string(),
  title: z.string(),
  subtitle: z.string().default(""),
  section: z.string().default(""),
});
export const modulesSchema = z.array(moduleInfoSchema);

export const overviewSchema = z.object({
  heading: z.string().default("Overview"),
  metrics: z.array(metricSchema).default([]),
  openControlCases: z.number().optional(),
  moneyMovement: z
    .object({
      processedValue: z.string(),
      change: z.string().default(""),
      breakdown: z.array(z.object({ label: z.string(), pct: z.number() })).default([]),
    })
    .optional(),
  alertBanner: z.object({ title: z.string(), subtitle: z.string().default(""), actionLabel: z.string().optional() }).optional(),
  railHealth: z.array(z.object({ name: z.string(), status: z.string(), uptime: z.string() })).default([]),
  latestTransactions: z.array(controlRecordSchema).default([]),
  approvalQueue: z.array(controlRecordSchema).default([]),
  reconciliationBreaks: z.array(controlRecordSchema).default([]),
  prospevaAIInsight: z.object({ title: z.string(), subtitle: z.string().default("") }).optional(),
});
export type Overview = z.infer<typeof overviewSchema>;

export const searchResultSchema = z.object({
  people: z
    .array(
      z.object({
        _id: z.string(),
        fullName: z.string().default(""),
        mobileNumber: z.string().optional(),
        email: z.string().optional(),
        userType: z.string().default(""),
      }),
    )
    .default([]),
  records: z.array(controlRecordSchema).default([]),
});
export type SearchResult = z.infer<typeof searchResultSchema>;

export const viewAsUserSchema = z.object({
  user: z.record(z.unknown()),
  notice: z.string().optional(),
});
export type ViewAsUser = z.infer<typeof viewAsUserSchema>;

export const aiGreetingSchema = z.object({
  message: z.string(),
  quickPrompts: z.array(z.string()).default([]),
  badges: z.object({ role: z.string(), scope: z.string(), accessLabel: z.string() }).partial().default({}),
  inputPlaceholder: z.string().optional(),
  disclaimer: z.string().optional(),
});
export type AIGreeting = z.infer<typeof aiGreetingSchema>;

export const aiAnswerSchema = z.object({
  prompt: z.string().optional(),
  answer: z.string(),
  disclaimer: z.string().optional(),
});
export type AIAnswer = z.infer<typeof aiAnswerSchema>;

/** Writes (actions/toggles) were not captured; accept any payload. */
export const anySchema = z.unknown();
