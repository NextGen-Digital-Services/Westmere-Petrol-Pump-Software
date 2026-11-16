"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePetroStore } from "@/store/usePetroStore";
import { hasPermission } from "@/lib/auth";
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
  Droplets,
  LucideIcon,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
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
    title: "OPERATIONS",
    items: [
      { name: "Sales & Billing", href: "/sales", icon: Receipt },
      { name: "Shifts", href: "/shifts", icon: Clock },
      { name: "Nozzles & Dispensers", href: "/dispensers", icon: Gauge },
      { name: "Tank Inventory", href: "/inventory", icon: Fuel },
      { name: "Fuel Purchases", href: "/purchases", icon: Truck },
    ],
  },
  {
    title: "BUSINESS",
    items: [
      { name: "Customers & Fleet", href: "/customers", icon: Users },
      { name: "Suppliers", href: "/suppliers", icon: Building2 },
      { name: "Expenses & Cashbook", href: "/expenses", icon: Wallet },
      { name: "Employees", href: "/employees", icon: UserCheck },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
      { name: "Financial Overview", href: "/financials", icon: Wallet, requiredPermission: "view_owner_financials" },
      { name: "Reconciliation", href: "/reconciliation", icon: Scale },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { name: "Notifications", href: "/notifications", icon: Bell },
      { name: "User & Permissions", href: "/permissions", icon: ShieldCheck },
      { name: "Audit Logs", href: "/audit", icon: History, requiredPermission: "view_audit_logs" },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { activeRole, station, currentUser } = usePetroStore();

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-sm bg-accent flex items-center justify-center text-bg font-serif font-bold text-base tracking-widest">
            <Droplets className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <div>
            <h1 className="text-sm font-serif font-bold tracking-[0.15em] text-text leading-tight">
              PETROFLOW
            </h1>
            <p className="text-[10px] tracking-caps uppercase text-text-muted mt-0.5 font-sans">
              STATION MANAGEMENT
            </p>
          </div>
        </div>

        {/* Station switcher indicator */}
        <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between">
          <div className="truncate pr-2">
            <span className="text-[10px] tracking-caps uppercase text-text-faint block">
              Active RO Station
            </span>
            <span className="text-xs font-medium text-text truncate block mt-0.5">
              {station.name.replace("PETROFLOW EXPRESS — ", "")}
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-olive animate-pulse shrink-0" />
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => {
          // Filter items by role permissions
          const visibleItems = section.items.filter((item) => {
            if (!item.requiredPermission) return true;
            return hasPermission(activeRole, item.requiredPermission);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-medium tracking-caps uppercase text-text-faint">
                {section.title}
              </div>
              {visibleItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center justify-between px-3 py-2 text-xs font-medium rounded-sm transition-colors",
                      isActive
                        ? "bg-accent/10 text-accent font-semibold border-l-2 border-accent"
                        : "text-text-muted hover:text-text hover:bg-card-subtle"
                    )}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-accent shrink-0" strokeWidth={1.5} />
                    )}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User & Role Chip Footer */}
      <div className="p-4 border-t border-border-subtle bg-card-subtle/50">
        <div className="flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-medium text-text truncate">
              {currentUser?.name || "Demo User"}
            </p>
            <span className="inline-block mt-0.5 text-[10px] tracking-caps uppercase text-text-muted font-medium px-1.5 py-0.5 border border-border rounded-sm bg-card">
              {activeRole}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
