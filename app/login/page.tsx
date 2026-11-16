"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePetroStore } from "@/store/usePetroStore";
import { UserRole } from "@/types";
import { demoUsers } from "@/seed/demoData";
import { StationBrand } from "@/components/branding/StationBrand";
import { BRAND_COLORS } from "@/lib/theme";
import {
  ShieldCheck,
  Fuel,
  TrendingUp,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const {
    login,
    station,
    isLockedOut,
    lockoutUntil,
  } = usePetroStore();

  const [email, setEmail] = useState("owner@petroflow.in");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("Owner");

  const isLockActive = Boolean(isLockedOut && lockoutUntil && Date.now() < lockoutUntil);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockActive) {
      setErrorMsg("Terminal temporarily locked due to repeated failed attempts.");
      return;
    }

    const success = login(email, selectedRole);
    if (success) {
      router.push("/");
    } else {
      setErrorMsg("Invalid credentials. Please verify your station email.");
    }
  };

  const handleQuickLoginAs = (role: UserRole) => {
    setSelectedRole(role);
    const user = demoUsers.find((u) => u.role === role);
    if (user) {
      setEmail(user.email);
      login(user.email, role);
      router.push("/");
    }
  };

  const trustPoints = [
    {
      icon: Fuel,
      title: "Real-time Tank & Dip Telemetry",
      desc: "Live underground stock tracking with automatic variance detection",
    },
    {
      icon: TrendingUp,
      title: "Shift Reconciliation & Cash Float",
      desc: "Zero-leakage shift closing, safe cash denomination & digital tenders",
    },
    {
      icon: ShieldCheck,
      title: "Statutory Compliance & Stamping",
      desc: "Legal Metrology, PESO licenses, 6:00 AM daily price revision log",
    },
  ];

  const rolePills: { role: UserRole; title: string; avatarColor: string }[] = [
    { role: "Owner", title: "Vikramaditya (Owner)", avatarColor: BRAND_COLORS.ioclSaffron },
    { role: "General Manager", title: "Rajesh (GM)", avatarColor: BRAND_COLORS.ioclBlue },
    { role: "Shift Manager", title: "Amit (Shift Mgr)", avatarColor: BRAND_COLORS.upi },
    { role: "Cashier", title: "Pooja (Cashier)", avatarColor: BRAND_COLORS.cash },
    { role: "Pump Operator", title: "Ramesh (Operator)", avatarColor: "#0891B2" },
    { role: "Accountant", title: "Sunil (CA)", avatarColor: BRAND_COLORS.credit },
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-surfaceLight dark:bg-slate-950 font-body">
      {/* Left 55%: Cinematic Video & Brand Panel */}
      <div className="lg:col-span-7 relative min-h-[420px] lg:min-h-screen overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:p-14 text-white">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/media/login-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/media/login-banner.webm" type="video/webm" />
          <source src="/media/login-banner.mp4" type="video/mp4" />
        </video>

        {/* Cinematic Gradient Overlays (Deep IndianOil blue + midnight tone) */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-900/60 z-10" />
        <div className="absolute inset-0 bg-radial-at-t from-transparent via-transparent to-slate-950/90 z-10" />

        {/* Top Brand Bar */}
        <div className="relative z-20 flex items-center justify-between">
          <StationBrand
            stationName={station.name || "CONNAUGHT STATION"}
            roCode={station.roCode || "IOCL-RO-8902"}
            oilCompany={station.oilCompany || "Indian Oil Corporation Limited"}
            logoUrl={station.logoUrl}
            size="md"
            variant="light"
          />

          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white/90">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Retail Outlet Terminal Active</span>
          </div>
        </div>

        {/* Hero Headline & Trust Points */}
        <div className="relative z-20 my-auto py-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Indian Oil Retail Outlet Edition</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-heading leading-tight text-white">
            Precision fueling, stock integrity & automated shift closing.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
            Built for modern Indian retail petroleum dealerships. Monitor tank dips, dispenser totalizers, safe cash, and fleet credit with zero paperwork.
          </p>

          {/* Trust Points */}
          <div className="mt-8 grid grid-cols-1 gap-3.5 pt-6 border-t border-white/15">
            {trustPoints.map((pt, idx) => {
              const Icon = pt.icon;
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shrink-0 text-amber-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{pt.title}</h3>
                    <p className="text-xs text-slate-300">{pt.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-20 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-white/10">
          <span>{station.address}</span>
          <span className="font-mono text-amber-400 font-semibold">PETROFLOW v2.0 Enterprise</span>
        </div>
      </div>

      {/* Right 45%: Clean Login Card & Role Quick-Switch */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/80 dark:border-slate-800">
          {/* Top Saffron / Blue Indian Oil accent stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-600 to-blue-700 rounded-full mb-6" />

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading">
              Station Terminal Sign-In
            </h2>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Select your role or enter credentials to open the station dashboard.
            </p>
          </div>

          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Staff Email / Operator ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@petroflow.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password / PIN
                </label>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer">
                  Forgot PIN?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <span>Remember this station terminal</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLockActive}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Sign In to Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Role Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quick Demo Switcher
              </span>
              <span className="text-[10px] text-slate-400">One-click role login</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {rolePills.map((p) => (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleQuickLoginAs(p.role)}
                  className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-slate-800/80 transition-all text-left group"
                >
                  <span
                    className="w-6 h-6 rounded-lg text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: p.avatarColor }}
                  >
                    {p.role.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
                      {p.role}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {p.title.split("(")[0].trim()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
