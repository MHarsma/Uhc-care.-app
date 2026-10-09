"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  ListOrdered,
  HeartHandshake,
  FileText,
  BarChart3,
  UserPlus2,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AndroidFab } from "./android-fab";

interface AndroidNavigationBarProps {
  onQuickAdd?: () => void;
  pendingPartnerLeaves?: number;
}

export function AndroidNavigationBar({
  onQuickAdd,
  pendingPartnerLeaves = 0,
}: AndroidNavigationBarProps) {
  const pathname = usePathname();

  const destinations = [
    {
      id: "today",
      label: "Today",
      href: "/dashboard",
      icon: CalendarCheck,
    },
    {
      id: "routines",
      label: "Routines",
      href: "/tasks",
      icon: ListOrdered,
    },
    {
      id: "analytics",
      label: "History",
      href: "/analytics",
      icon: BarChart3,
    },
    {
      id: "partner",
      label: "Partner",
      href: "/partner",
      icon: HeartHandshake,
      badge: pendingPartnerLeaves > 0 ? pendingPartnerLeaves : undefined,
    },
    {
      id: "notes",
      label: "Notes",
      href: "/notes",
      icon: FileText,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col items-center pointer-events-none">
      {/* Material Design 3 Floating Action Button (Squircle FAB) */}
      {onQuickAdd && (
        <div className="w-full max-w-md px-5 flex justify-end pb-3 pointer-events-auto">
          <AndroidFab
            onClick={onQuickAdd}
            aria-label="Add routine"
          />
        </div>
      )}

      {/* Material Design 3 (M3) Bottom Navigation Bar */}
      <nav className="w-full border-t border-[#E6E0E9] bg-[#F3EDF7] py-2 px-3 shadow-[0_-1px_6px_rgba(0,0,0,0.03)] pointer-events-auto">
        <div className="mx-auto flex max-w-md items-center justify-between">
          {destinations.map((dest) => {
            const Icon = dest.icon;
            const isActive = pathname === dest.href;

            return (
              <Link
                key={dest.id}
                href={dest.href}
                className="flex flex-1 flex-col items-center justify-center group py-0.5 focus:outline-none"
              >
                {/* M3 Pill Active Indicator */}
                <div
                  className={cn(
                    "relative flex h-8 w-14 items-center justify-center rounded-full transition-all duration-200",
                    isActive
                      ? "bg-[#EADDFF] text-[#21005D]"
                      : "text-[#49454F] group-hover:bg-black/5"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-150",
                      isActive ? "scale-105 stroke-[2.4]" : "stroke-[1.9]"
                    )}
                  />
                  {dest.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B3261E] px-1 text-[10px] font-bold text-white">
                      {dest.badge}
                    </span>
                  )}
                </div>

                {/* M3 Destination Label */}
                <span
                  className={cn(
                    "text-[11px] font-medium tracking-tight mt-1 transition-colors",
                    isActive ? "text-[#1D1B20] font-bold" : "text-[#49454F]"
                  )}
                >
                  {dest.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
