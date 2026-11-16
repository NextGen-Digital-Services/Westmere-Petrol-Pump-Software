"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { ComplianceDocument, InspectionChecklist, StationAsset, LubricantProduct } from "@/types";
import { PageTransition } from "@/components/animations/PageTransition";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { LubricantBottleIllustration, PressureGaugeIllustration } from "@/components/illustrations/EquipmentIllustrations";
import { formatPaise, formatDate, formatDateTime } from "@/lib/format";
import { BRAND_COLORS } from "@/lib/theme";
import {
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Wrench,
  Package,
  Calendar,
  Phone,
  FileText,
  Sparkles,
} from "lucide-react";

export default function CompliancePage() {
  const store = usePetroStore();
  const [activeTab, setActiveTab] = useState<"vault" | "checklist" | "assets" | "lubricants">("vault");

  // Modal states
  const [addDocModalOpen, setAddDocModalOpen] = useState(false);
  const [addTicketModalOpen, setAddTicketModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [ticketDesc, setTicketDesc] = useState("");
  const [ticketCostRupees, setTicketCostRupees] = useState("2500");

  const [sellLubeModalOpen, setSellLubeModalOpen] = useState(false);
  const [selectedLubeId, setSelectedLubeId] = useState(store.lubricants[0]?.id || "");
  const [lubeQuantity, setLubeQuantity] = useState("1");
  const [lubePayMethod, setLubePayMethod] = useState("CASH");

  // New Document form
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState<ComplianceDocument["category"]>("PESO");
  const [docNumber, setDocNumber] = useState("");
  const [issuingAuth, setIssuingAuth] = useState("");
  const [expiryDate, setExpiryDate] = useState("2027-12-31");
  const [docNotes, setDocNotes] = useState("");

  // Calculate compliance score
  const totalDocs = store.complianceDocs.length;
  const validDocs = store.complianceDocs.filter((d) => d.status === "VALID").length;
  const complianceScore = totalDocs > 0 ? Math.round((validDocs / totalDocs) * 100) : 100;

  const handleAddDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addComplianceDoc({
      title: docTitle,
      category: docCategory,
      documentNumber: docNumber,
      issuingAuthority: issuingAuth,
      issueDate: new Date().toISOString().split("T")[0],
      expiryDate,
      status: "VALID",
      notes: docNotes,
    });
    setAddDocModalOpen(false);
    setDocTitle("");
    setDocNumber("");
  };

  const handleAddTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return;
    store.addAssetTicket(selectedAssetId, {
      description: ticketDesc,
      costPaise: Math.round((parseFloat(ticketCostRupees) || 0) * 100),
    });
    setAddTicketModalOpen(false);
    setTicketDesc("");
  };

  const handleSellLubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(lubeQuantity) || 1;
    store.sellLubricant(selectedLubeId, qty, undefined, lubePayMethod);
    setSellLubeModalOpen(false);
  };

  const handleSignOffInspection = (checklistId: string) => {
    store.signOffInspection(checklistId, store.currentUser?.name || "Shift Manager");
  };

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200/90 dark:border-slate-800">
        <div>
          <span className="text-[10px] tracking-wider uppercase text-amber-600 dark:text-amber-500 font-bold">
            Statutory Vault & Asset Integrity
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading text-slate-900 dark:text-slate-100 mt-1">
            Compliance Vault & Forecourt Assets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            PESO explosive licenses, Legal Metrology stamping, daily safety checklists, AMC asset logs, and Servo lubricants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "vault" && (
            <button
              onClick={() => setAddDocModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center gap-1.5 shadow-sm shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document</span>
            </button>
          )}

          {activeTab === "lubricants" && (
            <button
              onClick={() => setSellLubeModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white inline-flex items-center gap-1.5 shadow-sm shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Sell Servo Lubricant</span>
            </button>
          )}
        </div>
      </div>

      {/* Compliance Health Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-2xl text-amber-400 shrink-0 font-mono">
            {complianceScore}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                AUDIT READY
              </span>
              <span className="text-xs text-slate-300">Indian Oil Dealership Score</span>
            </div>
            <h3 className="text-lg font-bold font-heading text-white mt-1">
              Station Statutory Compliance Index
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-md">
              All 6 mandatory statutory certificates active: PESO Form XIV, Legal Metrology, Fire NOC, DPCC Consent, GST, and Public Liability Insurance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-white/15 pt-4 md:pt-0 md:pl-6 text-xs text-slate-300">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Valid Certificates
            </span>
            <span className="text-xl font-bold font-mono text-white mt-0.5 block">
              {validDocs} / {totalDocs}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Forecourt Assets
            </span>
            <span className="text-xl font-bold font-mono text-white mt-0.5 block">
              {store.stationAssets.length} Units
            </span>
          </div>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        {[
          { id: "vault", label: "Document Vault (PESO/W&M)", icon: FileCheck2 },
          { id: "checklist", label: "Inspection Checklists", icon: ShieldCheck },
          { id: "assets", label: "Forecourt Assets & AMC", icon: Wrench },
          { id: "lubricants", label: "Servo Lubricants Master", icon: Package },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                isActive
                  ? "border-amber-500 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Document Vault */}
      {activeTab === "vault" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {store.complianceDocs.map((doc) => {
            const isValid = doc.status === "VALID";
            return (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {doc.category.replace("_", " ")}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isValid
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border border-rose-200"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold font-heading text-slate-900 dark:text-slate-100">
                    {doc.title}
                  </h4>
                  <p className="text-xs font-mono text-amber-600 dark:text-amber-400 mt-1 font-semibold">
                    {doc.documentNumber}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Authority: {doc.issuingAuthority}
                  </p>

                  {doc.notes && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 leading-relaxed">
                      {doc.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Issued: {formatDate(doc.issueDate)}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Expires: {formatDate(doc.expiryDate)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Inspection Checklists */}
      {activeTab === "checklist" && (
        <div className="space-y-4">
          {store.inspectionChecklists.map((chk) => (
            <div
              key={chk.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-slate-100">
                      Forecourt Daily Opening Safety Checklist
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Inspector: <strong>{chk.inspectorName}</strong> • Date: {formatDate(chk.date)}
                  </p>
                </div>

                <div>
                  {chk.signedOff ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Signed Off & Approved</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSignOffInspection(chk.id)}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs"
                    >
                      Sign Off Inspection
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {chk.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-750 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200">
                      PASS
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Forecourt Assets & AMC */}
      {activeTab === "assets" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {store.stationAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                        {asset.category} • SN: {asset.serialNumber}
                      </span>
                      <h4 className="text-base font-bold font-heading text-slate-900 dark:text-slate-100 mt-0.5">
                        {asset.name}
                      </h4>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200">
                      {asset.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <div>
                      <span className="text-[10px] text-slate-400 block">AMC Vendor:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{asset.amcVendor}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">AMC Contact:</span>
                      <strong className="font-mono text-slate-800 dark:text-slate-200">{asset.amcContact}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Last Serviced:</span>
                      <span>{formatDate(asset.lastServiceDate)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Next Service Due:</span>
                      <span className="font-semibold text-amber-600">{formatDate(asset.nextServiceDue)}</span>
                    </div>
                  </div>

                  {/* Tickets log */}
                  {asset.tickets.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Maintenance Service History ({asset.tickets.length})
                      </span>
                      {asset.tickets.map((t) => (
                        <div
                          key={t.id}
                          className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs flex items-center justify-between mb-1.5"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">{t.description}</span>
                            <span className="text-[10px] text-slate-400">{t.date}</span>
                          </div>
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                            {formatPaise(t.costPaise)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedAssetId(asset.id);
                      setAddTicketModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Log Service Ticket</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Servo Lubricants Master */}
      {activeTab === "lubricants" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-slate-100">
                SERVO Oils & Packaged Lubricants Inventory
              </h3>
            </div>
            <span className="text-xs text-slate-400">Standard GST 18% Applicable</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Product SKU & Name</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500">Grade</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Pack Size</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">In Stock</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Reorder Min</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Depot Cost</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-right">Retail MRP</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-slate-500 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {store.lubricants.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2.5">
                        <LubricantBottleIllustration size={32} />
                        <div>
                          <span>{prod.name}</span>
                          <span className="block text-[10px] font-mono text-slate-400 font-normal">{prod.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">{prod.grade}</td>
                    <td className="p-3.5 text-right font-mono font-semibold">{prod.packSizeLitres} L</td>
                    <td className="p-3.5 text-right font-mono font-extrabold text-slate-900 dark:text-slate-100">
                      {prod.currentStockUnits} units
                    </td>
                    <td className="p-3.5 text-right font-mono text-slate-500">{prod.reorderLevelUnits} units</td>
                    <td className="p-3.5 text-right font-mono text-slate-500">{formatPaise(prod.purchaseCostPaise)}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                      {formatPaise(prod.salePricePaise)}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => {
                          setSelectedLubeId(prod.id);
                          setSellLubeModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs"
                      >
                        Sell Unit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Document Modal */}
      <Modal
        isOpen={addDocModalOpen}
        onClose={() => setAddDocModalOpen(false)}
        title="Upload Compliance Certificate"
        subtitle="Add statutory permit to retail outlet document vault"
        maxWidth="md"
      >
        <form onSubmit={handleAddDocSubmit} className="space-y-4">
          <Input
            label="Document Title"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            placeholder="e.g. Petroleum Storage Licence Form XIV"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Statutory Category"
              value={docCategory}
              onChange={(e) => setDocCategory(e.target.value as any)}
            >
              <option value="PESO">PESO Explosives</option>
              <option value="WEIGHTS_MEASURES">Weights & Measures</option>
              <option value="FIRE_SAFETY">Fire Safety NOC</option>
              <option value="POLLUTION">Pollution Control (CTO)</option>
              <option value="GST">GST Registration</option>
              <option value="INSURANCE">Public Liability Insurance</option>
            </Select>

            <Input
              label="Document / Certificate No."
              value={docNumber}
              onChange={(e) => setDocNumber(e.target.value)}
              placeholder="e.g. DL-PESO-8920"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Issuing Authority"
              value={issuingAuth}
              onChange={(e) => setIssuingAuth(e.target.value)}
              placeholder="e.g. Joint CCOE, North Circle"
              required
            />
            <Input
              label="Expiry Date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Notes / Inspection Conditions
            </label>
            <textarea
              rows={2}
              value={docNotes}
              onChange={(e) => setDocNotes(e.target.value)}
              placeholder="e.g. Valid for 60KL underground installation"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAddDocModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
            >
              Save Certificate
            </button>
          </div>
        </form>
      </Modal>

      {/* Log Maintenance Ticket Modal */}
      <Modal
        isOpen={addTicketModalOpen}
        onClose={() => setAddTicketModalOpen(false)}
        title="Log Asset Maintenance Ticket"
        subtitle="Record breakdown repair or scheduled AMC servicing"
        maxWidth="md"
      >
        <form onSubmit={handleAddTicketSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Repair / Service Description
            </label>
            <textarea
              required
              rows={3}
              value={ticketDesc}
              onChange={(e) => setTicketDesc(e.target.value)}
              placeholder="e.g. Replaced nozzle breakaway coupling and suction filter seal"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          <Input
            label="Service / Parts Cost (₹)"
            type="number"
            value={ticketCostRupees}
            onChange={(e) => setTicketCostRupees(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setAddTicketModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
            >
              Commit Ticket
            </button>
          </div>
        </form>
      </Modal>

      {/* Sell Lubricant Modal */}
      <Modal
        isOpen={sellLubeModalOpen}
        onClose={() => setSellLubeModalOpen(false)}
        title="Sell SERVO Packaged Lubricant"
        subtitle="Forecourt lube POS sale with automatic cashbook integration"
        maxWidth="md"
      >
        <form onSubmit={handleSellLubeSubmit} className="space-y-4">
          <Select
            label="SERVO Product"
            value={selectedLubeId}
            onChange={(e) => setSelectedLubeId(e.target.value)}
          >
            {store.lubricants.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} — {formatPaise(l.salePricePaise)} (Stock: {l.currentStockUnits})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity (Packs)"
              type="number"
              min="1"
              value={lubeQuantity}
              onChange={(e) => setLubeQuantity(e.target.value)}
              required
            />

            <Select
              label="Payment Tender"
              value={lubePayMethod}
              onChange={(e) => setLubePayMethod(e.target.value)}
            >
              <option value="CASH">Cash Till</option>
              <option value="UPI">BHIM UPI</option>
              <option value="CARD">Card POS</option>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setSellLubeModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
            >
              Record Lube Sale
            </button>
          </div>
        </form>
      </Modal>
    </PageTransition>
  );
}
