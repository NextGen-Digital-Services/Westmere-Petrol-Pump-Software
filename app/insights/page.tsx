"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { executeInsightQuery, InsightQueryResult } from "@/lib/insights/queryEngine";
import { Button } from "@/components/ui/Button";
import { Sparkles, ArrowRight } from "lucide-react";

export default function InsightsPage() {
  const store = usePetroStore();
  const [query, setQuery] = useState("Which shift generated the highest sales?");
  const [result, setResult] = useState<InsightQueryResult>(() =>
    executeInsightQuery("Which shift generated the highest sales?", store)
  );

  const samplePrompts = [
    "How much diesel stock is remaining?",
    "Which shift generated the highest sales?",
    "What is today's total revenue?",
    "Who owes the highest credit balance?",
    "How much was spent on electricity?",
  ];

  const handleRun = (text: string) => {
    setQuery(text);
    setResult(executeInsightQuery(text, store));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <span className="text-[10px] tracking-caps uppercase text-text-muted font-semibold">
          Deterministic Data Query Engine
        </span>
        <h1 className="text-3xl font-serif font-light tracking-editorial text-text mt-1">
          Business Insights
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Query station operations in natural language. Answers and metrics are calculated deterministically from local relational store records. No external AI APIs.
        </p>
      </div>

      {/* Query Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRun(query);
        }}
        className="flex items-center space-x-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about sales, stock, shifts, debtors..."
          className="flex-1 h-12 px-4 bg-card border border-border text-sm rounded-sm text-text focus:outline-none focus:border-brass"
        />
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="bg-brass text-charcoal hover:bg-brass-light"
          icon={<Sparkles className="w-4 h-4" />}
        >
          Analyze
        </Button>
      </form>

      {/* Sample Pills */}
      <div className="flex flex-wrap gap-2 items-center text-xs">
        <span className="text-text-faint">Try asking:</span>
        {samplePrompts.map((p) => (
          <button
            key={p}
            onClick={() => handleRun(p)}
            className="px-2.5 py-1 bg-card hover:bg-card-subtle border border-border rounded-sm text-text-muted hover:text-text transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Results Box */}
      {result && (
        <div className="bg-card border border-border rounded-sm p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
            <span className="text-xs font-serif font-medium tracking-editorial uppercase text-text">
              Query Result: &quot;{result.question}&quot;
            </span>
            <span className="text-[10px] tracking-caps uppercase px-1.5 py-0.5 border border-border rounded-sm text-text-faint">
              Deterministic Logic
            </span>
          </div>

          {result.metricValue && (
            <div>
              <span className="text-[10px] tracking-caps uppercase text-text-muted block">
                {result.metricLabel}
              </span>
              <span className="text-3xl font-light tabular-nums font-sans text-brass block mt-1">
                {result.metricValue}
              </span>
            </div>
          )}

          <p className="text-xs text-text leading-relaxed font-normal">
            {result.answerSummary}
          </p>

          {result.sourceRecords && result.sourceRecords.length > 0 && (
            <div className="pt-4 border-t border-border-subtle space-y-2">
              <span className="text-[10px] tracking-caps uppercase text-text-faint font-semibold block">
                Underlying Source Records
              </span>
              <div className="space-y-1.5">
                {result.sourceRecords.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-card-subtle border border-border-subtle rounded-sm flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-text">{r.title}</p>
                      <p className="text-[11px] text-text-muted mt-0.5">{r.detail}</p>
                    </div>
                    {r.badge && (
                      <span className="text-[10px] tracking-caps uppercase px-1.5 py-0.5 border border-border rounded-sm text-text-muted">
                        {r.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
