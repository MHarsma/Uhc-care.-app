"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("uhc_auth_token");
      if (token && token.trim() !== "" && token !== "undefined" && token !== "null") {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <img
          src="/icon-192.png"
          alt="UHC Care"
          className="h-12 w-12 rounded-2xl shadow-xl object-contain animate-pulse"
        />
        <p className="text-xs font-semibold text-[var(--text-tertiary)]">Opening UHC Care...</p>
      </div>
    </div>
  );
}
