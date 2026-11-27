"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/stores/auth";
import { endpoints, type AIAsk, type ProfileUpdate, type RecordQuery } from "./endpoints";
import { adminUserSchema } from "./schemas";

/** Query keys in one place. Invalidate `qk.module(key)` to refresh everything for a module. */
export const qk = {
  session: ["session"] as const,
  badges: ["badges"] as const,
  modules: ["modules"] as const,
  overview: ["overview"] as const,
  search: (q: string) => ["search", q] as const,
  viewAsUser: (s: string) => ["viewAsUser", s] as const,
  aiGreeting: ["ai", "greeting"] as const,
  module: (key: string) => ["module", key] as const,
  summary: (key: string) => ["module", key, "summary"] as const,
  records: (key: string, q: RecordQuery = {}) => ["module", key, "records", q] as const,
  record: (key: string, id: string) => ["module", key, "record", id] as const,
};

const DEFAULT_RECORDS: RecordQuery = { limit: 100 };

// ---------------------------------------------------------------- reads

export const useSession = () => useQuery({ queryKey: qk.session, queryFn: endpoints.session, staleTime: 5 * 60_000 });
export const useBadges = () => useQuery({ queryKey: qk.badges, queryFn: endpoints.badges, refetchInterval: 60_000 });
export const useOverview = () => useQuery({ queryKey: qk.overview, queryFn: endpoints.overview });

export const useModuleSummary = (key: string | null | undefined) =>
  useQuery({ queryKey: qk.summary(key ?? ""), queryFn: () => endpoints.summary(key!), enabled: !!key });

export const useModuleRecords = (key: string, query: RecordQuery = DEFAULT_RECORDS, options: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: qk.records(key, query),
    queryFn: () => endpoints.records(key, query),
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });

export const useRecord = (key: string | undefined, id: string | undefined) =>
  useQuery({ queryKey: qk.record(key ?? "", id ?? ""), queryFn: () => endpoints.record(key!, id!), enabled: !!key && !!id });

export const useSearch = (q: string) =>
  useQuery({ queryKey: qk.search(q), queryFn: () => endpoints.search(q), enabled: q.length >= 2, staleTime: 60_000 });

export const useViewAsUser = (search: string) =>
  useQuery({ queryKey: qk.viewAsUser(search), queryFn: () => endpoints.viewAsUser(search), enabled: !!search });

export const useAIGreeting = (enabled: boolean) =>
  useQuery({ queryKey: qk.aiGreeting, queryFn: endpoints.aiGreeting, enabled, staleTime: 10 * 60_000 });

// ---------------------------------------------------------------- writes

const errorToast = (e: Error) => toast.error(e.message);

export function useSignin() {
  const signIn = useAuth((s) => s.signIn);
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => endpoints.signin(email, password),
    onSuccess: ({ token, user }) => {
      client.clear();
      signIn(token, user);
    },
  });
}

export function useSignOut() {
  const signOut = useAuth((s) => s.signOut);
  const client = useQueryClient();
  return () => {
    signOut();
    client.clear();
  };
}

// Password reset: the screen shows errors inline, so these don't toast.
export const useForgotPassword = () => useMutation({ mutationFn: (email: string) => endpoints.forgotPassword(email) });
export const useVerifyResetOtp = () =>
  useMutation({ mutationFn: (v: { email: string; otp: string }) => endpoints.verifyResetOtp(v.email, v.otp) });
export const useResetPassword = () =>
  useMutation({
    mutationFn: (v: { id: string; newPassword: string; confirmPassword: string }) =>
      endpoints.resetPassword(v.id, { newPassword: v.newPassword, confirmPassword: v.confirmPassword }),
  });

export function useUpdateProfile() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (v: ProfileUpdate) => endpoints.updateProfile(v),
    onSuccess: (r, v) => {
      // Prefer the user the server returns; otherwise keep what was sent.
      const returned = adminUserSchema.safeParse(r.data);
      useAuth.setState((s) => ({
        user: returned.success ? returned.data : s.user && { ...s.user, ...v, mobileNumber: v.phone ?? s.user.mobileNumber },
      }));
      toast.success(r.message || "Profile updated.");
      return client.invalidateQueries({ queryKey: qk.session });
    },
    onError: errorToast,
  });
}

/** After any write: refresh the module, sidebar badges and overview. */
function useInvalidateModule() {
  const client = useQueryClient();
  return (key: string) =>
    Promise.all([
      client.invalidateQueries({ queryKey: qk.module(key) }),
      client.invalidateQueries({ queryKey: qk.badges }),
      client.invalidateQueries({ queryKey: qk.overview }),
    ]);
}

export function useRecordAction() {
  const invalidate = useInvalidateModule();
  return useMutation({
    mutationFn: (v: { module: string; id: string; action: string; note: string }) =>
      endpoints.recordAction(v.module, v.id, { action: v.action, note: v.note }),
    onSuccess: (r, v) => {
      toast.success(r.message || `${v.action} recorded.`);
      return invalidate(v.module);
    },
    onError: errorToast,
  });
}

export function useModuleAction() {
  const invalidate = useInvalidateModule();
  return useMutation({
    mutationFn: (v: { module: string; action: string; label: string; note?: string }) =>
      endpoints.moduleAction(v.module, v.action, v.note ? { note: v.note } : {}),
    onSuccess: (r, v) => {
      toast.success(r.message || `${v.label} submitted.`);
      return invalidate(v.module);
    },
    onError: errorToast,
  });
}

export function useTopToggle() {
  const invalidate = useInvalidateModule();
  return useMutation({
    mutationFn: (v: { module: string; enabled: boolean; label: string }) => endpoints.topToggle(v.module, v.enabled),
    onSuccess: (r, v) => {
      toast.success(r.message || `${v.label}: ${v.enabled ? "on" : "off"}`);
      return invalidate(v.module);
    },
    onError: errorToast,
  });
}

export function useRecordToggle() {
  const invalidate = useInvalidateModule();
  return useMutation({
    mutationFn: (v: { module: string; id: string; enabled: boolean; label: string }) =>
      endpoints.recordToggle(v.module, v.id, v.enabled),
    onSuccess: (r, v) => {
      toast.success(r.message || `${v.label}: ${v.enabled ? "enabled" : "disabled"}`);
      return invalidate(v.module);
    },
    onError: errorToast,
  });
}

export const useAIAsk = () => useMutation({ mutationFn: (body: AIAsk) => endpoints.aiAsk(body) });
