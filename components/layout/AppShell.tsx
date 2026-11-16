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

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { theme } = usePetroStore();
  const [commandOpen, setCommandOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
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

  // Don't render shell on /login route
  if (pathname === "/login") {
    return <main className="min-h-screen bg-bg text-text">{children}</main>;
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-bg text-text">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <TopBar
          onOpenCommand={() => setCommandOpen(true)}
          onOpenInsights={() => setInsightsOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Global Modals */}
      <CommandPalette isOpen={commandOpen} onClose={() => setCommandOpen(false)} />
      <InsightsModal isOpen={insightsOpen} onClose={() => setInsightsOpen(false)} />
      <SessionTimeoutModal />
    </div>
  );
};
