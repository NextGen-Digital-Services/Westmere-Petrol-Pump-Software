"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePetroStore } from "@/store/usePetroStore";
import { hasPermission } from "@/lib/auth";
import { StationBrand } from "@/components/branding/StationBrand";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  Clock,
  Gauge,
  Fuel,
  Truck,
  Users,
  Building2,
  Wallet,
  UserCheck,
  BarChart3,
  Scale,
  Bell,
  ShieldCheck,
  History,
  Settings,
  ChevronRight,
  FileCheck2,
  LucideIcon,
  CircleDot,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  requiredPermission?: Parameters<typeof hasPermission>[1];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "OVERVIEW",
    items: [{ name: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "DAILY OPERATIONS",
    items: [
      { name: "Sales & POS Billing", href: "/sales", icon: Receipt },
      { name: "Shifts & Cash Safe", href: "/shifts", icon: Clock },
      { name: "Nozzles & Dispensers", href: "/dispensers", icon: Gauge },
      { name: "Tank Inventory & Dips", href: "/inventory", icon: Fuel },
      { name: "Tanker Decantation", href: "/purchases", icon: Truck },
    ],
  },
  {
    title: "STATION BUSINESS",
    items: [
      { name: "Customers & Fleet", href: "/customers", icon: Users },
      { name: "Suppliers & IOCL", href: "/suppliers", icon: Building2 },
      { name: "Expenses & Cashbook", href: "/expenses", icon: Wallet },
      { name: "Staff & Attendance", href: "/employees", icon: UserCheck },
      { name: "Compliance & Stamping", href: "/compliance", icon: FileCheck2 },
    ],
  },
  {
    title: "INTELLIGENCE & AUDIT",
    items: [
      { name: "Reports & DSR", href: "/reports", icon: BarChart3 },
      { name: "Financial Overview", href: "/financials", icon: Wallet, requiredPermission: "view_owner_financials" },
      { name: "Reconciliation", href: "/reconciliation", icon: Scale },
      { name: "Audit Trail", href: "/audit", icon: History, requiredPermission: "view_audit_logs" },
    ],
  },
  {
    title: "ADMIN & CONFIG",
    items: [
      { name: "Notifications", href: "/notifications", icon: Bell },
      { name: "Roles & Security", href: "/permissions", icon: ShieldCheck },
      { name: "Station Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { activeRole, station, currentUser, notifications } = usePetroStore();

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <StationBrand
          stationName={station.name || "CONNAUGHT STATION"}
          roCode={station.roCode || "IOCL-RO-8902"}
          oilCompany={station.oilCompany || "Indian Oil Corporation Limited"}
          logoUrl={station.logoUrl}
          size="sm"
        />

        {/* Station switcher indicator */}
        <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
          <div className="truncate pr-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              Outlet Terminal
            </span>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
              {station.name.replace("PETROFLOW EXPRESS — ", "")}
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Terminal Online" />
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => {
            if (!item.requiredPermission) return true;
            return hasPermission(activeRole, item.requiredPermission);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                {section.title}
              </div>
              {visibleItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const isNotifs = item.href === "/notifications" && unreadNotifs > 0;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all",
                      isActive
                        ? "bg-amber-500 text-white shadow-sm shadow-amber-500/20 font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                    )}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-transform group-hover:scale-105",
                          isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-amber-500"
                        )}
                        strokeWidth={isActive ? 2.25 : 1.75}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>

                    {isNotifs && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {unreadNotifs}
                      </span>
                    )}

                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-white/80 shrink-0" strokeWidth={2} />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User & Role Chip Footer */}
      <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm border border-blue-800">
            {currentUser?.name?.charAt(0) || "U"}
          </div>
          <div className="truncate flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
              {currentUser?.name || "Demo User"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                {activeRole}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
