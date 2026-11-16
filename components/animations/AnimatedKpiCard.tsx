"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AnimatedKpiCardProps {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  subtitle?: string;
  delta?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: string; // hex color for top border e.g. #F37021
  icon?: LucideIcon;
  illustration?: React.ReactNode;
  badge?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function AnimatedKpiCard({
  title,
  value,
  prefix = "",
  suffix = "",
  subtitle,
  delta,
  accentColor = "#F37021",
  icon: Icon,
  illustration,
  badge,
  onClick,
  className = "",
}: AnimatedKpiCardProps) {
  // If value is numeric, count up smoothly
  const isNumeric = typeof value === "number";
  const [displayValue, setDisplayValue] = useState<number>(isNumeric ? 0 : 0);

  useEffect(() => {
    if (!isNumeric) return;
    const target = Number(value);
    const duration = 800; // ms
    const steps = 30;
    const stepTime = duration / steps;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setDisplayValue(target);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, isNumeric]);

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-shadow hover:shadow-md ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {/* Top Accent Stripe (LogiVenture Signature Style) */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: accentColor }}
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {badge}
            {illustration ? (
              <div className="p-1 rounded-lg bg-slate-50 dark:bg-slate-800">
                {illustration}
              </div>
            ) : Icon ? (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${accentColor}18`, color: accentColor }}
              >
                <Icon className="w-4 h-4" />
              </div>
            ) : null}
          </div>
        </div>

        {/* Main Value Display */}
        <div className="flex items-baseline gap-1 mt-1">
          {prefix && (
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {prefix}
            </span>
          )}
          <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 font-heading">
            {isNumeric ? displayValue.toLocaleString("en-IN") : value}
          </span>
          {suffix && (
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {suffix}
            </span>
          )}
        </div>

        {/* Bottom Metadata: Delta or Subtitle */}
        <div className="mt-3 flex items-center justify-between text-xs">
          {delta && (
            <span
              className={`inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded ${
                delta.isPositive
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
              }`}
            >
              <span>{delta.isPositive ? "↑" : "↓"}</span>
              {delta.value}
              {delta.label && <span className="font-normal opacity-80">{delta.label}</span>}
            </span>
          )}
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 truncate max-w-full">
              {subtitle}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
