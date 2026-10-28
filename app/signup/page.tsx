"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Users, Sparkles } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { csrfHeaders } from "@/lib/csrf";
import { getApiBaseUrl, getBackendBaseUrl } from "@/lib/api/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [gender, setGender] = useState("female");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const apiUrl = getApiBaseUrl();
    const backendUrl = getBackendBaseUrl();

    try {
      const headers = await csrfHeaders(backendUrl);
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          gender,
          city,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          body?.message ??
          (body?.errors
            ? Object.values(body.errors as Record<string, string[]>)
                .flat()
                .join(" ")
            : "Please check your details and try again.");
        throw new Error(message);
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("uhc_logged_in", "true");
        if (body?.token) {
          localStorage.setItem("uhc_auth_token", body.token);
        }
      }

      router.push("/dashboard");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to create your account.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClasses =
    "w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--bg-hover)] px-4 py-3.5 text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] outline-none transition-all duration-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20";

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-3.5 py-6 sm:px-4 sm:py-12 overflow-hidden">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Ambient Orbs */}
      <div className="ambient-orb" style={{ width: 500, height: 500, top: -150, left: -100, background: "rgba(124, 92, 252, 0.15)" }} />
      <div className="ambient-orb" style={{ width: 400, height: 400, bottom: -100, right: -150, background: "rgba(52, 211, 153, 0.08)", animationDelay: "-8s" }} />

      {/* Noise */}
      <div className="noise-overlay fixed inset-0 pointer-events-none z-[1]" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative z-10 w-full max-w-xl rounded-3xl glass-card p-5 sm:p-8 md:p-12 shadow-2xl"
      >
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-20 w-40 bg-violet-500/20 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 mb-8 text-center">
          <motion.img
            src="/icon-192.png"
            alt="UHC Care"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as const }}
            className="mx-auto mb-5 h-16 w-16 rounded-2xl shadow-xl object-contain"
          />
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-500 dark:text-violet-400">
            Start together
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
            Create account
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Begin your shared journey to better daily habits and consistency
          </p>
        </div>

        <form className="space-y-5" onSubmit={(event) => void submit(event)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                placeholder="Amina Rahman"
                className={inputClasses}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                City / Location
              </label>
              <input
                type="text"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                required
                placeholder="Lahore, London, etc."
                className={inputClasses}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="amina@example.com"
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PasswordInput
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="At least 8 characters"
            />

            <PasswordInput
              label="Confirm password"
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              required
              placeholder="Repeat password"
            />
          </div>

          {/* Gender / Profile Type */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              Profile Type (For personalized cycles & routines)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`flex items-center justify-center gap-2 rounded-2xl border p-3.5 text-sm font-bold transition-all ${
                  gender === "female"
                    ? "border-rose-500 bg-rose-500/10 text-rose-500"
                    : "border-[var(--glass-border)] bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:border-rose-500/30"
                }`}
              >
                <span>🌸 Female (Cycle Care)</span>
              </button>
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`flex items-center justify-center gap-2 rounded-2xl border p-3.5 text-sm font-bold transition-all ${
                  gender === "male"
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-500"
                    : "border-[var(--glass-border)] bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:border-indigo-500/30"
                }`}
              >
                <span>⚡ Male</span>
              </button>
            </div>
          </div>

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
                Creating account...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Create account
                <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[var(--text-secondary)] border-t border-[var(--glass-border)] pt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-violet-600 dark:text-violet-400 hover:underline transition-colors ml-1"
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
