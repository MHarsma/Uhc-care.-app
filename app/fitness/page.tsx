"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export default function FitnessRedirectPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace("/workout");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
    </div>
  );
}
