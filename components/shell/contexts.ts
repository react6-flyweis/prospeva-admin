"use client";

import { createContext } from "react";

/** Top-bar search text; tables on the page filter by it. */
export const SearchContext = createContext("");

/** True in read-only mode. Only the legacy demo screens read this; new code uses useReadOnly(). */
export const ModeContext = createContext(false);
