"use client";

import React from "react";

interface LivePulseBadgeProps {
  label?: string;
  variant?: "saffron" | "green" | "blue" | "danger";
  size?: "sm" | "md";
  className?: string;
}

export function LivePulseBadge({
  label = "LIVE",
  variant = "saffron",
  size = "md",
  className = "",
}: LivePulseBadgeProps) {
  const colorStyles = {
    saffron: {
      bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60",
      dot: "bg-amber-500",
      ping: "bg-amber-400",
    },
    green: {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60",
      dot: "bg-emerald-500",
      ping: "bg-emerald-400",
    },
    blue: {
      bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/60",
      dot: "bg-blue-600",
      ping: "bg-blue-400",
    },
    danger: {
      bg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60",
      dot: "bg-rose-500",
      ping: "bg-rose-400",
    },
  }[variant];

  const sizeStyles = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold border rounded-full font-mono uppercase tracking-wider ${colorStyles.bg} ${sizeStyles} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorStyles.ping}`}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${colorStyles.dot}`} />
      </span>
      {label}
    </span>
  );
}
