"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Sparkles } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { csrfHeaders } from "@/lib/csrf";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://becoming-spring-zoning-detailed.trycloudflare.com/api";
    const backendUrl = apiUrl.replace(/\/api\/?$/, "");

    try {
      const headers = await csrfHeaders(backendUrl);
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          body?.message ?? (typeof body?.errors === "object" ? Object.values(body.errors).flat().join(" ") : "The email or password is incorrect.");
        throw new Error(message);
      }

      router.push("/dashboard");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to sign in.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4 py-12 overflow-hidden">
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Ambient Orbs */}
      <div className="ambient-orb" style={{ width: 520, height: 520, top: -150, right: -100, background: "rgba(124, 92, 252, 0.15)" }} />
      <div className="ambient-orb" style={{ width: 420, height: 420, bottom: -100, left: -150, background: "rgba(244, 63, 94, 0.1)", animationDelay: "-10s" }} />

      {/* Noise */}
      <div className="noise-overlay fixed inset-0 pointer-events-none z-[1]" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative z-10 w-full max-w-lg rounded-3xl glass-card p-8 sm:p-12 shadow-2xl"
      >
        {/* Glow accent behind card */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-24 w-48 bg-violet-500/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as const }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-600 text-2xl font-black text-white shadow-xl glow-accent"
          >
            U
          </motion.div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-500 dark:text-violet-400">
            Welcome back
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Continue building consistency and routines together
          </p>
        </div>

        <form className="space-y-5" onSubmit={(event) => void submit(event)}>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Email address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-tertiary)] group-focus-within:text-violet-500 transition-colors">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-hover)] py-3.5 pl-11 pr-4 text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] outline-none transition-all duration-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
          </div>

          <PasswordInput
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="Enter your password"
          />

          {error ? (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-rose-500 bg-rose-500/10 rounded-2xl px-4 py-3 border border-rose-500/20 font-medium"
              role="alert"
            >
              {error}
            </motion.p>
          ) : null}

          <button
            disabled={submitting}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-5 py-4 text-base font-bold text-white shadow-xl shadow-violet-500/25 transition-all hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-50 press-effect"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign in
                <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-5 text-right text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-violet-500 dark:text-violet-400 hover:underline transition-colors"
          >
            Forgot your password?
          </Link>
        </div>

        <div className="mt-8 text-center text-sm text-[var(--text-secondary)] border-t border-[var(--glass-border)] pt-6">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-bold text-violet-600 dark:text-violet-400 hover:underline transition-colors ml-1"
          >
            Create one now
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
