"use client";

import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Panel, Pill, Status, initials } from "@/components/common/display";
import { DetailsSkeleton } from "@/components/common/skeletons";
import { ErrorState } from "@/components/common/states";
import type { ControlRecord } from "@/lib/api/schemas";
import { useRecord, useRecordAction } from "@/lib/api/queries";
import { ROW_ACTIONS, recordActionSchema, type RecordActionValues } from "@/lib/forms";
import { humanize, pageByKey } from "@/lib/modules";
import { useReadOnly } from "@/lib/navigation";
import { useUI } from "@/lib/stores/ui";

const DETAIL_LABELS: Record<string, string> = { nameType: "Type", subject: "Subject", value: "Value", route: "Route / owner" };

/** Mounts the record sheet for the record selected in the UI store. */
export function RecordSheetHost() {
  const record = useUI((s) => s.record);
  const closeRecord = useUI((s) => s.closeRecord);
  // Re-key per record so the form resets.
  return <RecordSheet key={record?._id ?? "none"} record={record} onClose={closeRecord} />;
}

function RecordSheet({ record, onClose }: { record: ControlRecord | null; onClose: () => void }) {
  const detail = useRecord(record?.module, record?._id);
  const r = detail.data ?? record;

  return (
    <Sheet open={!!record} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="record-sheet">
        <SheetHeader>
          <SheetTitle>{r?.title ?? "Record details"}</SheetTitle>
          <SheetDescription>{r ? `${r.reference} • ${pageByKey(r.module)?.name ?? humanize(r.module)}` : ""}</SheetDescription>
        </SheetHeader>
        {r && (
          <div className="sheet-body">
            <div className="identity-card">
              <div className="avatar large">{initials(r.title)}</div>
              <div>
                <h3>{r.title}</h3>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {r.status && <Status value={r.status} />}
                  {r.severity && <Status value={r.severity} />}
                  {r.isOpen && <Pill tone="amber">Open</Pill>}
                </div>
              </div>
            </div>
            {detail.error && <ErrorState message={detail.error.message} onRetry={() => detail.refetch()} />}
            <RecordDetails record={r} />
            {detail.isFetching && !detail.data && <DetailsSkeleton rows={3} label="Loading latest details…" />}
            {r.isOpen ? (
              <RecordActionForm record={r} onDone={onClose} />
            ) : (
              <p className="muted" style={{ padding: "0 15px" }}>
                {r.status ? `This record is ${r.status.toLowerCase()}` : "This record is closed"}, so no action is needed.
              </p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function RecordDetails({ record: r }: { record: ControlRecord }) {
  return (
    <dl>
      <div>
        <dt>Reference</dt>
        <dd>{r.reference}</dd>
      </div>
      {r.subtitle && (
        <div>
          <dt>Summary</dt>
          <dd>{r.subtitle}</dd>
        </div>
      )}
      {Object.entries(r.columns ?? {}).map(([k, v]) => (
        <div key={`c-${k}`}>
          <dt>{humanize(k)}</dt>
          <dd>{String(v)}</dd>
        </div>
      ))}
      {Object.entries(r.detail ?? {})
        .filter(([, v]) => v && !Object.values(r.columns ?? {}).includes(v))
        .map(([k, v]) => (
          <div key={`d-${k}`}>
            <dt>{DETAIL_LABELS[k] ?? humanize(k)}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      {r.enabled !== undefined && (
        <div>
          <dt>Enabled</dt>
          <dd>{r.enabled ? "Yes" : "No"}</dd>
        </div>
      )}
      {r.updatedAt && (
        <div>
          <dt>Last updated</dt>
          <dd>{new Date(r.updatedAt).toLocaleString()}</dd>
        </div>
      )}
    </dl>
  );
}

function RecordActionForm({ record, onDone }: { record: ControlRecord; onDone: () => void }) {
  const readOnly = useReadOnly();
  const act = useRecordAction();
  const form = useForm<RecordActionValues>({
    resolver: zodResolver(recordActionSchema),
    defaultValues: { action: "Review", note: "" },
  });
  const action = useWatch({ control: form.control, name: "action" });
  const { isSubmitting, errors } = form.formState;

  const onSubmit = form.handleSubmit(async (v) => {
    try {
      await act.mutateAsync({ module: record.module, id: record._id, ...v });
      onDone();
    } catch {
      // The mutation toasts and exposes the error below.
    }
  });

  return (
    <Panel title="Take action">
      <form style={{ padding: "0 15px 15px" }} onSubmit={onSubmit} noValidate aria-busy={isSubmitting}>
        <fieldset disabled={isSubmitting || readOnly} className="contents">
          <Field className="form-field">
            <FieldLabel htmlFor="record-action" className="font-normal">
              Action
            </FieldLabel>
            <Controller
              control={form.control}
              name="action"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting || readOnly}>
                  <SelectTrigger id="record-action">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROW_ACTIONS.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field className="form-field" data-invalid={!!errors.note}>
            <FieldLabel htmlFor="record-note" className="font-normal">
              Note
            </FieldLabel>
            <Textarea
              id="record-note"
              placeholder="Reason, evidence or context for the audit log"
              aria-invalid={!!errors.note}
              {...form.register("note")}
            />
            <FieldError className="form-error" errors={[errors.note]} />
          </Field>
          {act.error && (
            <p className="form-error" role="alert">
              {act.error.message}
            </p>
          )}
          <Button type="submit">
            {isSubmitting && <Spinner />}
            {isSubmitting ? "Submitting…" : `Submit ${action.toLowerCase()}`}
          </Button>
        </fieldset>
        {readOnly && <p className="muted">Read-only mode is on.</p>}
      </form>
    </Panel>
  );
}
