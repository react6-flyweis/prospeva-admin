import type { ControlRecord } from "./api/schemas";
import { humanize } from "./modules";

export type RecordField = { id: string; header: string; value: (r: ControlRecord) => string };

/** The table fields for a set of records: reference, title, every `columns` key, then severity/status if any record has them. */
export function recordFields(records: ControlRecord[]): RecordField[] {
  const colKeys: string[] = [];
  for (const r of records) for (const k of Object.keys(r.columns || {})) if (!colKeys.includes(k)) colKeys.push(k);
  return [
    { id: "reference", header: "Reference", value: (r) => r.reference },
    { id: "title", header: "Title", value: (r) => r.title },
    ...colKeys.map((k) => ({ id: `col:${k}`, header: humanize(k), value: (r: ControlRecord) => String(r.columns?.[k] ?? "—") })),
    ...(records.some((r) => r.severity) ? [{ id: "severity", header: "Severity", value: (r: ControlRecord) => r.severity || "—" }] : []),
    ...(records.some((r) => r.status) ? [{ id: "status", header: "Status", value: (r: ControlRecord) => r.status || "—" }] : []),
  ];
}

/** Headers and string rows for CSV export. */
export function recordsToRows(records: ControlRecord[]) {
  const fields = recordFields(records);
  return { headers: fields.map((f) => f.header), rows: records.map((r) => fields.map((f) => f.value(r))) };
}
