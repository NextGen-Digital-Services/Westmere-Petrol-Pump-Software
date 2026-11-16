"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePetroStore } from "@/store/usePetroStore";
import { UserRole } from "@/types";
import { demoUsers } from "@/seed/demoData";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Droplets, ShieldAlert, KeyRound, ChevronDown, ChevronUp } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const {
    login,
    failedLoginAttempts,
    isLockedOut,
    lockoutUntil,
    resetFailedLogins,
  } = usePetroStore();

  const [email, setEmail] = useState("owner@petroflow.in");
  const [password, setPassword] = useState("••••••••");
  const [errorMsg, setErrorMsg] = useState("");
  const [showDemoCredentials, setShowDemoCredentials] = useState(true);

  const isLockActive = Boolean(isLockedOut && lockoutUntil && Date.now() < lockoutUntil);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockActive) {
      setErrorMsg("Terminal temporarily locked due to repeated failed attempts.");
      return;
    }

    const success = login(email);
    if (success) {
      router.push("/");
    } else {
      setErrorMsg("Invalid credentials. Please verify your station email.");
    }
  };

  const handleQuickLoginAs = (role: UserRole) => {
    const user = demoUsers.find((u) => u.role === role);
    if (user) {
      setEmail(user.email);
      login(user.email, role);
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-charcoal text-ivory">
      {/* Left Column: Brand & Editorial Manifesto */}
      <div className="lg:col-span-5 p-8 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-charcoal-200 bg-charcoal-400">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-sm bg-brass text-charcoal flex items-center justify-center font-bold">
              <Droplets className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <span className="text-sm font-serif font-bold tracking-[0.15em] text-ivory block leading-tight">
                PETROFLOW
              </span>
              <span className="text-[9px] tracking-caps uppercase text-brass block">
                STATION MANAGEMENT
              </span>
            </div>
          </div>

          <div className="mt-16 lg:mt-24 max-w-md">
            <span className="text-[11px] tracking-caps uppercase text-brass font-medium block mb-3">
              Retail Outlet Operations
            </span>
            <h1 className="text-3xl lg:text-4xl font-serif font-light leading-tight tracking-editorial text-ivory">
              Precision fuel retail telemetry, shift reconciliation, and inventory control.
            </h1>
            <p className="mt-6 text-xs text-ivory-600 leading-relaxed">
              Designed for retail petroleum enterprises adhering to Indian statutory weights & measures,
              underground tank calibration standards, and strict multi-shift tender reconciliation.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-charcoal-200 mt-12 text-[11px] text-ivory-600 flex items-center justify-between">
          <span>Connaught RO Terminal 01</span>
          <span className="tabular-nums">v1.0.0 Enterprise</span>
        </div>
      </div>

      {/* Right Column: Login Form & Role Selector */}
      <div className="lg:col-span-7 p-8 lg:p-16 flex flex-col justify-center items-center bg-charcoal">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-serif font-medium tracking-editorial text-ivory">
              Station Terminal Access
            </h2>
            <p className="mt-1 text-xs text-ivory-600">
              Enter your authorized staff email to access station operations.
            </p>
          </div>

          {/* Lockout Warning */}
          {isLockActive && (
            <div className="p-4 bg-brick/15 border border-brick/30 text-brick text-xs rounded-sm flex items-start space-x-3">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Terminal Security Lockout</p>
                <p className="mt-0.5 text-[11px]">
                  5 consecutive failed attempts detected. Terminal locked for 5 minutes.
                </p>
                <button
                  onClick={resetFailedLogins}
                  className="mt-2 underline text-[11px] hover:opacity-80"
                >
                  Reset Security Lock (Demo Override)
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label="Staff Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. owner@petroflow.in"
              required
              className="bg-charcoal-200 border-charcoal-100 text-ivory"
            />

            <Input
              label="Passcode"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-charcoal-200 border-charcoal-100 text-ivory"
            />

            {errorMsg && <p className="text-xs text-brick">{errorMsg}</p>}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full bg-brass text-charcoal font-semibold hover:bg-brass-light"
              disabled={isLockActive}
            >
              Authenticate & Enter Terminal
            </Button>
          </form>

          {/* Collapsible Demo Credentials Panel */}
          <div className="border border-charcoal-200 rounded-sm bg-charcoal-300 p-4">
            <button
              type="button"
              onClick={() => setShowDemoCredentials(!showDemoCredentials)}
              className="w-full flex items-center justify-between text-xs text-brass font-medium"
            >
              <div className="flex items-center space-x-2">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Instant Demo Role Switcher</span>
              </div>
              {showDemoCredentials ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {showDemoCredentials && (
              <div className="mt-4 pt-3 border-t border-charcoal-200 grid grid-cols-2 gap-2">
                {demoUsers.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLoginAs(u.role)}
                    className="text-left p-2.5 rounded-sm bg-charcoal-200 hover:bg-charcoal-100 border border-charcoal-100 transition-colors"
                  >
                    <span className="text-[10px] tracking-caps uppercase text-brass block font-semibold">
                      {u.role}
                    </span>
                    <span className="text-xs text-ivory block truncate mt-0.5">
                      {u.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
