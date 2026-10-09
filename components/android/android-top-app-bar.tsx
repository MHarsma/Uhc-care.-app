"use client";

import * as React from "react";
import { Flame, Sparkles, Heart, Settings } from "lucide-react";
import Link from "next/link";
import { PartnerData } from "@/lib/api/dashboard";

interface AndroidTopAppBarProps {
  title?: string;
  userName?: string;
  streakDays?: number;
  partnerData?: PartnerData | null;
  onOpenLibrary?: () => void;
}

export function AndroidTopAppBar({
  title = "Today",
  userName = "Partner",
  streakDays = 0,
  partnerData,
  onOpenLibrary,
}: AndroidTopAppBarProps) {
  const formattedDate = React.useMemo(() => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date());
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FEF7FF] border-b border-[#E6E0E9] px-4 py-3">
      <div className="mx-auto flex max-w-md items-center justify-between">
        {/* Left: App Headline & Date */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#49454F] uppercase tracking-wider">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="text-[#6750A4]">UHC Care</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1D1B20]">
            {title}
          </h1>
        </div>

        {/* Right: M3 Assist Chips */}
        <div className="flex items-center gap-2">
          {streakDays > 0 && (
            <Link
              href="/analytics"
              className="inline-flex items-center gap-1 rounded-lg bg-[#FFD8E4] px-2.5 py-1 text-xs font-bold text-[#31111D] hover:bg-[#FFC9D9] transition-colors"
              title="View Streak Analytics & History"
            >
              <Flame className="h-3.5 w-3.5 text-[#B3261E] fill-[#B3261E]" />
              <span>{streakDays}d</span>
            </Link>
          )}

          {onOpenLibrary && (
            <button
              type="button"
              onClick={onOpenLibrary}
              className="inline-flex items-center gap-1 rounded-lg bg-[#E8DEF8] px-2.5 py-1 text-xs font-bold text-[#1D192B] hover:bg-[#DED2F9] transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#6750A4]" />
              <span className="hidden sm:inline">Library</span>
            </button>
          )}

          {partnerData?.partner ? (
            <Link
              href="/partner"
              className="flex items-center gap-1.5 rounded-full border border-[#CAC4D0] bg-[#F7F2FA] pl-1.5 pr-2.5 py-1 text-xs font-semibold text-[#1D1B20] hover:bg-[#ECE6F0] transition-colors"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7D5260] text-white font-bold text-[10px]">
                {partnerData.partner.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-[11px]">
                {partnerData.stats?.completed ?? 0}/{partnerData.stats?.total ?? 0}
              </span>
            </Link>
          ) : (
            <Link
              href="/pairing"
              className="flex items-center gap-1 rounded-full border border-[#CAC4D0] bg-white px-2.5 py-1 text-xs font-semibold text-[#6750A4]"
            >
              <Heart className="h-3 w-3 text-[#6750A4]" />
              <span>Pair</span>
            </Link>
          )}

          <Link
            href="/settings"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#49454F] hover:bg-black/5 active:scale-95 transition-all"
            aria-label="Settings"
            title="Settings & Profile"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
