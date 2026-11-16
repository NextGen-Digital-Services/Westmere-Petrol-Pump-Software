"use client";

import React, { useState } from "react";
import { usePetroStore } from "@/store/usePetroStore";
import { Employee, UserRole } from "@/types";
import { SalaryPaymentModal } from "@/components/employees/SalaryPaymentModal";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { formatPaise, formatLitres, formatDate } from "@/lib/format";
import { Plus, UserCheck, Calendar, DollarSign, Award } from "lucide-react";

export default function EmployeesPage() {
  const store = usePetroStore();
  const [selectedEmpForSalary, setSelectedEmpForSalary] = useState<Employee | null>(null);
  const [addEmpOpen, setAddEmpOpen] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [selectedEmpForAttendance, setSelectedEmpForAttendance] = useState<Employee | null>(null);
  const [attendanceStatus, setAttendanceStatus] = useState<"PRESENT" | "ABSENT" | "HALF_DAY" | "LEAVE">("PRESENT");

  // New Employee Form
  const [name, setName] = useState("");
  const [code, setCode] = useState("PF-EMP-0" + (store.employees.length + 1));
  const [role, setRole] = useState<UserRole>("Pump Operator");
  const [phone, setPhone] = useState("+91 ");
  const [salaryRupees, setSalaryRupees] = useState("24000");

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    store.addEmployee({
      employeeCode: code,
      name,
      role,
      phone,
      monthlySalaryPaise: Math.round((parseFloat(salaryRupees) || 0) * 100),
      currentAdvancePaise: 0,
      status: "ACTIVE",
      joinedDate: new Date().toISOString().split("T")[0],
    });
    setAddEmpOpen(false);
    setName("");
  };

  const handleRecordAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpForAttendance) return;

    store.recordAttendance({
      employeeId: selectedEmpForAttendance.id,
      date: new Date().toISOString().split("T")[0],
      status: attendanceStatus,
    });

    setAttendanceModalOpen(false);
    setSelectedEmpForAttendance(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-[10px] tracking-caps uppercase text-text-muted font-semibold">
            Human Resources & Staff Rosters
          </span>
          <h1 className="text-3xl font-serif font-light tracking-editorial text-text mt-1">
            Employees & Station Staff
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Staff profiles, daily attendance verification, payroll disbursements, and advance recovery.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setAddEmpOpen(true)}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Employee
        </Button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {store.employees.map((emp) => {
          // Litres sold by this employee
          const employeeSales = store.sales.filter(
            (s) => s.operatorId === emp.id && s.status === "COMPLETED"
          );
          const litresSold = employeeSales.reduce((acc, s) => acc + s.quantityLitres, 0);

          return (
            <div
              key={emp.id}
              className="bg-card border border-border rounded-sm p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-border-subtle">
                  <div>
                    <span className="text-[10px] tracking-caps uppercase text-text-faint font-semibold">
                      {emp.employeeCode}
                    </span>
                    <h3 className="text-base font-serif font-medium text-text mt-0.5">
                      {emp.name}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {emp.role} • {emp.phone}
                    </p>
                  </div>
                  <span className="inline-block px-2 py-0.5 text-[10px] tracking-caps uppercase font-semibold border border-olive/30 bg-olive/10 text-olive rounded-sm">
                    {emp.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-text-muted">
                  <div className="flex justify-between">
                    <span>Monthly Salary:</span>
                    <span className="tabular-nums font-semibold text-text">
                      {formatPaise(emp.monthlySalaryPaise)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Salary Advance Balance:</span>
                    <span
                      className={`tabular-nums font-semibold ${
                        emp.currentAdvancePaise > 0 ? "text-brick" : "text-text-muted"
                      }`}
                    >
                      {formatPaise(emp.currentAdvancePaise)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance Output:</span>
                    <span className="tabular-nums font-medium text-accent">
                      {formatLitres(litresSold)} sold
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Joining Date:</span>
                    <span className="text-text">{formatDate(emp.joinedDate)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedEmpForAttendance(emp);
                    setAttendanceModalOpen(true);
                  }}
                  className="flex-1 text-xs"
                >
                  Mark Attendance
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedEmpForSalary(emp)}
                  className="flex-1 text-xs"
                >
                  Pay Salary
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attendance & Salary Records Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden mt-6">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <h3 className="text-base font-serif font-medium tracking-editorial text-text">
            Payroll & Salary Disbursement History
          </h3>
          <span className="text-xs text-text-muted">{store.salaries.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-card-subtle border-b border-border">
              <tr>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Employee</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Period</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Gross Salary</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Advance Recovery</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted text-right">Net Paid</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Mode</th>
                <th className="p-3 text-[10px] font-semibold tracking-caps uppercase text-text-muted">Disbursed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {store.salaries.map((s) => {
                const emp = store.employees.find((e) => e.id === s.employeeId);
                return (
                  <tr key={s.id} className="hover:bg-card-subtle/40">
                    <td className="p-3 font-medium text-text">{emp?.name || s.employeeId}</td>
                    <td className="p-3 text-text-muted font-mono">{s.monthYear}</td>
                    <td className="p-3 text-right tabular-nums text-text-muted">{formatPaise(s.grossSalaryPaise)}</td>
                    <td className="p-3 text-right tabular-nums text-brick font-medium">
                      {s.advanceDeductionPaise > 0 ? `-${formatPaise(s.advanceDeductionPaise)}` : "—"}
                    </td>
                    <td className="p-3 text-right tabular-nums font-semibold text-accent">{formatPaise(s.netPaidPaise)}</td>
                    <td className="p-3 text-text-muted">{s.paymentMethod}</td>
                    <td className="p-3 text-text-muted">{formatDate(s.paidAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Modal */}
      <SalaryPaymentModal
        employee={selectedEmpForSalary}
        isOpen={!!selectedEmpForSalary}
        onClose={() => setSelectedEmpForSalary(null)}
      />

      {/* Add Employee Modal */}
      <Modal
        isOpen={addEmpOpen}
        onClose={() => setAddEmpOpen(false)}
        title="Register Station Staff"
        subtitle="Create employee profile and payroll allocation"
        maxWidth="md"
      >
        <form onSubmit={handleCreateEmployee} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ramesh Kumar"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Staff Role"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
            >
              <option value="Pump Operator">Pump Operator</option>
              <option value="Cashier">Cashier</option>
              <option value="Shift Manager">Shift Manager</option>
              <option value="Accountant">Accountant</option>
              <option value="General Manager">General Manager</option>
            </Select>
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <Input
            label="Monthly Salary (₹)"
            type="number"
            value={salaryRupees}
            onChange={(e) => setSalaryRupees(e.target.value)}
            required
          />
          <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
            <Button variant="outline" type="button" onClick={() => setAddEmpOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Staff
            </Button>
          </div>
        </form>
      </Modal>

      {/* Attendance Modal */}
      <Modal
        isOpen={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        title={`Daily Attendance: ${selectedEmpForAttendance?.name}`}
        subtitle="Mark forecourt shift attendance status"
        maxWidth="sm"
      >
        <form onSubmit={handleRecordAttendance} className="space-y-4">
          <Select
            label="Attendance Status"
            value={attendanceStatus}
            onChange={(e) => setAttendanceStatus(e.target.value as any)}
          >
            <option value="PRESENT">Present (Full Day)</option>
            <option value="HALF_DAY">Half Day</option>
            <option value="LEAVE">Authorized Leave</option>
            <option value="ABSENT">Absent (Unnotified)</option>
          </Select>

          <div className="flex justify-end space-x-2 pt-4 border-t border-border-subtle">
            <Button variant="outline" type="button" onClick={() => setAttendanceModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Attendance
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
