"use client";

import React, { useState } from "react";
import {
  X,
  Zap,
  Check,
  ShieldCheck,
  Sparkles,
  CreditCard,
  QrCode,
  ArrowRight,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { addUserCredits } from "@/lib/storage";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
  onUpgradeSuccess: (newCredits: number) => void;
}

interface PlanOption {
  id: "plan_20" | "plan_40" | "plan_60";
  name: string;
  priceRs: number;
  credits: number;
  pagesEstimate: number;
  tag?: string;
  tagColor?: string;
  features: string[];
  popular?: boolean;
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentCredits,
  onUpgradeSuccess,
}: UpgradeModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<"plan_20" | "plan_40" | "plan_60">("plan_40");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchasedCredits, setPurchasedCredits] = useState(0);

  if (!isOpen) return null;

  const plans: PlanOption[] = [
    {
      id: "plan_20",
      name: "Starter Booster",
      priceRs: 20,
      credits: 2500,
      pagesEstimate: 250,
      tag: "Affordable Top-up",
      tagColor: "#00E5FF",
      features: [
        "2,500 Studio Credits (250 Pages)",
        "10 Credits per Comic Page",
        "Instant Credit Delivery",
        "Standard Export (PNG/JPG)",
      ],
    },
    {
      id: "plan_40",
      name: "Creator Pro",
      priceRs: 40,
      credits: 6000,
      pagesEstimate: 600,
      tag: "MOST POPULAR",
      tagColor: "#FFCC00",
      popular: true,
      features: [
        "6,000 Studio Credits (600 Pages)",
        "High-Res 4K PDF & CBZ Export",
        "Custom Character LoRA Training",
        "Priority High-Speed Queue",
        "Multi-Character Continuity Engine",
      ],
    },
    {
      id: "plan_60",
      name: "Studio Master",
      priceRs: 60,
      credits: 12000,
      pagesEstimate: 1200,
      tag: "MAXIMUM VALUE",
      tagColor: "#FF2A8D",
      features: [
        "12,000 Studio Credits (1,200 Pages)",
        "Unlimited Custom Art Styles",
        "Dedicated Multi-turn AI Engine",
        "Commercial Publishing License",
        "Full Cloud Vault Backup",
      ],
    },
  ];

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[1];

  const handleConfirmPurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newBalance = addUserCredits(selectedPlan.credits);
      setPurchasedCredits(selectedPlan.credits);
      setIsProcessing(false);
      setPurchaseSuccess(true);
      onUpgradeSuccess(newBalance);

      setTimeout(() => {
        setPurchaseSuccess(false);
        onClose();
      }, 1800);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 select-none">
      <div className="bg-[#0B0F19] border-2 border-slate-700/80 rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(0,229,255,0.15)] flex flex-col gap-5 text-slate-200 relative overflow-hidden">
        {/* Glow ambient background accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF2A8D]/10 blur-[100px] pointer-events-none rounded-full" />

        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00E5FF] to-[#FF2A8D] flex items-center justify-center text-black font-bangers text-lg shadow-md">
              ₹
            </div>
            <div>
              <h2 className="font-bangers text-2xl tracking-wide text-white leading-none">
                Studio Credit Upgrade Plans
              </h2>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Current Balance:{" "}
                <span className="text-[#00E5FF] font-bold" suppressHydrationWarning>
                  {currentCredits.toLocaleString("en-US")} Credits
                </span>{" "}
                • Rate: <span className="text-[#FFCC00]">10 Credits / Comic Page</span>
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

        {purchaseSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 relative z-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="font-bangers text-3xl text-white tracking-wide">
              Payment Successful!
            </h3>
            <p className="text-sm text-slate-300">
              Added{" "}
              <span className="font-bangers text-xl text-[#00E5FF]" suppressHydrationWarning>
                +{purchasedCredits.toLocaleString("en-US")} Credits
              </span>{" "}
              to your account.
            </p>
            <div className="text-xs font-mono text-emerald-400">
              Receipt verified • Studio credits active immediately
            </div>
          </div>
        ) : (
          <>
            {/* Plan Cards Grid: ₹20 / ₹40 / ₹60 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 relative z-10">
              {plans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#111827] border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.25)] scale-[1.02]"
                        : "bg-[#0E1424] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                    }`}
                  >
                    {/* Badge */}
                    {plan.tag && (
                      <div className="absolute -top-2.5 right-3">
                        <span
                          className="font-bangers text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full border shadow-sm font-bold"
                          style={{
                            backgroundColor: plan.popular ? "#FFCC00" : "#1E293B",
                            color: plan.popular ? "#000" : plan.tagColor,
                            borderColor: plan.tagColor,
                          }}
                        >
                          {plan.tag}
                        </span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="font-bangers text-lg text-white tracking-wide">
                        {plan.name}
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="font-bangers text-3xl text-[#00E5FF]">
                          ₹{plan.priceRs}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">one-time</span>
                      </div>

                      <div className="px-2 py-1 rounded bg-black/40 border border-slate-700/60 text-[11px] font-mono text-[#FFCC00] font-bold" suppressHydrationWarning>
                        +{plan.credits.toLocaleString("en-US")} Credits
                        <div className="text-[9px] text-slate-400 font-normal">
                          (~{plan.pagesEstimate} comic pages)
                        </div>
                      </div>

                      {/* Feature Bullet Points */}
                      <div className="space-y-1 pt-1">
                        {plan.features.map((f, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                            <Check className="w-3 h-3 text-[#00E5FF] mt-0.5 shrink-0 stroke-[3]" />
                            <span className="leading-tight">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">
                        {isSelected ? "Selected" : "Select"}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-[#00E5FF] bg-[#00E5FF] text-black"
                            : "border-slate-600"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Method Selector & Instant Checkout */}
            <div className="bg-[#0E1424] border border-slate-800 rounded-xl p-3.5 space-y-3 relative z-10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Select Payment Method</span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>256-Bit Encrypted Indian Gateway</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === "upi"
                      ? "border-[#00E5FF] bg-[#00E5FF]/10 text-white"
                      : "border-slate-800 bg-slate-900/60 text-slate-400"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>UPI / GPay / PhonePe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-[#00E5FF] bg-[#00E5FF]/10 text-white"
                      : "border-slate-800 bg-slate-900/60 text-slate-400"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#FF2A8D]" />
                  <span>Debit / Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === "netbanking"
                      ? "border-[#00E5FF] bg-[#00E5FF]/10 text-white"
                      : "border-slate-800 bg-slate-900/60 text-slate-400"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-[#FFCC00]" />
                  <span>NetBanking / IMPS</span>
                </button>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="text-xs">
                  <span className="text-slate-400">Total payable: </span>
                  <span className="font-bangers text-xl text-white">
                    ₹{selectedPlan.priceRs}
                  </span>{" "}
                  <span className="text-[10px] text-slate-400 font-mono" suppressHydrationWarning>
                    (+{selectedPlan.credits.toLocaleString("en-US")} credits)
                  </span>
                </div>

                <button
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className="comic-btn-cyan flex items-center gap-2 px-6 py-2.5 rounded-xl font-bangers text-lg tracking-wider uppercase cursor-pointer"
                >
                  <span>{isProcessing ? "Processing..." : `Upgrade for ₹${selectedPlan.priceRs}`}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
