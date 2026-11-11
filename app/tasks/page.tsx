"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /tasks is now merged into /dashboard.
 * This page redirects instantly to the unified Today dashboard.
 */
export default function TasksRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <p className="text-xs text-[var(--text-tertiary)]">
        Redirecting to Today&apos;s Routine...
      </p>
    </div>
  );
}
