"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePetroStore } from "@/store/usePetroStore";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/format";
import { Bell, CheckCheck, Trash2, AlertTriangle, Info, ShieldAlert, ArrowRight, Send } from "lucide-react";

export default function NotificationsPage() {
  const store = usePetroStore();
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [simulatedSendStatus, setSimulatedSendStatus] = useState("");

  const filtered = store.notifications.filter((n) => {
    if (filterSeverity === "ALL") return true;
    return n.severity === filterSeverity;
  });

  const handleSimulateWhatsApp = (title: string, message: string) => {
    setSimulatedSendStatus(`[Simulated in Demo] Sent WhatsApp alert to Owner (+91 98110 12345): "${title} - ${message}"`);
    setTimeout(() => setSimulatedSendStatus(""), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] tracking-caps uppercase text-text-muted font-semibold">
            Telemetry & Critical Alert Dispatch
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-text mt-1">
            Notification Center
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Rule-driven operational warnings: low tank buffers, variance discrepancies, overdue credit limits, and depot dues.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={store.clearAllNotifications}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Simulated Send Banner */}
      {simulatedSendStatus && (
        <div className="p-3 bg-olive/15 border border-olive/30 text-olive text-xs rounded-xl">
          {simulatedSendStatus}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex border-b border-border space-x-4">
        {["ALL", "CRITICAL", "WARNING", "INFO"].map((sev) => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`pb-2.5 text-xs font-heading tracking-wider uppercase transition-colors ${
              filterSeverity === sev
                ? "text-accent font-bold border-b-2 border-accent"
                : "text-text-muted hover:text-text font-medium"
            }`}
          >
            {sev} ({sev === "ALL" ? store.notifications.length : store.notifications.filter((n) => n.severity === sev).length})
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-text-muted border border-dashed border-border rounded-sm">
            No notifications in this category. All station parameters operating within safe limits.
          </div>
        ) : (
          filtered.map((item) => {
            const isCritical = item.severity === "CRITICAL";
            const isWarning = item.severity === "WARNING";

            return (
              <div
                key={item.id}
                className={`p-4 border rounded-sm flex items-start justify-between gap-4 transition-colors ${
                  item.isRead
                    ? "bg-card border-border opacity-75"
                    : "bg-card border-border shadow-subtle"
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-sm mt-0.5 ${
                      isCritical
                        ? "bg-brick/15 text-brick"
                        : isWarning
                        ? "bg-warning/15 text-warning"
                        : "bg-olive/15 text-olive"
                    }`}
                  >
                    {isCritical ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-xs text-text">{item.title}</h4>
                      <span className="text-[10px] text-text-faint font-mono">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      {item.message}
                    </p>

                    {item.linkUrl && (
                      <Link
                        href={item.linkUrl}
                        className="inline-flex items-center space-x-1 text-xs text-accent hover:underline mt-2 font-medium"
                      >
                        <span>Investigate Module</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSimulateWhatsApp(item.title, item.message)}
                    icon={<Send className="w-3 h-3 text-brass" />}
                    className="text-[11px] h-7 text-text-muted hover:text-text"
                    title="Send Simulated WhatsApp alert to Station Owner"
                  >
                    WhatsApp (Demo)
                  </Button>

                  {!item.isRead && (
                    <button
                      onClick={() => store.markNotificationRead(item.id)}
                      className="p-1.5 text-text-muted hover:text-text rounded-sm"
                      title="Mark as Read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
