"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ApiError } from "@/lib/api/client";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        // Retry network errors and 5xx (the Render backend can be slow to wake); never retry 4xx or bad shapes.
        retry: (count, error) =>
          count < 2 && (!(error instanceof ApiError) || error.status === 0 || error.status >= 500),
      },
      mutations: { retry: false },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster position="top-right" closeButton />
    </QueryClientProvider>
  );
}
