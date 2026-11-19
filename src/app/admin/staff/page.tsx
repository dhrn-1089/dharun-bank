"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, Users, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, X, Lock } from "lucide-react";
import CyberSignature from "@/components/CyberSignature";
import { safeJson } from "@/lib/api";

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    role: "LOAN_OFFICER",
    email: "",
    phone: "",
    dob: "",
    age: "",
    branchId: "",
    password: "Staff@123",
  });

  const [createLoading, setCreateLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchStaff = () => {
    setLoading(true);
    fetch("/api/admin/staff")
      .then(safeJson)
      .then(({ ok, data }) => {
        setStaffList(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStaff();
    fetch("/api/admin/branches")
      .then(safeJson)
      .then(({ ok, data }) => {
        const b = Array.isArray(data) ? data : [];
        setBranches(b);
        if (b.length > 0) setFormData((prev) => ({ ...prev, branchId: b[0].id }));
      })
      .catch((err) => console.error(err));
  }, []);

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dobVal = e.target.value;
    let computedAge = "";
    if (dobVal) {
      const birthYear = new Date(dobVal).getFullYear();
      computedAge = String(new Date().getFullYear() - birthYear);
    }
    setFormData({ ...formData, dob: dobVal, age: computedAge });
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setCreateLoading(true);

    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const { ok, data, error: parseError } = await safeJson(res);
      if (!ok) throw new Error(parseError || data?.error || "Failed to create staff account");

      setSuccessMsg(data.message || "Staff account created successfully.");
      setShowAddModal(false);
      setFormData({
        fullName: "",
        role: "LOAN_OFFICER",
        email: "",
        phone: "",
        dob: "",
        age: "",
        branchId: branches[0]?.id || "",
        password: "Staff@123",
      });
      fetchStaff();
    } catch (err: any) {
      setError(err.message || "Failed to create staff account.");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-[#082B67]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-[#082B67]">Staff & Employee Directory</h1>
            <p className="text-xs text-slate-500">
              Multi-staff administration, role-based access control, and unique employee identity codes.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#082B67] hover:bg-[#051A40] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow"
        >
          <UserPlus className="w-4 h-4 text-[#E6A500]" /> Add New Employee / Staff
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#082B67] text-white">
              <tr>
                <th className="py-3 px-4 font-semibold">Employee Code</th>
                <th className="py-3 px-4 font-semibold">Staff Name</th>
                <th className="py-3 px-4 font-semibold">Assigned Role</th>
                <th className="py-3 px-4 font-semibold">Age / DOB</th>
                <th className="py-3 px-4 font-semibold">Contact Info</th>
                <th className="py-3 px-4 font-semibold">Branch Office</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading staff directory...
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No staff records found.
                  </td>
                </tr>
              ) : (
                staffList.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#082B67]">
                      {emp.adminCode}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{emp.fullName}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-blue-100 text-[#082B67] text-[10px] font-bold px-2 py-0.5 rounded">
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {emp.age ? `${emp.age} yrs` : "N/A"}{" "}
                      <span className="text-[10px] text-slate-400">({emp.dob || "DOB not set"})</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800">{emp.phone}</div>
                      <div className="text-[10px] text-slate-400">{emp.email || "N/A"}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {emp.branch?.name || "V.KOTA Head Office"}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-4 text-center">
        <CyberSignature variant="light" />
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#E6A500]" />
                <span className="font-bold text-sm text-[#082B67]">Register New Company Employee</span>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. S. Dharun"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Company Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white font-semibold text-[#082B67] focus:ring-2 focus:ring-[#082B67]"
                  >
                    <option value="SUPER_ADMIN">Super Admin (Full System Authority)</option>
                    <option value="LOAN_OFFICER">Loan Officer (Onboarding & Loan Proposal)</option>
                    <option value="ACCOUNTANT">Accountant (Payment & Reconciliation)</option>
                    <option value="COLLECTION_OFFICER">Collection Officer (Offline Field Collections)</option>
                    <option value="AUDITOR">Auditor (Strict Read-only Oversight)</option>
                    <option value="ADMINISTRATOR">Branch Manager / Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="employee@afs.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={handleDobChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age (Years)</label>
                  <input
                    type="number"
                    placeholder="Calculated from DOB"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Branch *</label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-[#082B67]"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-semibold text-slate-700">Initial Staff Password *</label>
                    <span className="text-[10px] text-slate-400">Min 6 chars with special symbol</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono focus:ring-2 focus:ring-[#082B67]"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                A unique employee code (e.g. <strong>AFS-EMP-1006</strong>) will be generated automatically upon submission.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2 bg-[#082B67] hover:bg-[#051A40] text-white font-bold rounded-lg transition-colors shadow"
                >
                  {createLoading ? "Registering Employee..." : "Create Staff Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
