"use client";

import type { z } from "zod";
import { useAuth } from "@/lib/stores/auth";

/** Base URL of the admin API, e.g. https://…/api/v1/admin (no trailing slash). */
export const API_URL = (process.env.NEXT_PUBLIC_ADMIN_API_URL || "").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    /** HTTP status; 0 = network/config error, -1 = response did not match the expected shape. */
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const isAuthError = (e: unknown) => e instanceof ApiError && (e.status === 401 || e.status === 403);

type Query = Record<string, string | number | undefined>;
type Options<T extends z.ZodTypeAny> = {
  schema: T;
  body?: unknown;
  query?: Query;
  /** Send the bearer token (default true). */
  authed?: boolean;
};

export type Envelope<T> = { status: number; message: string; data: T; raw: Record<string, unknown> };

/**
 * Calls the API, unwraps `{ status, message, data }` and validates `data` with `schema`.
 * Errors come back as `{ message }`; 401/403 sign the user out (the app shell then redirects to /login).
 */
export async function request<T extends z.ZodTypeAny>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  { schema, body, query, authed = true }: Options<T>,
): Promise<Envelope<z.output<T>>> {
  if (!API_URL) throw new ApiError("NEXT_PUBLIC_ADMIN_API_URL is not set. Add it to .env.", 0);

  const url = new URL(API_URL + path);
  for (const [k, v] of Object.entries(query ?? {})) if (v !== undefined && v !== "") url.searchParams.set(k, String(v));

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = useAuth.getState().token;
  if (authed && token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError("Could not reach the Prospeva API. Check your connection and try again.", 0);
  }

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const message = typeof json.message === "string" ? json.message : res.statusText || "Request failed";

  if (!res.ok) {
    if (authed && (res.status === 401 || res.status === 403)) useAuth.getState().signOut();
    throw new ApiError(message, res.status);
  }

  const parsed = schema.safeParse(json.data);
  if (!parsed.success) {
    console.error(`[api] ${method} ${path}: unexpected response shape`, parsed.error.issues, json.data);
    throw new ApiError("The server returned data in an unexpected format.", -1);
  }
  return { status: res.status, message, data: parsed.data, raw: json };
}
