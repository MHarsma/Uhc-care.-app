"use client";

import * as React from "react";
import { Sparkles, RefreshCw, X } from "lucide-react";

export function PwaUpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  const [waitingWorker, setWaitingWorker] = React.useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (!registration) return;

      // 1. If a worker is already waiting
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setUpdateAvailable(true);
      }

      // 2. Listen for newly discovered updates
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setUpdateAvailable(true);
          }
        });
      });
    });

    // 3. Reload when new service worker takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });

    // 4. Periodically check for updates every 15 minutes
    const interval = setInterval(() => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.update().catch(() => {});
      });
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    setIsUpdating(true);
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div
      role="alert"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full mx-auto p-4 bg-slate-900/95 text-white rounded-2xl shadow-2xl backdrop-blur-md border border-slate-700/80 animate-in fade-in slide-in-from-bottom-5 duration-300 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-600/30 text-violet-400 border border-violet-500/40">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">
              Update Available
            </h4>
            <p className="text-xs text-slate-300 leading-snug mt-0.5">
              A new version is ready. Tap update to apply latest changes in 2 seconds.
            </p>
          </div>
        </div>

        <button
          onClick={() => setUpdateAvailable(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Dismiss update banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          onClick={() => setUpdateAvailable(false)}
          className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
        >
          Later
        </button>
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 active:bg-violet-700 rounded-xl shadow-xs transition-all disabled:opacity-75 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isUpdating ? "animate-spin" : ""}`} />
          <span>{isUpdating ? "Updating..." : "Update Now"}</span>
        </button>
      </div>
    </div>
  );
}
