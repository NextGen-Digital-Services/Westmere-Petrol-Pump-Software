"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface OdometerMeterProps {
  value: number; // e.g. 142850.55
  decimals?: number;
  label?: string;
  className?: string;
}

export function OdometerMeter({
  value,
  decimals = 2,
  label,
  className = "",
}: OdometerMeterProps) {
  const [displayValue, setDisplayValue] = useState<number>(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const formattedStr = displayValue.toFixed(decimals);
  const chars = formattedStr.split("");

  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      {label && (
        <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-1">
          {label}
        </span>
      )}
      <div className="inline-flex items-center bg-slate-900 border-2 border-slate-700 rounded-lg px-2.5 py-1.5 shadow-inner">
        {chars.map((ch, idx) => {
          if (ch === ".") {
            return (
              <span
                key={`dot-${idx}`}
                className="text-amber-400 font-mono font-bold text-lg px-0.5 leading-none"
              >
                .
              </span>
            );
          }

          const isDecimalDigit = idx > chars.indexOf(".");

          return (
            <div
              key={`digit-${idx}`}
              className={`w-5 h-7 mx-0.5 rounded flex items-center justify-center font-mono font-bold text-base shadow-sm ${
                isDecimalDigit
                  ? "bg-amber-500 text-slate-950" // High visibility decimal wheel
                  : "bg-slate-800 text-amber-300 border border-slate-700"
              }`}
            >
              <motion.span
                key={ch}
                initial={{ y: -8, opacity: 0.3 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {ch}
              </motion.span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
