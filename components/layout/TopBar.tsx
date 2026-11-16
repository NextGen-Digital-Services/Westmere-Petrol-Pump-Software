"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePetroStore } from "@/store/usePetroStore";
import { UserRole } from "@/types";
import { BRAND_COLORS, getFuelColor } from "@/lib/theme";
import {
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Sparkles,
  HelpCircle,
  Clock,
  Fuel,
  Shield,
  UserCheck,
} from "lucide-react";

interface TopBarProps {
  onOpenCommand: () => void;
  onOpenInsights: () => void;
  onOpenHelp?: () => void;
}

const availableRoles: UserRole[] = [
  "Owner",
  "General Manager",
  "Shift Manager",
  "Cashier",
  "Pump Operator",
  "Accountant",
];

export const TopBar: React.FC<TopBarProps> = ({
  onOpenCommand,
  onOpenInsights,
  onOpenHelp,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    theme,
    toggleTheme,
    currentUser,
    activeRole,
    viewAsRole,
    notifications,
    fuelPrices,
    shifts,
    logout,
  } = usePetroStore();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Active shift
  const activeShift = shifts.find((s) => s.status === "OPEN");

  // Breadcrumb generator
  const getBreadcrumb = () => {
    if (pathname === "/") return "Overview / Dashboard";
    const segment = pathname.substring(1);
    const capitalized = segment.charAt(0).toUpperCase() + segment.slice(1);
    return `${capitalized}`;
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 border-b border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 lg:px-6 flex items-center justify-between select-none shrink-0 sticky top-0 z-30 shadow-xs">
      {/* Left: Breadcrumbs & Station Quick Info */}
      <div className="flex items-center space-x-3">
        <span className="text-xs font-bold font-heading tracking-wider uppercase text-amber-600 dark:text-amber-500">
          PETROFLOW
        </span>
        <span className="text-slate-300 dark:text-slate-700 text-xs font-light">/</span>
        <span className="text-xs font-bold tracking-tight text-slate-800 dark:text-slate-200">
          {getBreadcrumb()}
        </span>

        {/* Active Shift Indicator Pill */}
        {activeShift ? (
          <div className="hidden xl:inline-flex items-center gap-1.5 ml-3 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{activeShift.name} Shift Active</span>
          </div>
        ) : (
          <div className="hidden xl:inline-flex items-center gap-1.5 ml-3 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px]">
            <span>No Shift Active</span>
          </div>
        )}
      </div>

      {/* Center: Live Rates Ticker + Live Clock */}
      <div className="hidden lg:flex items-center gap-4">
        {/* Dynamic Fuel Rate Ticker */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Today&apos;s Rates (06:00 AM)
          </span>
          <div className="h-3 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
          {fuelPrices.map((fp) => {
            const color = getFuelColor(fp.fuelType);
            const shortName =
              fp.fuelType === "Petrol"
                ? "MS"
                : fp.fuelType === "Diesel"
                ? "HSD"
                : fp.fuelType === "Speed Petrol"
                ? "XP95"
                : fp.fuelType;
            return (
              <div key={fp.id} className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-slate-600 dark:text-slate-400">{shortName}:</span>
                <span className="text-slate-900 dark:text-slate-100">
                  ₹{(fp.salePricePaise / 100).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live Clock */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{currentTime || "06:00:00"}</span>
        </div>
      </div>

      {/* Right: Actions, Search, Help, Notifications, User */}
      <div className="flex items-center space-x-2">
        {/* Search Bar / Trigger */}
        <button
          onClick={onOpenCommand}
          className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 dark:text-slate-400 transition-colors"
          title="Universal Search (⌘K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline text-[10px] bg-white dark:bg-slate-900 px-1 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Insights AI button */}
        <button
          onClick={onOpenInsights}
          className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-amber-700 dark:text-amber-400 hover:bg-amber-100/80 rounded-xl text-xs font-bold transition-colors"
          title="Station Intelligence"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Insights</span>
        </button>

        {/* Help Drawer Trigger */}
        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Station Glossary & SOP Guides (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Icon with Unread Badge */}
        <button
          onClick={() => router.push("/notifications")}
          className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="truncate max-w-[90px]">{activeRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                Switch Perspective
              </div>
              {availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    viewAsRole(role);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors ${
                    activeRole === role
                      ? "font-bold text-amber-600 dark:text-amber-400"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span>{role}</span>
                  {activeRole === role && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-8 h-8 rounded-full bg-blue-900 text-white font-bold text-xs flex items-center justify-center ring-2 ring-amber-500/30 hover:ring-amber-500 transition-all"
            title={currentUser?.name}
          >
            {currentUser?.name?.charAt(0) || "U"}
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {currentUser?.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60">
                  {activeRole}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of Terminal</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
