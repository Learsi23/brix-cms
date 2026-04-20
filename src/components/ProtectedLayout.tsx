"use client";

<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth");
        if (res.ok) {
          setAuthenticated(true);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

=======
// Auth is handled server-side by middleware.ts
// If this component renders, the user is already authenticated.
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
>>>>>>> 90af1658ebb35b19d7726df9dd2269a65a682d86
  return <>{children}</>;
}
