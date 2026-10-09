"use client";

import * as React from "react";
import { PartnerData } from "@/lib/api/dashboard";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, BellRing, UserPlus, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface PartnerGlanceCardProps {
  data: PartnerData | null;
  onRefresh?: () => void;
}

export function PartnerGlanceCard({ data }: PartnerGlanceCardProps) {
  const [isNudging, setIsNudging] = React.useState(false);
  const [nudgeSent, setNudgeSent] = React.useState(false);

  const handleSendNudge = async () => {
    setIsNudging(true);
    try {
      await api.post("/notifications/nudge", {
        message: "Thinking of you! Keep up the routine 💪",
      });
      setNudgeSent(true);
      setTimeout(() => setNudgeSent(false), 3500);
    } catch (err) {
      console.error("Failed to send nudge:", err);
    } finally {
      setIsNudging(false);
    }
  };

  // Not paired state
  if (!data?.partner) {
    return (
      <div className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50/50 via-white to-pink-50/30 p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
            <Heart className="h-5 w-5 fill-violet-200 text-violet-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-slate-800">
              Pair with Your Partner
            </h4>
            <p className="text-xs text-slate-500">
              Share daily accountability and support each other&apos;s routines.
            </p>
          </div>
          <Link href="/pairing">
            <Button size="sm" variant="subtle" className="text-xs">
              <UserPlus className="h-3.5 w-3.5" />
              <span>Pair Now</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { partner, stats } = data;
  const percentage = stats?.percentage ?? 0;
  const completed = stats?.completed ?? 0;
  const total = stats?.total ?? 0;

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white font-bold text-sm shadow-xs shadow-pink-500/20">
            {partner.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-slate-800 leading-tight">
                {partner.name}
              </h4>
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <p className="text-[11px] text-slate-400">
              Partner Accountability
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSendNudge}
            disabled={isNudging || nudgeSent}
            className="h-8 text-xs text-slate-600 hover:text-violet-600"
          >
            {nudgeSent ? (
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Sent!
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <BellRing className="h-3.5 w-3.5 text-slate-400" />
                Nudge
              </span>
            )}
          </Button>

          <Link href="/partner">
            <Button size="sm" variant="outline" className="h-8 text-xs">
              View
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-600">
            Today&apos;s Progress
          </span>
          <span className="font-bold text-slate-800">
            {completed} of {total} done ({percentage}%)
          </span>
        </div>
        <Progress value={percentage} size="sm" variant="success" />
      </div>
    </div>
  );
}
