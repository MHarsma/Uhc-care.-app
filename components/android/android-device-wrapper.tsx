"use client";

import * as React from "react";
import {
  Smartphone,
  Monitor,
  Wifi,
  WifiOff,
  BatteryMedium,
  Signal,
  Download,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AndroidDeviceWrapperProps {
  children: React.ReactNode;
}

export function AndroidDeviceWrapper({ children }: AndroidDeviceWrapperProps) {
  const [viewMode, setViewMode] = React.useState<"phone" | "expanded">("phone");
  const [currentTime, setCurrentTime] = React.useState("10:00");
  const [isOnline, setIsOnline] = React.useState(true);
  const [installPrompt, setInstallPrompt] = React.useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = React.useState(false);

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      setCurrentTime(
        `${hours % 12 || 12}:${minutes.toString().padStart(2, "0")} ${ampm}`
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);

    // Online / Offline tracking
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // PWA BeforeInstallPrompt listener
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    try {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        setShowInstallBanner(false);
      }
    } catch (err) {
      console.error("Installation prompt error:", err);
    }
    setInstallPrompt(null);
  };

  return (
    <div className="min-h-screen bg-[#E6E0E9] flex flex-col items-center justify-start sm:p-4 md:p-8">
      {/* Desktop Mode Switcher Bar */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-md mb-3 px-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#49454F]">
          <span className="flex h-2.5 w-2.5 rounded-full bg-[#6750A4] animate-pulse" />
          <span>Android (Material Design 3)</span>
        </div>

        <div className="flex items-center gap-1 bg-[#FEF7FF] p-1 rounded-xl border border-[#CAC4D0] shadow-2xs">
          <button
            type="button"
            onClick={() => setViewMode("phone")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
              viewMode === "phone"
                ? "bg-[#6750A4] text-white shadow-xs"
                : "text-[#49454F] hover:text-[#1D1B20]"
            )}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Pixel Frame</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("expanded")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all",
              viewMode === "expanded"
                ? "bg-[#6750A4] text-white shadow-xs"
                : "text-[#49454F] hover:text-[#1D1B20]"
            )}
          >
            <Monitor className="h-3.5 w-3.5" />
            <span>Full View</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div
        className={cn(
          "w-full transition-all duration-300",
          viewMode === "phone"
            ? "sm:max-w-[420px] sm:rounded-[44px] sm:border-[10px] sm:border-[#1D1B20] sm:shadow-[0_25px_60px_rgba(0,0,0,0.22)] sm:overflow-hidden relative bg-[#FEF7FF]"
            : "max-w-2xl sm:rounded-[32px] sm:border border-[#CAC4D0] sm:shadow-lg bg-[#FEF7FF] overflow-hidden"
        )}
      >
        {/* Android Status Bar with Hole-Punch Camera (shown in phone preview on desktop) */}
        {viewMode === "phone" && (
          <div className="hidden sm:flex items-center justify-between px-6 pt-3 pb-1 text-xs font-bold text-[#1D1B20] select-none bg-[#FEF7FF]">
            <span>{currentTime}</span>

            {/* Google Pixel Center Hole-Punch Camera */}
            <div className="h-3.5 w-3.5 rounded-full bg-black shadow-inner" />

            <div className="flex items-center gap-1.5 text-[#1D1B20]">
              <span className="text-[10px] font-bold">5G</span>
              <Signal className="h-3.5 w-3.5" />
              {isOnline ? (
                <Wifi className="h-3.5 w-3.5" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-[#B3261E]" />
              )}
              <BatteryMedium className="h-4 w-4" />
            </div>
          </div>
        )}

        {/* Offline Status Alert */}
        {!isOnline && (
          <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-[#601410] px-3 py-1.5 text-center text-xs font-bold text-white shadow-md animate-in slide-in-from-top">
            <WifiOff className="h-3.5 w-3.5 text-[#F2B8B5]" />
            <span>Offline mode — routines will sync once connected</span>
          </div>
        )}

        {/* PWA Install Banner */}
        {showInstallBanner && (
          <div className="flex items-center justify-between gap-3 bg-[#EADDFF] border-b border-[#CAC4D0] px-4 py-2 text-[#21005D] animate-in fade-in">
            <div className="flex items-center gap-2 min-w-0">
              <Download className="h-4 w-4 text-[#6750A4] shrink-0" />
              <span className="text-xs font-bold truncate">Install UHC Care on Home Screen</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="rounded-full bg-[#6750A4] px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-[#523F84] transition-all"
              >
                Install
              </button>
              <button
                type="button"
                onClick={() => setShowInstallBanner(false)}
                className="p-1 text-[#49454F] hover:bg-black/5 rounded-full"
                aria-label="Dismiss banner"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* The Screen Content */}
        <div className="min-h-screen sm:min-h-[780px] flex flex-col relative bg-[#FEF7FF]">
          {children}
        </div>

        {/* Android Gesture Navigation Bar */}
        {viewMode === "phone" && (
          <div className="hidden sm:flex justify-center pb-2 bg-[#FEF7FF] pointer-events-none">
            <div className="h-1 w-28 rounded-full bg-[#1D1B20]/40" />
          </div>
        )}
      </div>
    </div>
  );
}
