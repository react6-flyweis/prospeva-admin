"use client";

import { z } from "zod";
import { ApiError, request } from "./client";
import {
  adminUserSchema,
  aiAnswerSchema,
  aiGreetingSchema,
  anySchema,
  badgesSchema,
  controlRecordSchema,
  modulesSchema,
  moduleSummarySchema,
  overviewSchema,
  recordPageSchema,
  searchResultSchema,
  sessionSchema,
  viewAsUserSchema,
} from "./schemas";

const CP = "/controlPlane";
const data = <T>(p: Promise<{ data: T }>) => p.then((r) => r.data);

export type RecordQuery = { search?: string; status?: string; page?: number; limit?: number };
export type AIAsk = { prompt?: string; capability?: string; context?: string };
export type ProfileUpdate = { fullName: string; firstName: string; lastName: string; email: string; phone?: string };

/** The OTP-verify response shape is unconfirmed: look for the account id where backends usually put it. */
const idSchema = z.object({ _id: z.string().optional(), id: z.string().optional(), userId: z.string().optional() });
function findAccountId(raw: Record<string, unknown>) {
  for (const c of [raw.data, raw]) {
    const r = idSchema.safeParse(c);
    const id = r.success && (r.data._id || r.data.userId || r.data.id);
    if (id) return id;
  }
  return null;
}

/** Plain API functions (no React). Use the hooks in ./queries.ts from components. */
export const endpoints = {
  /** Returns the token and admin; does not store them. */
  async signin(email: string, password: string) {
    const r = await request("POST", "/signin", { schema: adminUserSchema, body: { email, password }, authed: false });
    const token = z.string().min(1).safeParse(r.raw.accessToken);
    if (!token.success) throw new ApiError("Sign-in succeeded but no access token was returned.", -1);
    return { token: token.data, user: r.data };
  },

  // Password reset (public). Success responses were never captured, so they are not validated.
  forgotPassword: (email: string) => request("POST", "/forgetPassword", { schema: anySchema, body: { email }, authed: false }),
  /** Returns the account id that `resetPassword` needs. */
  async verifyResetOtp(email: string, otp: string) {
    const r = await request("POST", "/forgotVerifyOtp", { schema: anySchema, body: { email, otp }, authed: false });
    const id = findAccountId(r.raw);
    if (!id) throw new ApiError("The code was accepted, but the server did not return an account to reset.", -1);
    return id;
  },
  resetPassword: (id: string, body: { newPassword: string; confirmPassword: string }) =>
    request("POST", `/changePassword/${encodeURIComponent(id)}`, { schema: anySchema, body, authed: false }),

  updateProfile: (body: ProfileUpdate) => request("PUT", "/update", { schema: anySchema, body }),

  session: () =>data(request("GET", `${CP}/session`, { schema: sessionSchema })),
  badges: () => data(request("GET", `${CP}/badges`, { schema: badgesSchema })),
  modules: () => data(request("GET", `${CP}/modules`, { schema: modulesSchema })),
  overview: () => data(request("GET", `${CP}/overview`, { schema: overviewSchema })),
  search: (q: string) => data(request("GET", `${CP}/search`, { schema: searchResultSchema, query: { q } })),
  viewAsUser: (search: string) => data(request("GET", `${CP}/viewAsUser`, { schema: viewAsUserSchema, query: { search } })),

  aiGreeting: () => data(request("GET", `${CP}/prospevaAI/greeting`, { schema: aiGreetingSchema })),
  aiAsk: (body: AIAsk) => data(request("POST", `${CP}/prospevaAI/ask`, { schema: aiAnswerSchema, body })),

  summary: (module: string) => data(request("GET", `${CP}/${module}/summary`, { schema: moduleSummarySchema })),
  records: (module: string, query: RecordQuery = {}) =>
    data(request("GET", `${CP}/${module}/records`, { schema: recordPageSchema, query })),
  record: (module: string, id: string) =>
    data(request("GET", `${CP}/${module}/records/${id}`, { schema: controlRecordSchema })),

  recordAction: (module: string, id: string, body: { action: string; note: string }) =>
    request("POST", `${CP}/${module}/records/${id}/action`, { schema: anySchema, body }),
  recordToggle: (module: string, id: string, enabled: boolean) =>
    request("PATCH", `${CP}/${module}/records/${id}/toggle`, { schema: anySchema, body: { enabled } }),
  topToggle: (module: string, enabled: boolean) =>
    request("PATCH", `${CP}/${module}/topToggle`, { schema: anySchema, body: { enabled } }),
  moduleAction: (module: string, action: string, body: Record<string, unknown> = {}) =>
    request("POST", `${CP}/${module}/actions/${action}`, { schema: anySchema, body }),
};
