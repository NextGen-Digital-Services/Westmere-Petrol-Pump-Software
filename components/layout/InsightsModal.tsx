"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { executeInsightQuery, InsightQueryResult } from "@/lib/insights/queryEngine";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Sparkles, ArrowRight, CornerDownLeft } from "lucide-react";

export interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InsightsModal: React.FC<InsightsModalProps> = ({ isOpen, onClose }) => {
  const store = usePetroStore();
  const [inputQuery, setInputQuery] = useState("");
  const [result, setResult] = useState<InsightQueryResult | null>(null);

  const samplePrompts = [
    "How much diesel stock is remaining?",
    "Which shift generated the highest sales?",
    "What is today's total revenue?",
    "Who owes the highest credit balance?",
    "How much was spent on electricity?",
  ];

  const handleRunQuery = (q: string) => {
    if (!q.trim()) return;
    setInputQuery(q);
    const res = executeInsightQuery(q, store);
    setResult(res);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Station Business Insights"
      subtitle="Deterministic local query engine — answers derived directly from live station records"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Query Input */}
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunQuery(inputQuery);
            }}
            className="flex items-center space-x-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask a question about sales, stock, shifts, debtors..."
                className="w-full h-11 pl-4 pr-10 bg-bg border border-border text-sm rounded-sm text-text focus:outline-none focus:border-brass"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="bg-brass text-charcoal hover:bg-brass-light"
              icon={<Sparkles className="w-4 h-4" />}
            >
              Analyze
            </Button>
          </form>

          {/* Quick Sample Prompts */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-[11px] text-text-faint self-center mr-1">Examples:</span>
            {samplePrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleRunQuery(p)}
                className="text-xs px-2.5 py-1 bg-card-subtle hover:bg-border text-text-muted hover:text-text rounded-sm transition-colors border border-border-subtle"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Query Result Card */}
        {result && (
          <div className="border border-border rounded-sm bg-card-subtle p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <span className="text-xs font-serif font-medium tracking-editorial uppercase text-text-muted">
                Insight Analysis
              </span>
              <span className="text-[10px] tracking-caps uppercase px-1.5 py-0.5 border border-border text-text-faint rounded-sm">
                Deterministic
              </span>
            </div>

            {/* Answer Figure */}
            {result.metricValue && (
              <div className="py-2">
                <span className="text-[11px] tracking-caps uppercase text-text-muted block">
                  {result.metricLabel}
                </span>
                <span className="text-3xl font-light tabular-nums font-sans text-brass block mt-1">
                  {result.metricValue}
                </span>
              </div>
            )}

            <p className="text-xs leading-relaxed text-text font-normal">
              {result.answerSummary}
            </p>

            {/* Source Records */}
            {result.sourceRecords && result.sourceRecords.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border-subtle">
                <span className="text-[10px] tracking-caps uppercase text-text-faint font-semibold block mb-2">
                  Underlying Source Records
                </span>
                <div className="space-y-1.5">
                  {result.sourceRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-2.5 bg-card border border-border-subtle rounded-sm flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-medium text-text">{rec.title}</p>
                        <p className="text-[11px] text-text-muted">{rec.detail}</p>
                      </div>
                      {rec.badge && (
                        <span className="text-[10px] tracking-caps uppercase px-1.5 py-0.5 border border-border rounded-sm text-text-muted">
                          {rec.badge}
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
    </Modal>
  );
};
