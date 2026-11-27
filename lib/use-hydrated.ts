"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** False during SSR and the first hydration render, true afterwards. Use before reading persisted stores. */
export const useHydrated = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
