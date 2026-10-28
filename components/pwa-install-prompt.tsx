"use client";

import * as React from "react";
import { Download, X, Share, PlusSquare, Smartphone, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = React.useState(false);
  const [isStandalone, setIsStandalone] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already running in standalone (PWA) mode
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (standaloneMode) {
      setIsStandalone(true);
      return;
    }

    // Check if user dismissed prompt recently
    const dismissedAt = localStorage.getItem("uhc_pwa_prompt_dismissed");
    if (dismissedAt) {
      const daysSinceDismiss =
        (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 3) {
        // Don't show banner for 3 days if dismissed
        return;
      }
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Listen for Chrome/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    // If iOS and not standalone, show prompt after a short delay
    if (isIosDevice && !standaloneMode) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
        setIsInstalled(true);
      }
    } catch (err) {
      console.error("Install prompt error:", err);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    localStorage.setItem("uhc_pwa_prompt_dismissed", Date.now().toString());
  };

  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Banner on Mobile */}
      <div className="fixed bottom-16 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
        <div className="rounded-2xl glass-card border border-violet-500/30 bg-[var(--bg-card)] p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/icon-192.png"
                alt="UHC Care"
                className="h-11 w-11 shrink-0 rounded-xl shadow-md ring-1 ring-white/10 object-cover"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                    Install UHC Care
                  </h4>
                  <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-400">
                    App
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
                  Install on your home screen for full-screen view, instant offline routines, and faster access.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-lg p-1 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors shrink-0"
              aria-label="Dismiss install prompt"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3.5 flex items-center justify-end gap-2 pt-2 border-t border-[var(--glass-border)]">
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              Not now
            </button>

            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-violet-500/20 hover:shadow-violet-500/35 active:scale-95 transition-all press-effect cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isIOS ? "How to Install" : "Install App"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl glass-card border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--glass-border)]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-500">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Install on iPhone / iPad
                  </h3>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    Follow 2 simple steps in Safari
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSInstructions(false)}
                className="rounded-lg p-1.5 text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-5 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl bg-[var(--bg-hover)] p-3.5 border border-[var(--glass-border)]">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white font-bold text-xs">
                  1
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  <p className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    Tap the Share icon
                    <Share className="h-3.5 w-3.5 text-blue-500 inline" />
                  </p>
                  <p className="mt-0.5 text-[11px]">
                    Located at the bottom toolbar in Safari (or top right on iPad).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-[var(--bg-hover)] p-3.5 border border-[var(--glass-border)]">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white font-bold text-xs">
                  2
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  <p className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                    Select &ldquo;Add to Home Screen&rdquo;
                    <PlusSquare className="h-3.5 w-3.5 text-emerald-500 inline" />
                  </p>
                  <p className="mt-0.5 text-[11px]">
                    Scroll down in the share sheet and tap &ldquo;Add to Home Screen&rdquo;.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSInstructions(false)}
              className="w-full rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-violet-500 transition-all cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Dedicated Card for Settings page
 */
export function InstallAppCard() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isIOS, setIsIOS] = React.useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = React.useState(false);
  const [isStandalone, setIsStandalone] = React.useState(false);
  const [installed, setInstalled] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(standaloneMode);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setIsStandalone(true);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setInstalled(true);
        }
      } catch (err) {
        console.error("Install prompt error:", err);
      }
      setDeferredPrompt(null);
    } else {
      // Browser didn't provide prompt event (e.g. desktop safari or unsupported browser)
      setShowIOSInstructions(true);
    }
  };

  return (
    <div className="rounded-3xl border border-[var(--glass-border)] glass-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15 text-violet-500">
            <Smartphone className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Mobile App Experience
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Progressive Web App (PWA) installation
            </p>
          </div>
        </div>

        {isStandalone || installed ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Installed</span>
          </span>
        ) : (
          <span className="text-[11px] font-bold text-violet-500 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">
            Available
          </span>
        )}
      </div>

      <div className="p-4 rounded-2xl bg-[var(--bg-hover)] border border-[var(--glass-border)] mb-4">
        <div className="flex items-center gap-3">
          <img
            src="/icon-192.png"
            alt="UHC Care"
            className="h-12 w-12 shrink-0 rounded-2xl shadow-md ring-1 ring-white/15 object-cover"
          />
          <div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">
              UHC Care App
            </h4>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Full-screen native view, offline routine completion, and fast home screen access.
            </p>
          </div>
        </div>
      </div>

      {isStandalone || installed ? (
        <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          ✓ Running as installed app on your device
        </div>
      ) : (
        <button
          type="button"
          onClick={handleInstall}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-violet-500/20 press-effect transition-all cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Install App to Home Screen</span>
        </button>
      )}

      {showIOSInstructions && (
        <div className="mt-4 pt-4 border-t border-[var(--glass-border)] space-y-2 text-xs text-[var(--text-secondary)]">
          <p className="font-bold text-[var(--text-primary)]">Manual Install Instructions:</p>
          <p>1. Open this website in Safari or Chrome on your mobile phone.</p>
          <p>2. Tap the browser Menu / Share icon (⎋ on Safari, or ⋮ on Chrome).</p>
          <p>3. Select <strong className="text-[var(--text-primary)]">&ldquo;Add to Home Screen&rdquo;</strong> or <strong className="text-[var(--text-primary)]">&ldquo;Install app&rdquo;</strong>.</p>
        </div>
      )}
    </div>
  );
}

