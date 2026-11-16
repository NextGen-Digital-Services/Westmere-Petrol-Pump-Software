"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Clock,
  Fuel,
  Menu,
  X,
  Users,
  Building2,
  Wallet,
  BarChart3,
  Settings,
  Scale,
  Gauge,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const MobileNav: React.FC = () => {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const mainTabs = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Billing", href: "/sales", icon: Receipt },
    { name: "Shifts", href: "/shifts", icon: Clock },
    { name: "Tanks", href: "/inventory", icon: Fuel },
  ];

  const drawerLinks = [
    { name: "Nozzles & Dispensers", href: "/dispensers", icon: Gauge },
    { name: "Fuel Purchases", href: "/purchases", icon: Truck },
    { name: "Customers & Fleet", href: "/customers", icon: Users },
    { name: "Suppliers", href: "/suppliers", icon: Building2 },
    { name: "Expenses & Cashbook", href: "/expenses", icon: Wallet },
    { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
    { name: "Reconciliation", href: "/reconciliation", icon: Scale },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-charcoal-700/60 backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-6 rounded-t-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <span className="text-xs font-serif font-bold tracking-editorial uppercase">
                Petroflow Navigation
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 text-text-muted hover:text-text"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {drawerLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "flex items-center space-x-2.5 p-3 rounded-sm text-xs font-medium border transition-colors",
                      isActive
                        ? "bg-accent/10 border-accent text-accent"
                        : "bg-bg border-border text-text hover:bg-card-subtle"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                    <span className="truncate">{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Mobile Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border h-16 flex items-center justify-around px-2 z-40 select-none">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-1 text-[10px] tracking-wide font-medium transition-colors",
                isActive ? "text-accent" : "text-text-muted hover:text-text"
              )}
            >
              <Icon className="w-5 h-5 mb-0.5" strokeWidth={1.5} />
              <span>{tab.name}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] tracking-wide font-medium text-text-muted hover:text-text"
        >
          <Menu className="w-5 h-5 mb-0.5" strokeWidth={1.5} />
          <span>More</span>
        </button>
      </nav>
    </>
  );
};
