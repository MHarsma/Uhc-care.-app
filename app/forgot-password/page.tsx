"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, KeyRound, Mail, Sparkles } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    const apiUrl = getApiBaseUrl();

    try {
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof result.message === "string"
            ? result.message
            : "Unable to send the reset link right now.",
        );
      }

      setMessage(
        result.message ||
          "If an account matches that email, a password reset link has been sent.",
      );
      setEmail("");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to send the reset link.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden transition-colors duration-300">
      {/* Ambient background glow */}
      <div className="ambient-orb" style={{ width: 500, height: 500, top: -150, right: -150, background: "rgba(124, 92, 252, 0.12)" }} />
      <div className="ambient-orb" style={{ width: 400, height: 400, bottom: -100, left: -100, background: "rgba(244, 63, 94, 0.08)", animationDelay: "-8s" }} />

      {/* Top controls */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="rounded-3xl glass-card border border-[var(--glass-border)] bg-[var(--bg-card)] p-8 sm:p-10 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-500 to-purple-600 text-xl font-black text-white shadow-xl glow-accent">
              <KeyRound className="h-7 w-7" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-500 dark:text-violet-400">
              Account Recovery
            </p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              Reset password
            </h1>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Enter your email to receive a password reset link
            </p>
          </div>

          <form className="space-y-4" onSubmit={(event) => void submit(event)}>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition-all focus:border-violet-500/50 focus:bg-violet-500/5 focus:ring-2 focus:ring-violet-500/20"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500 font-semibold" role="alert">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-semibold" role="status">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50 press-effect transition-all"
            >
              {submitting ? "Sending reset link..." : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to sign in</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
