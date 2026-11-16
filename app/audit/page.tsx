"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { hasPermission } from "@/lib/auth";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { formatDateTime } from "@/lib/format";
import { AuditLog } from "@/types";
import { Shield, Eye, ShieldAlert } from "lucide-react";

export default function AuditPage() {
  const store = usePetroStore();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filterAction, setFilterAction] = useState("ALL");
  const [filterUser, setFilterUser] = useState("ALL");

  const canView = hasPermission(store.activeRole, "view_audit_logs");

  if (!canView) {
    return (
      <div className="p-12 text-center border border-dashed border-border rounded-sm bg-card/40 my-8">
        <ShieldAlert className="w-10 h-10 text-brick mx-auto mb-3" />
        <h2 className="text-xl font-serif font-medium text-text">Restricted Access</h2>
        <p className="text-xs text-text-muted mt-1 max-w-sm mx-auto">
          Audit trails and immutable operational logs require Owner or General Manager security clearance.
        </p>
      </div>
    );
  }

  const filteredLogs = store.auditLogs.filter((log) => {
    if (filterAction !== "ALL" && log.action !== filterAction) return false;
    if (filterUser !== "ALL" && log.userName !== filterUser) return false;
    return true;
  });

  const uniqueActions = Array.from(new Set(store.auditLogs.map((l) => l.action)));
  const uniqueUsers = Array.from(new Set(store.auditLogs.map((l) => l.userName)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] tracking-caps uppercase text-text-muted font-semibold">
            Immutable Regulatory Ledger
          </span>
          <h1 className="text-3xl font-serif font-light tracking-editorial text-text mt-1">
            System Audit Trails & Diffs
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Tamper-proof event stream recording who created, edited, approved, or reversed every financial and operational record.
          </p>
        </div>

        <div className="text-right text-xs text-text-muted">
          <span>Failed Login Attempts: </span>
          <strong className="text-text tabular-nums">{store.failedLoginAttempts}</strong>
          {store.isLockedOut && <span className="text-brick font-semibold ml-2">(Locked)</span>}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-card border border-border rounded-sm p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-48">
            <Select
              label="Filter Action"
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="h-8 text-xs py-0"
            >
              <option value="ALL">All Actions ({store.auditLogs.length})</option>
              {uniqueActions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-48">
            <Select
              label="Filter User"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="h-8 text-xs py-0"
            >
              <option value="ALL">All Users</option>
              {uniqueUsers.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <span className="text-xs text-text-muted">
          Showing <strong className="text-text tabular-nums">{filteredLogs.length}</strong> audited events
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-card-subtle border-b border-border">
              <tr>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Timestamp</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">User</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Role</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Action</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Entity / Ref</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Description</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-center">Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-card-subtle/40">
                  <td className="p-3 text-text-muted">{formatDateTime(log.createdAt)}</td>
                  <td className="p-3 font-medium text-text">{log.userName}</td>
                  <td className="p-3">
                    <span className="inline-block px-1.5 py-0.5 text-[9px] tracking-caps uppercase border border-border rounded-sm text-text-muted bg-card">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-semibold text-accent text-[11px]">{log.action}</td>
                  <td className="p-3 text-text-muted">{log.entity}: {log.entityId}</td>
                  <td className="p-3 text-text leading-tight">{log.description}</td>
                  <td className="p-3 text-center">
                    {(log.beforeState || log.afterState) ? (
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1 text-text-muted hover:text-text rounded-sm"
                        title="View Before / After JSON Diff"
                      >
                        <Eye className="w-3.5 h-3.5 inline" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-text-faint">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Before / After Diff Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={`Audit State Inspection: ${selectedLog?.action}`}
        subtitle={`User: ${selectedLog?.userName} (${selectedLog?.userRole}) • ${selectedLog?.entity}: ${selectedLog?.entityId}`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-text-muted">{selectedLog?.description}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] tracking-caps uppercase text-brick font-semibold block mb-1">
                Before State
              </span>
              <pre className="p-3 bg-bg border border-border text-[11px] font-mono rounded-sm text-text overflow-x-auto max-h-64">
                {JSON.stringify(selectedLog?.beforeState || {}, null, 2)}
              </pre>
            </div>

            <div>
              <span className="text-[10px] tracking-caps uppercase text-olive font-semibold block mb-1">
                After State
              </span>
              <pre className="p-3 bg-bg border border-border text-[11px] font-mono rounded-sm text-text overflow-x-auto max-h-64">
                {JSON.stringify(selectedLog?.afterState || {}, null, 2)}
              </pre>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
