"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePetroStore } from "@/store/usePetroStore";
import { UserRole } from "@/types";
import {
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Sparkles,
  Eye,
} from "lucide-react";

interface TopBarProps {
  onOpenCommand: () => void;
  onOpenInsights: () => void;
}

const availableRoles: UserRole[] = [
  "Owner",
  "General Manager",
  "Shift Manager",
  "Cashier",
  "Pump Operator",
  "Accountant",
];

export const TopBar: React.FC<TopBarProps> = ({ onOpenCommand, onOpenInsights }) => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    theme,
    toggleTheme,
    currentUser,
    activeRole,
    viewAsRole,
    notifications,
    logout,
  } = usePetroStore();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
    <header className="h-16 border-b border-border bg-card px-4 lg:px-8 flex items-center justify-between select-none shrink-0 sticky top-0 z-30">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <span className="text-xs font-serif font-medium tracking-editorial uppercase text-text-muted">
          PETROFLOW
        </span>
        <span className="text-text-faint text-xs">/</span>
        <span className="text-xs font-medium tracking-wide text-text">
          {getBreadcrumb()}
        </span>
      </div>

      {/* Center: Command Search Bar + Natural Language Insights trigger */}
      <div className="hidden md:flex items-center space-x-2">
        <button
          onClick={onOpenCommand}
          className="flex items-center space-x-3 px-3 py-1.5 bg-bg border border-border rounded-sm text-xs text-text-muted hover:text-text hover:border-text-muted transition-colors w-64 lg:w-80 justify-between"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Search vehicles, bills, fleet...</span>
          </div>
          <kbd className="text-[10px] bg-card px-1.5 py-0.5 border border-border rounded-sm text-text-faint font-sans">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={onOpenInsights}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-card border border-brass/30 text-brass hover:bg-brass/10 rounded-sm text-xs font-medium transition-colors"
          title="Deterministic Natural Language Insights"
        >
          <Sparkles className="w-3.5 h-3.5 text-brass" strokeWidth={1.5} />
          <span>Insights</span>
        </button>
      </div>

      {/* Right: Role Switcher + Actions */}
      <div className="flex items-center space-x-2 lg:space-x-4">
        {/* View as Role Switcher */}
        {currentUser?.role === "Owner" && (
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center space-x-1.5 px-2.5 py-1 text-xs border border-border hover:border-accent rounded-sm text-text bg-bg transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
              <span className="text-[11px] text-text-muted hidden sm:inline">Role:</span>
              <span className="font-semibold text-text text-xs">{activeRole}</span>
              <ChevronDown className="w-3 h-3 text-text-muted ml-1" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-sm shadow-raised py-1 z-40">
                <div className="px-3 py-1 text-[10px] tracking-caps uppercase text-text-faint border-b border-border-subtle">
                  Preview Experience
                </div>
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      viewAsRole(role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                      activeRole === role
                        ? "bg-accent/10 text-accent font-medium"
                        : "text-text-muted hover:text-text hover:bg-card-subtle"
                    }`}
                  >
                    <span>{role}</span>
                    {activeRole === role && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Bell */}
        <button
          onClick={() => router.push("/notifications")}
          className="relative p-2 text-text-muted hover:text-text rounded-sm hover:bg-card-subtle transition-colors"
          title="Station Notifications"
        >
          <Bell className="w-4 h-4" strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brick ring-2 ring-card" />
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-text-muted hover:text-text rounded-sm hover:bg-card-subtle transition-colors"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} theme`}
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-brass" strokeWidth={1.5} />
          ) : (
            <Moon className="w-4 h-4 text-olive" strokeWidth={1.5} />
          )}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2 pl-2 border-l border-border"
          >
            <div className="w-7 h-7 rounded-sm bg-border flex items-center justify-center text-xs font-serif font-bold text-text">
              {currentUser?.name?.charAt(0) || "U"}
            </div>
            <ChevronDown className="w-3 h-3 text-text-muted hidden sm:block" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-sm shadow-raised py-2 z-40">
              <div className="px-4 py-2 border-b border-border-subtle">
                <p className="text-xs font-medium text-text">{currentUser?.name}</p>
                <p className="text-[11px] text-text-muted truncate">{currentUser?.email}</p>
                <span className="inline-block mt-1 text-[10px] tracking-caps uppercase text-accent font-semibold">
                  {currentUser?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs text-brick hover:bg-card-subtle flex items-center space-x-2 transition-colors mt-1"
              >
                <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
