"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthSession } from "@/types/auth";
import { saveStoredSession } from "@/lib/storage";
import { X, ShieldCheck, AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: AuthSession) => void;
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailTrimmed,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.user) {
        setIsLoading(false);
        setPassword("");
        setErrorMessage(
          data.error ||
            "Access denied. Only already registered accounts can sign in. Please verify your credentials or sign up."
        );
        return;
      }

      // Real authenticated session verified against server database
      const newSession: AuthSession = {
        isAuthenticated: true,
        user: data.user,
        accessToken: `session_${Date.now()}`,
      };

      saveStoredSession(newSession);
      onLoginSuccess(newSession);
      setIsLoading(false);
      onClose();
    } catch {
      setIsLoading(false);
      setPassword("");
      setErrorMessage("Network error: Could not reach authentication server.");
    }
  };

  const handleGoogleSignIn = () => {
    if (isGoogleLoading || isLoading) return;
    setIsGoogleLoading(true);
    setErrorMessage(null);
    // Directly redirect to official Google OAuth 2.0 flow
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none overflow-y-auto">
      <div className="bg-[#0B0F19] border-2 border-slate-700/80 rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(0,229,255,0.2)] text-slate-200 relative my-auto">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#00E5FF]/10 blur-[80px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FF2A8D]/10 blur-[80px] pointer-events-none rounded-full" />

        <div className="flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md border border-amber-400/40 bg-[#090D16] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Create Comic Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-bangers text-2xl tracking-wide text-white leading-none">
                CREATOR SIGN IN
              </h2>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Registered Creators Only • Studio Access
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 relative z-10">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleEmailPasswordSignIn} className="space-y-4 pt-4 relative z-10">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Registered Email *</span>
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. barath@gmail.com"
              disabled={isLoading || isGoogleLoading}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-[#00E5FF] text-white text-xs outline-none transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-slate-300 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Password *</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your account password"
                disabled={isLoading || isGoogleLoading}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-900 border border-slate-700 focus:border-[#00E5FF] text-white text-xs outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full comic-btn-cyan flex items-center justify-center gap-2 py-3 rounded-xl font-bangers text-lg tracking-wider uppercase cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Verifying Account...</span>
              </>
            ) : (
              <span>Sign In with Password</span>
            )}
          </button>
        </form>

        <div className="relative my-4 flex items-center justify-center z-10">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-[#0B0F19] px-2 text-[10px] font-mono text-slate-500 uppercase">
            OR
          </span>
          <div className="border-t border-slate-800 w-full" />
        </div>

        {/* Clean, Simple "Continue with Google" Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-[#00E5FF] rounded-xl font-semibold text-xs text-slate-200 flex items-center justify-center gap-2.5 transition-colors cursor-pointer relative z-10 disabled:opacity-60"
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#00E5FF]" />
              <span>Connecting to Google...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Link to sign up */}
        <div className="mt-4 text-center text-xs text-slate-400 relative z-10">
          Need an account?{" "}
          <Link
            href="/signup"
            onClick={onClose}
            className="text-[#00E5FF] hover:underline font-bold"
          >
            Sign up here
          </Link>
        </div>

        <div className="flex items-center gap-1.5 justify-center text-[10px] text-slate-500 pt-3 relative z-10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified Accounts Only • No Fake Users Allowed</span>
        </div>
      </div>
    </div>
  );
}
