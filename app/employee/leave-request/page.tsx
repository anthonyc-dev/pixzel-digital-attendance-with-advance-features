"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ENV } from "@/lib/api";
import {
  CalendarDays,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ChevronDown,
} from "lucide-react";

interface LeaveRequest {
  id: number;
  employee_name: string;
  employer_id?: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  created_at: string;
  image?: string;
}
interface Employer {
  id: string;
  employer_id: string;
  employer_name: string;
  employer_position: string;
}

const LEAVE_TYPES = [
  "Paid Leave",
  "Unpaid Leave",
  "Statutory / Mandatory Leave",
  "Personal Leave",
  "Medical Leave",
  "Special Leave",
  "Work-Related Leave",
  "Partial Leave",
];

export default function EmployeeLeaveRequestPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "delete";
  } | null>(null);
  const [formData, setFormData] = useState({
    employer_id: "",
    leave_type: "",
    reason: "",
    start_date: "",
    end_date: "",
  });

  const fetchEmployers = async () => {
    try {
      const res = await fetch(`${ENV.API_URL}/registration`);
      if (res.ok) {
        const result = await res.json();
        const employersData = result.data || result || [];
        setEmployers(employersData);
        console.log("Employers Data:", employersData);
      }
    } catch (e) {
      console.error("Failed to fetch employers:", e);
    }
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${ENV.API_URL}/leave`);
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
        console.log("Leaves Data:", data);
      }
    } catch (e) {
      console.error("Failed to fetch leaves:", e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error" | "delete") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${ENV.API_URL}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast("Leave request submitted successfully!", "success");
        setIsModalOpen(false);
        setFormData({
          employer_id: "",
          leave_type: "",
          reason: "",
          start_date: "",
          end_date: "",
        });
        await fetchLeaves();
      } else {
        const error = await res.json();
        showToast(error.error || "Failed to submit leave request", "error");
      }
    } catch (e) {
      console.error("Failed to submit leave:", e);
      showToast("Failed to submit leave request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Leave Request
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Submit and track your leave requests here.
        </p>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-xl font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-secondary/20 hover:opacity-90 transition-all"
      >
        <span>Request Leave</span>
      </button>

      {/* Request Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-[#0A0A0A] rounded-2xl p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Request Leave
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Employee
                </label>
                <div className="relative">
                  <select
                    value={formData.employer_id}
                    onChange={(e) =>
                      setFormData({ ...formData, employer_id: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-muted border border-gray-200 dark:border-white/10 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select employee</option>
                    {employers.map((emp) => (
                      <option key={emp.id} value={emp.employer_id}>
                        {emp.employer_name} - {emp.employer_id}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Leave Type
                </label>
                <div className="relative">
                  <select
                    value={formData.leave_type}
                    onChange={(e) =>
                      setFormData({ ...formData, leave_type: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-muted border border-gray-200 dark:border-white/10 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select leave type</option>
                    {LEAVE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Reason
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  placeholder="Enter reason for leave"
                  rows={3}
                  className="w-full px-4 py-3 bg-muted border border-gray-200 dark:border-white/10 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-muted border border-gray-200 dark:border-white/10 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-muted border border-gray-200 dark:border-white/10 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all shadow-lg w-full bg-secondary text-white shadow-secondary/20 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
