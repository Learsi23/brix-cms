"use client";

// Auth is handled server-side by middleware.ts
// If this component renders, the user is already authenticated.
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
