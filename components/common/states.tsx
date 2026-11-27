"use client";

import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

/** Inline spinner for in-progress actions (searching, AI thinking). For data loads use the skeletons. */
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="empty-state flex items-center justify-center gap-2" role="status" aria-live="polite">
      <Spinner className="size-[18px]" /> {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <Alert className="attention">
      <div className="attention-icon" aria-hidden="true">
        <AlertTriangle />
      </div>
      <div>
        <AlertTitle className="line-clamp-none text-sm font-bold">Could not load this data</AlertTitle>
        <AlertDescription className="block">
          <p>{message}</p>
        </AlertDescription>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Alert>
  );
}

/** Centered "nothing here" message. */
export function EmptyState({ title, description }: { title?: string; description: string }) {
  return (
    <Empty className="empty-state gap-1 rounded-none border-0">
      {title && <EmptyTitle className="text-base font-bold">{title}</EmptyTitle>}
      <EmptyDescription className="text-inherit">{description}</EmptyDescription>
    </Empty>
  );
}
