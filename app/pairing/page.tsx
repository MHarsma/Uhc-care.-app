"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  ArrowLeft,
  Copy,
  Check,
  UserPlus,
  Link2,
  Sparkles,
  Heart,
  Share2,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
} from "lucide-react";
import { api } from "@/lib/api/client";

function PairingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");

  const [inviteCode, setInviteCode] = React.useState(
    codeParam ? codeParam.toUpperCase() : ""
  );
  const [invite, setInvite] = React.useState<{ code: string; url: string } | null>(
    null
  );
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // If code is detected from URL parameter, auto-fill and inform user
  React.useEffect(() => {
    if (codeParam) {
      setInviteCode(codeParam.toUpperCase());
      setMessage(
        `Invite code "${codeParam.toUpperCase()}" detected! Click "Connect Partner" below.`
      );
    }
  }, [codeParam]);

  const createInvite = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await api.post<{ invite: { code: string; url: string } }>(
        "/couple/invite"
      );
      setInvite(result.invite);
      setMessage("Invite code ready! Share the link or code with your partner.");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to create invite."
      );
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await api.post("/couple/accept", {
        code: inviteCode.trim().toUpperCase(),
      });
      setMessage("🎉 You are now connected with your partner!");
      setInviteCode("");
      setTimeout(() => {
        router.push("/partner");
      }, 1500);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to accept invite code. Please check the code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareInviteLink = async (url: string, code: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pair with me on UHC Care",
          text: `Join me on UHC Care to track our daily routines and habits together! My code is ${code}`,
          url: url,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    copyToClipboard(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-violet-600 via-indigo-600 to-rose-500 p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-3 border border-white/20">
            <Heart className="h-3.5 w-3.5 fill-rose-300 text-rose-300" />
            <span>Couple Accountability & Wellness</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Connect with your Partner
          </h2>
          <p className="mt-2 text-sm text-indigo-100 leading-relaxed">
            Sync daily routines, share habit streaks, approve day passes, and maintain mindfulness and spiritual habits together.
          </p>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {message && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 shadow-xs animate-fade-scale">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 shadow-xs animate-fade-scale">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-500/20 text-rose-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">Connection Error</p>
              <p className="mt-0.5 text-[11px] text-rose-500/80 leading-relaxed">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => { setError(""); createInvite(); }}
              className="shrink-0 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 px-3 py-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* 2-Column Responsive Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ============================================================ */}
        {/* METHOD 1: GENERATE & SHARE CODE                             */}
        {/* ============================================================ */}
        <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-sm glass-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600 dark:text-violet-400 font-black">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Send Invite to Partner
                </h3>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Generate a unique invite link or pairing code
                </p>
              </div>
            </div>

            {invite ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] p-5 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">
                    Your Pairing Code
                  </span>
                  <div className="mt-2 text-2xl sm:text-3xl font-black tracking-widest text-violet-600 dark:text-violet-400 font-mono select-all">
                    {invite.code}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => shareInviteLink(invite.url, invite.code)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-500/20 transition-all press-effect"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(invite.code)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--bg-hover)] px-4 py-2.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-500" />
                        <span className="text-emerald-500 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
                  Tap below to create a secure link. You can send it directly via WhatsApp, Messages, or Email.
                </p>
              </div>
            )}
          </div>

          {!invite && (
            <button
              type="button"
              onClick={createInvite}
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35 active:scale-[0.99] transition-all disabled:opacity-50 press-effect"
            >
              <Sparkles className="h-4 w-4" />
              <span>{loading ? "Generating..." : "Generate Pairing Code"}</span>
            </button>
          )}
        </div>

        {/* ============================================================ */}
        {/* METHOD 2: ENTER CODE FROM PARTNER                            */}
        {/* ============================================================ */}
        <div className="rounded-3xl border border-[var(--glass-border)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-sm glass-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 font-black">
                2
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Enter Partner&apos;s Code
                </h3>
                <p className="text-xs text-[var(--text-tertiary)]">
                  If your partner already sent you their code
                </p>
              </div>
            </div>

            <form onSubmit={acceptInvite} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                  Pairing Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. AB12CD"
                  maxLength={16}
                  className="w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3.5 text-center text-lg font-black tracking-widest text-[var(--text-primary)] font-mono uppercase focus:border-violet-500/50 focus:bg-violet-500/5 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-[var(--text-muted)] placeholder:font-sans placeholder:tracking-normal placeholder:text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !inviteCode.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-rose-500/20 active:scale-[0.99] transition-all disabled:opacity-50 press-effect"
              >
                <HeartHandshake className="h-4 w-4" />
                <span>{loading ? "Connecting..." : "Connect with Partner"}</span>
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--glass-border)] flex items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Encrypted couple link with private routine synchronization</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PairingPage() {
  return (
    <AppShell headerTitle="Partner Pairing" headerSubtitle="Connect with your spouse">
      <React.Suspense fallback={<div className="p-8 text-center text-[var(--text-tertiary)] text-sm">Loading pairing...</div>}>
        <PairingContent />
      </React.Suspense>
    </AppShell>
  );
}
