"use client";

import { SessionProvider } from "next-auth/react";
import { AppProvider } from "@/context/AppContext";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AppProvider>{children}</AppProvider>
    </SessionProvider>
  );
}
