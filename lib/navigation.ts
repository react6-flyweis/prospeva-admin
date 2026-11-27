"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { PAGES, hrefFor, pageByKey } from "./modules";
import { useSession } from "./api/queries";

/** Navigate by control-plane module key ("rails") or page slug ("payment-rails"). */
export function useGo() {
  const router = useRouter();
  return useCallback(
    (keyOrSlug: string) => {
      const target = pageByKey(keyOrSlug) || PAGES.find((p) => p.slug === keyOrSlug);
      if (target) router.push(hrefFor(target));
    },
    [router],
  );
}

/** The session's environment (set by the backend, e.g. "Production"). */
export function useEnvironment() {
  const session = useSession();
  return session.data?.environment ?? "Production";
}

/** True when the backend puts this session in the "Read-only" environment: writes are disabled. */
export const useReadOnly = () => useEnvironment() === "Read-only";
