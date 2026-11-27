/** Helpers for reading the loosely-typed `panels` objects the control plane returns. */

export type Obj = Record<string, unknown>;

export const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);

export const str = (v: unknown) => (typeof v === "string" ? v : v == null ? "" : String(v));
