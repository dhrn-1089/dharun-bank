"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/financial";
import { Users, Search, Filter, Download, UserPlus, CheckCircle2, AlertCircle, ArrowRight, Trash2, AlertTriangle, X, ShieldCheck } from "lucide-react";
import { safeJson } from "@/lib/api";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [currentAdminRole, setCurrentAdminRole] = useState("STAFF");
  const [selectedCustomerForDelete, setSelectedCustomerForDelete] = useState<any>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCustomers = () => {
    setLoading(true);
    fetch(`/api/admin/customers?query=${encodeURIComponent(query)}&status=${status}`)
      .then(safeJson)
      .then(({ ok, data }) => {
        setCustomers(ok && Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomers();
    fetch("/api/auth/me")
      .then(safeJson)
      .then(({ ok, data }) => {
        if (ok && data?.role) setCurrentAdminRole(data.role);
      })
      .catch(() => {});
  }, [status]);

  const handleDeleteCustomer = async () => {
    if (!selectedCustomerForDelete) return;
    setDeleteLoading(true);
    try {
      const isSuperAdmin = currentAdminRole === "SUPER_ADMIN";
      const action = isSuperAdmin ? "DELETE" : "REQUEST_DELETION";

      const res = await fetch(`/api/admin/customers/${selectedCustomerForDelete.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: deleteReason }),
      });

      const { ok, data, error } = await safeJson(res);
      if (!ok) throw new Error(error || data?.error || "Delete action failed");

      alert(data.message || (isSuperAdmin ? "Customer permanently deleted." : "Deletion request submitted."));
      setSelectedCustomerForDelete(null);
      setDeleteReason("");
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || "Failed to delete customer.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const exportCSV = () => {
    const headers = ["Customer ID", "Name", "Phone", "Email", "Total Loans", "Outstanding", "Status"];
    const rows = customers.map((c) => [
      c.customerId,
      c.fullName,
      c.phone,
      c.email || "N/A",
      c.totalLoan,
      c.outstanding,
      c.accountStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AFS_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#082B67]">Customer Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Centralized member directory, KYC verification, and status controls.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <Link
            href="/admin/customers/new"
            className="px-4 py-2 bg-[#082B67] hover:bg-[#051A40] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow"
          >
            <UserPlus className="w-4 h-4 text-[#E6A500]" /> Add Member (Manual)
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search by Name, ID, Phone or Email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-20 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#082B67]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <button
            type="submit"
            className="absolute right-1.5 top-1 px-3 py-1 bg-[#082B67] text-white text-[10px] font-semibold rounded"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs font-semibold text-[#082B67] border border-slate-300 rounded-lg px-3 py-2 outline-none bg-white cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Members</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="PENDING_DELETION">Pending Deletion</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Customer Information Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#082B67] text-white">
              <tr>
                <th className="py-3 px-4 font-semibold">Customer ID</th>
                <th className="py-3 px-4 font-semibold">Full Name</th>
                <th className="py-3 px-4 font-semibold">Phone Number</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold text-right">Total Sanctioned</th>
                <th className="py-3 px-4 font-semibold text-right">Outstanding</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading customer database...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No customers found matching criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#082B67]">
                      {c.customerId}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{c.fullName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.phone}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.email || "N/A"}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-[#082B67]">
                      {formatINR(c.totalLoan)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-amber-600">
                      {formatINR(c.outstanding)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                          c.accountStatus === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : c.accountStatus === "PENDING_DELETION"
                            ? "bg-rose-100 text-rose-800 border border-rose-300 font-extrabold"
                            : c.accountStatus === "PENDING_APPROVAL"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {c.accountStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/admin/customers/${c.customerId}`}
                          className="px-2.5 py-1.5 bg-[#082B67] hover:bg-[#051A40] text-white rounded font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                        >
                          View <ArrowRight className="w-3 h-3 text-[#E6A500]" />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedCustomerForDelete(c);
                            setDeleteReason("");
                          }}
                          title={currentAdminRole === "SUPER_ADMIN" ? "Delete Customer (Super Admin)" : "Request Customer Removal"}
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded border border-rose-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete / Removal Modal */}
      {selectedCustomerForDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <Trash2 className="w-5 h-5" />
                <span className="font-bold text-sm">
                  {currentAdminRole === "SUPER_ADMIN" ? "Permanent Customer Purge" : "Request Customer Removal"}
                </span>
              </div>
              <button
                onClick={() => setSelectedCustomerForDelete(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {currentAdminRole === "SUPER_ADMIN" ? (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Super Admin Direct Removal Authority
                  </p>
                  <p className="text-[11px] text-rose-700">
                    You have authority to remove{" "}
                    <strong>
                      {selectedCustomerForDelete.fullName} ({selectedCustomerForDelete.customerId})
                    </strong>{" "}
                    immediately without approval. All associated records will be permanently deleted.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    Maker-Checker Removal Request
                  </p>
                  <p className="text-[11px] text-amber-700">
                    As staff, this removal request requires review and approval by a{" "}
                    <strong>Super Admin</strong>. The customer account will be placed into{" "}
                    <code>PENDING DELETION</code> status.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason for Deletion{" "}
                  {currentAdminRole !== "SUPER_ADMIN" && <span className="text-rose-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="State statutory reason, member closure, or request details..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#082B67]"
                  required={currentAdminRole !== "SUPER_ADMIN"}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCustomerForDelete(null)}
                  disabled={deleteLoading}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCustomer()}
                  disabled={
                    deleteLoading ||
                    (currentAdminRole !== "SUPER_ADMIN" && !deleteReason.trim())
                  }
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleteLoading
                    ? "Processing..."
                    : currentAdminRole === "SUPER_ADMIN"
                    ? "Yes, Permanently Delete"
                    : "Submit Deletion Request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
