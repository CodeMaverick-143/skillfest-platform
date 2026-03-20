'use client';

import * as React from "react";
import { AuthProvider } from "@/hooks/useAuth";

export function Providers({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
