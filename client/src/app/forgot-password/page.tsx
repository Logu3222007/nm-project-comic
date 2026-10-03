"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setEmailError(null);
    setConfirmationMessage(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setEmailError("Email address is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrimmed }),
      });

      const data = await res.json().catch(() => ({}));

      // Always show safe confirmation without account enumeration
      setConfirmationMessage(
        data.message ||
          "If an account exists for this email, you'll receive instructions to reset your password."
      );
    } catch {
      // In case of error, still show friendly safe message or connection error
      setConfirmationMessage(
        "If an account exists for this email, you'll receive instructions to reset your password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#090D16] text-[#F8FAFC]">
      <div className="w-full max-w-[420px] rounded-2xl bg-[#0F172A] border border-slate-800 p-7 sm:p-9 shadow-xl shadow-black/40">
        <div className="text-center mb-7">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 mb-3 group focus:outline-none focus:ring-2 focus:ring-[#00E5FF] rounded-lg p-1"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,229,255,0.3)] border border-amber-400/40 shrink-0 bg-[#090D16]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Create Comic Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              Create<span className="text-[#00E5FF]">Comic</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#FF2A8D]/20 text-[#FF2A8D] border border-[#FF2A8D]/40 ml-1">
                APP
              </span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Reset password</h1>
          <p className="text-sm text-slate-400 mt-1">
            Enter your email to receive password reset instructions
          </p>
        </div>

        {confirmationMessage ? (
          <div className="space-y-6 text-center py-2">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5 text-left">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{confirmationMessage}</span>
            </div>

            <p className="text-xs text-slate-400">
              Didn&apos;t receive an email? Check your spam folder or try another address.
            </p>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <input
                id="reset-email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                disabled={isSubmitting}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                placeholder="Enter your email"
                aria-describedby={emailError ? "reset-email-error" : undefined}
                aria-invalid={Boolean(emailError)}
                className={`w-full h-11 px-3.5 rounded-xl bg-[#090D16] border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                  emailError
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                    : "border-slate-800 focus:border-[#00E5FF] focus:ring-[#00E5FF]/20"
                }`}
              />
              {emailError && (
                <p id="reset-email-error" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-[#00E5FF] hover:bg-[#38BDF8] active:scale-[0.99] text-slate-950 font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[#00E5FF]/10 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:ring-offset-2 focus:ring-offset-[#0F172A]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Sending instructions...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
