"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserPlus, Users, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, X, Lock, Trash2, AlertTriangle, Clock, Check, Ban } from "lucide-react";
import CyberSignature from "@/components/CyberSignature";
import { safeJson } from "@/lib/api";

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Deletion State
  const [activeTab, setActiveTab] = useState<"STAFF" | "DELETIONS">("STAFF");
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [selectedStaffForDelete, setSelectedStaffForDelete] = useState<any>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

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

  const fetchPendingDeletions = () => {
    fetch("/api/admin/deletions?status=PENDING")
      .then(safeJson)
      .then(({ ok, data }) => {
        setPendingRequests(ok && Array.isArray(data) ? data : []);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStaff();
    fetchPendingDeletions();
    fetch("/api/auth/me")
      .then(safeJson)
      .then(({ ok, data }) => {
        if (ok) {
          setCurrentUser(data);
        }
      })
      .catch(() => {});
    fetch("/api/admin/branches")
      .then(safeJson)
      .then(({ ok, data }) => {
        const b = Array.isArray(data) ? data : [];
        setBranches(b);
        if (b.length > 0) setFormData((prev) => ({ ...prev, branchId: b[0].id }));
      })
      .catch((err) => console.error(err));
  }, []);

  const handleStaffDeleteSubmit = async () => {
    if (!selectedStaffForDelete) return;
    setDeleteLoading(true);
    try {
      const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
      const action = isSuperAdmin ? "DELETE" : "REQUEST_DELETION";

      const res = await fetch(`/api/admin/staff/${selectedStaffForDelete.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: deleteReason }),
      });

      const { ok, data, error } = await safeJson(res);
      if (!ok) throw new Error(error || data?.error || "Delete action failed");

      alert(data.message || (isSuperAdmin ? "Staff member permanently removed." : "Deletion request submitted."));
      setSelectedStaffForDelete(null);
      setDeleteReason("");
      fetchStaff();
      fetchPendingDeletions();
    } catch (err: any) {
      alert(err.message || "Failed to process staff deletion.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleReviewRequest = async (requestId: string, action: "APPROVE_DELETION" | "REJECT_DELETION") => {
    setReviewLoading(true);
    try {
      const res = await fetch("/api/admin/deletions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, requestId }),
      });

      const { ok, data, error } = await safeJson(res);
      if (!ok) throw new Error(error || data?.error || "Review action failed");

      alert(data.message || "Request updated successfully.");
      fetchPendingDeletions();
      fetchStaff();
    } catch (err: any) {
      alert(err.message || "Failed to review request.");
    } finally {
      setReviewLoading(false);
    }
  };

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

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab("STAFF")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "STAFF"
              ? "border-[#082B67] text-[#082B67]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users className="w-4 h-4" />
          Active Staff Directory ({staffList.length})
        </button>

        <button
          onClick={() => setActiveTab("DELETIONS")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "DELETIONS"
              ? "border-rose-600 text-rose-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Trash2 className="w-4 h-4" />
          Pending Deletion Approvals
          {pendingRequests.length > 0 && (
            <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded-full text-[10px] font-extrabold animate-pulse">
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "STAFF" ? (
        /* Staff Table */
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
                  <th className="py-3 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Loading staff directory...
                    </td>
                  </tr>
                ) : staffList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
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
                      <td className="py-3.5 px-4 text-center">
                        {currentUser?.admin?.id === emp.id ? (
                          <span className="text-[10px] text-slate-400 font-semibold px-2 py-1 bg-slate-100 rounded">
                            You (Self)
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedStaffForDelete(emp);
                              setDeleteReason("");
                            }}
                            title={
                              currentUser?.role === "SUPER_ADMIN"
                                ? "Delete Employee (Super Admin Direct Removal)"
                                : "Request Employee Removal"
                            }
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded border border-rose-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Pending Deletions Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-xs font-extrabold text-[#082B67] uppercase tracking-wider">
                Maker-Checker Deletion Review Queue
              </h2>
              <p className="text-[11px] text-slate-500">
                Staff proposed entity removals. Super Admin holds sole statutory authority to approve or reject.
              </p>
            </div>
            {currentUser?.role === "SUPER_ADMIN" && (
              <span className="px-2.5 py-1 bg-purple-100 text-purple-900 text-[10px] font-bold rounded-lg flex items-center gap-1 border border-purple-200">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" /> Super Admin Authority Active
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#082B67] text-white">
                <tr>
                  <th className="py-3 px-4 font-semibold">Entity</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Reason for Removal</th>
                  <th className="py-3 px-4 font-semibold">Requested By</th>
                  <th className="py-3 px-4 font-semibold">Requested At</th>
                  <th className="py-3 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No pending deletion requests at this time. All records clear!
                    </td>
                  </tr>
                ) : (
                  pendingRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {req.entityIdentifier}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            req.entityType === "CUSTOMER"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {req.entityType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs">{req.reason}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{req.requestedByName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {req.requestedByRole}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(req.createdAt).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {currentUser?.role === "SUPER_ADMIN" ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleReviewRequest(req.id, "APPROVE_DELETION")}
                              disabled={reviewLoading}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[10px] flex items-center gap-1 shadow"
                            >
                              <Check className="w-3 h-3" /> Approve & Purge
                            </button>
                            <button
                              onClick={() => handleReviewRequest(req.id, "REJECT_DELETION")}
                              disabled={reviewLoading}
                              className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded font-semibold text-[10px]"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Awaiting Super Admin
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {/* Staff Deletion Modal */}
      {selectedStaffForDelete && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <Trash2 className="w-5 h-5" />
                <span className="font-bold text-sm">
                  {currentUser?.role === "SUPER_ADMIN" ? "Permanent Employee Removal" : "Request Employee Removal"}
                </span>
              </div>
              <button
                onClick={() => setSelectedStaffForDelete(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {currentUser?.role === "SUPER_ADMIN" ? (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Super Admin Direct Removal Authority
                  </p>
                  <p className="text-[11px] text-rose-700">
                    You have authority to remove{" "}
                    <strong>
                      {selectedStaffForDelete.fullName} ({selectedStaffForDelete.adminCode}, {selectedStaffForDelete.role})
                    </strong>{" "}
                    immediately without secondary approval. Their administrative dashboard credentials will be permanently revoked.
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
                    <strong>Super Admin</strong>.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason for Removal{" "}
                  {currentUser?.role !== "SUPER_ADMIN" && <span className="text-rose-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="State reason for employee offboarding, resignation, or termination..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#082B67]"
                  required={currentUser?.role !== "SUPER_ADMIN"}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedStaffForDelete(null)}
                  disabled={deleteLoading}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleStaffDeleteSubmit()}
                  disabled={
                    deleteLoading ||
                    (currentUser?.role !== "SUPER_ADMIN" && !deleteReason.trim())
                  }
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {deleteLoading
                    ? "Processing..."
                    : currentUser?.role === "SUPER_ADMIN"
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
