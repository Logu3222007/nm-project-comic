"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    let isValid = true;
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);
    setErrorMessage(null);

    if (!name.trim() || name.trim().length < 2) {
      setNameError("Please enter your name (at least 2 characters).");
      isValid = false;
    }

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setEmailError("Email address is required.");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      isValid = false;
    }

    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      isValid = false;
    }

    return isValid;
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isGoogleLoading) return;

    if (!validate()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          confirmPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(data.error || "Unable to create account. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage("Account created successfully! Redirecting to studio...");

      if (typeof window !== "undefined" && data.user) {
        localStorage.setItem(
          "panelcraft_session",
          JSON.stringify({ user: data.user, isAuthenticated: true })
        );
      }

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 600);
    } catch {
      setErrorMessage("Network error: Unable to connect to the authentication server.");
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    if (isGoogleLoading || isSubmitting) return;
    setIsGoogleLoading(true);
    window.location.href = "/api/auth/google";
  };

  return (
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
        <h1 className="text-2xl font-bold tracking-tight text-white">Create an account</h1>
        <p className="text-sm text-slate-400 mt-1">Start crafting AI comics and graphic novels</p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-5 p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="mb-5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSignupSubmit} noValidate className="space-y-3.5">
        <div>
          <label htmlFor="name" className="block text-xs font-medium text-slate-300 mb-1.5">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            autoFocus
            disabled={isSubmitting || isGoogleLoading}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(null);
            }}
            placeholder="e.g. Alex Marlowe"
            aria-describedby={nameError ? "name-error" : undefined}
            aria-invalid={Boolean(nameError)}
            className={`w-full h-11 px-3.5 rounded-xl bg-[#090D16] border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors ${
              nameError
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-slate-800 focus:border-[#00E5FF] focus:ring-[#00E5FF]/20"
            }`}
          />
          {nameError && (
            <p id="name-error" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{nameError}</span>
            </p>
          )}
        </div>

        <div>
          <label htmlFor="signup-email" className="block text-xs font-medium text-slate-300 mb-1.5">
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            disabled={isSubmitting || isGoogleLoading}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            placeholder="Enter your email"
            aria-describedby={emailError ? "signup-email-error" : undefined}
            aria-invalid={Boolean(emailError)}
            className={`w-full h-11 px-3.5 rounded-xl bg-[#090D16] border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors ${
              emailError
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-slate-800 focus:border-[#00E5FF] focus:ring-[#00E5FF]/20"
            }`}
          />
          {emailError && (
            <p id="signup-email-error" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{emailError}</span>
            </p>
          )}
        </div>

        <div>
          <label htmlFor="signup-password" className="block text-xs font-medium text-slate-300 mb-1.5">
            Password (min. 6 characters)
          </label>
          <div className="relative">
            <input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              disabled={isSubmitting || isGoogleLoading}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              placeholder="Create a secure password"
              aria-describedby={passwordError ? "signup-password-error" : undefined}
              aria-invalid={Boolean(passwordError)}
              className={`w-full h-11 pl-3.5 pr-11 rounded-xl bg-[#090D16] border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                passwordError
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-800 focus:border-[#00E5FF] focus:ring-[#00E5FF]/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-[#00E5FF] rounded"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordError && (
            <p id="signup-password-error" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{passwordError}</span>
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-300 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              disabled={isSubmitting || isGoogleLoading}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmError) setConfirmError(null);
              }}
              placeholder="Re-enter your password"
              aria-describedby={confirmError ? "confirm-error" : undefined}
              aria-invalid={Boolean(confirmError)}
              className={`w-full h-11 pl-3.5 pr-11 rounded-xl bg-[#090D16] border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-colors ${
                confirmError
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-800 focus:border-[#00E5FF] focus:ring-[#00E5FF]/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-[#00E5FF] rounded"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {confirmError && (
            <p id="confirm-error" className="mt-1.5 text-xs text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{confirmError}</span>
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isGoogleLoading}
          className="w-full h-11 mt-1 rounded-xl bg-[#00E5FF] hover:bg-[#38BDF8] active:scale-[0.99] text-slate-950 font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-[#00E5FF]/10 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:ring-offset-2 focus:ring-offset-[#0F172A]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800" />
        </div>
        <span className="relative bg-[#0F172A] px-3 text-[11px] font-medium uppercase tracking-wider text-slate-500">
          OR
        </span>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isSubmitting}
        className="w-full h-11 rounded-xl bg-[#090D16] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-sm font-medium transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-400"
      >
        {isGoogleLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-[#00E5FF]" />
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      <div className="mt-6 text-center text-xs text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#00E5FF] hover:underline focus:outline-none focus:ring-1 focus:ring-[#00E5FF] rounded"
        >
          Sign in
        </Link>
      </div>

      <p className="mt-5 text-[11px] text-center text-slate-500 leading-normal">
        By registering, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#090D16] text-[#F8FAFC]">
      <Suspense
        fallback={
          <div className="w-full max-w-[420px] h-[580px] rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#00E5FF]" />
          </div>
        }
      >
        <SignupForm />
      </Suspense>
    </div>
  );
}
