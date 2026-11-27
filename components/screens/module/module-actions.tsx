"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { endpoints } from "@/lib/api/endpoints";
import type { ModuleAction, ModuleSummary } from "@/lib/api/schemas";
import { useModuleAction } from "@/lib/api/queries";
import { moduleActionFormSchema, type ModuleActionValues } from "@/lib/forms";
import { useGo, useReadOnly } from "@/lib/navigation";
import { recordsToRows } from "@/lib/records";
import { useUI } from "@/lib/stores/ui";
import { useExport } from "@/lib/use-export";

/** Module action keys that navigate instead of calling the API. */
const NAVIGATE_ACTIONS: Record<string, string> = {
  viewRouting: "rails",
  reviewBreaks: "reconciliation",
  viewAllTransactions: "transactions",
  reviewApprovals: "approvals",
};

/** Most records the "Export" action fetches in one request. */
const EXPORT_LIMIT = 500;

function ModuleActionSheet({ module, action, onClose }: { module: string; action: ModuleAction | null; onClose: () => void }) {
  const readOnly = useReadOnly();
  const run = useModuleAction();
  const form = useForm<ModuleActionValues>({ resolver: zodResolver(moduleActionFormSchema), defaultValues: { note: "" } });
  const { isSubmitting, errors } = form.formState;
  const close = () => {
    form.reset();
    run.reset();
    onClose();
  };
  const onSubmit = form.handleSubmit(async (v) => {
    if (!action) return;
    try {
      await run.mutateAsync({ module, action: action.key, label: action.label, note: v.note || undefined });
      close();
    } catch {
      // The mutation toasts and exposes the error below.
    }
  });
  return (
    <Sheet open={!!action} onOpenChange={(o) => !o && !isSubmitting && close()}>
      <SheetContent className="record-sheet">
        <SheetHeader>
          <SheetTitle>{action?.label}</SheetTitle>
          <SheetDescription>This sends the action to the Prospeva control plane.</SheetDescription>
        </SheetHeader>
        <form className="sheet-body" onSubmit={onSubmit} noValidate aria-busy={isSubmitting}>
          <fieldset disabled={isSubmitting} className="contents">
            <Field className="form-field" data-invalid={!!errors.note}>
              <FieldLabel htmlFor="module-action-note" className="font-normal">
                Note (optional)
              </FieldLabel>
              <Textarea id="module-action-note" placeholder="Reason or context for the audit log" aria-invalid={!!errors.note} {...form.register("note")} />
              <FieldError className="form-error" errors={[errors.note]} />
            </Field>
            {run.error && (
              <p className="form-error" role="alert">
                {run.error.message}
              </p>
            )}
            <div className="button-row" style={{ padding: "14px 0" }}>
              <Button type="submit" disabled={readOnly}>
                {isSubmitting && <Spinner />}
                {isSubmitting ? "Submitting…" : "Submit"}
              </Button>
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
            </div>
          </fieldset>
          {readOnly && <p className="muted">Read-only mode is on for this session.</p>}
        </form>
      </SheetContent>
    </Sheet>
  );
}

/** The module's action buttons. Export, refresh, navigation and AI actions run locally; the rest open a confirm sheet. */
export function ActionStrip({ summary, onReload }: { summary: ModuleSummary; onReload: () => void }) {
  const go = useGo();
  const openAI = useUI((s) => s.openAI);
  const exporter = useExport(`${summary.key}-records`);
  const [active, setActive] = useState<ModuleAction | null>(null);
  if (!summary.actions.length) return null;
  const hasPrimary = summary.actions.some((x) => x.primary);
  const run = (a: ModuleAction) => {
    if (a.key === "export")
      exporter.mutate(async () => {
        const page = await endpoints.records(summary.key, { limit: EXPORT_LIMIT });
        return recordsToRows(page.docs.filter((r) => r.kind === "table"));
      });
    else if (a.key === "refresh") onReload();
    else if (NAVIGATE_ACTIONS[a.key]) go(NAVIGATE_ACTIONS[a.key]);
    else if (/askAI|WithAI|investigate/i.test(a.key)) openAI({ prompt: a.label, label: a.label });
    else setActive(a);
  };
  return (
    <>
      <div className="action-strip">
        {summary.actions.map((a, i) => {
          const exporting = a.key === "export" && exporter.isPending;
          return (
            <Button
              key={a.key}
              variant={a.primary || (i === 0 && !hasPrimary) ? "default" : "outline"}
              disabled={exporting}
              aria-busy={exporting || undefined}
              onClick={() => run(a)}
            >
              {exporting && <Spinner />}
              {exporting ? "Exporting…" : a.label}
            </Button>
          );
        })}
      </div>
      <ModuleActionSheet module={summary.key} action={active} onClose={() => setActive(null)} />
    </>
  );
}
