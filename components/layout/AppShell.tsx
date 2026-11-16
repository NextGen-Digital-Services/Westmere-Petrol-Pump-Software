"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePetroStore } from "@/store/usePetroStore";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "./CommandPalette";
import { InsightsModal } from "./InsightsModal";
import { SessionTimeoutModal } from "./SessionTimeoutModal";
import { HelpDrawer } from "@/components/common/HelpDrawer";
import { ProductTour } from "@/components/common/ProductTour";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { theme } = usePetroStore();
  const [commandOpen, setCommandOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync theme class to document element
  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme]);

  // Global Keyboard Shortcuts (Cmd+K for Search, ? for Help)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      } else if (e.key === "?" && !e.shiftKey) {
        e.preventDefault();
        setHelpOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Don't render shell on /login route
  if (pathname === "/login") {
    return <main className="min-h-screen bg-surfaceLight dark:bg-slate-950 text-slate-900 dark:text-slate-100">{children}</main>;
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-surfaceLight dark:bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-surfaceLight dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <TopBar
          onOpenCommand={() => setCommandOpen(true)}
          onOpenInsights={() => setInsightsOpen(true)}
          onOpenHelp={() => setHelpOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Global Modals & Drawers */}
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
      <InsightsModal isOpen={insightsOpen} onClose={() => setInsightsOpen(false)} />
      <HelpDrawer
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        onStartTour={() => setTourOpen(true)}
      />
      <ProductTour isOpen={tourOpen} onClose={() => setTourOpen(false)} />
      <SessionTimeoutModal />
    </div>
  );
};
