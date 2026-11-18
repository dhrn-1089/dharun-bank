"use client";

import { useEffect, useState } from "react";
import { Building, ShieldCheck, Lock, PlusCircle, Edit3, CheckCircle2, AlertCircle, X, MapPin, Phone } from "lucide-react";
import CyberSignature from "@/components/CyberSignature";

export default function AdminSettingsPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Branch Form
  const [showAddBranch, setShowAddBranch] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: "",
    code: "",
    city: "",
    state: "Andhra Pradesh",
    address: "",
    phone: "",
  });

  // Edit Branch State
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const fetchBranches = () => {
    setLoading(true);
    fetch("/api/admin/branches")
      .then((res) => res.json())
      .then((data) => {
        setBranches(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleAddBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMsg("");

    try {
      const res = await fetch("/api/admin/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBranch),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add branch");

      setMsg(data.message);
      setShowAddBranch(false);
      setNewBranch({
        name: "",
        code: "",
        city: "",
        state: "Andhra Pradesh",
        address: "",
        phone: "",
      });
      fetchBranches();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEditBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;

    setSaving(true);
    setError("");
    setMsg("");

    try {
      const res = await fetch("/api/admin/branches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingBranch.id,
          address: editAddress,
          phone: editPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update branch");

      setMsg(data.message);
      setEditingBranch(null);
      fetchBranches();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEditBranch = (b: any) => {
    setEditingBranch(b);
    setEditAddress(b.address);
    setEditPhone(b.phone);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#082B67]">Settings & Branch Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure statutory Nidhi regulatory parameters, manage branch offices, and edit branch addresses.
          </p>
        </div>

        <button
          onClick={() => setShowAddBranch(true)}
          className="px-4 py-2 bg-[#082B67] hover:bg-[#051A40] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow"
        >
          <PlusCircle className="w-4 h-4 text-[#E6A500]" /> Add New Branch Office
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Compliance Parameters */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-[#082B67] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#E6A500]" /> Statutory Nidhi Regulatory Parameters
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block mb-1">Max Gold Loan Interest</span>
            <span className="text-lg font-bold text-[#082B67]">12.5% p.a.</span>
            <span className="text-[10px] text-slate-400 block mt-1">Under Nidhi Rules, 2014</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block mb-1">Mortgage Loan Interest</span>
            <span className="text-lg font-bold text-[#082B67]">14.0% p.a.</span>
            <span className="text-[10px] text-slate-400 block mt-1">Reducing balance cap</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-500 block mb-1">Net Owned Funds Ratio</span>
            <span className="text-lg font-bold text-emerald-600">1 : 20 Minimum</span>
            <span className="text-[10px] text-emerald-700 block mt-1">Strict statutory compliance</span>
          </div>
        </div>
      </div>

      {/* Branches Directory with Edit capability */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-[#082B67] flex items-center gap-2">
            <Building className="w-5 h-5 text-[#E6A500]" /> Active Branch Network ({branches.length} Offices)
          </h2>
          <span className="text-xs text-slate-500">Admin can edit addresses anytime</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {branches.map((b) => (
            <div
              key={b.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                b.code.includes("HQ")
                  ? "bg-amber-50/40 border-amber-300 shadow-sm"
                  : "bg-[#F5F7FB] border-slate-200"
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-sm text-[#082B67] leading-tight">{b.name}</span>
                  <span className="font-mono bg-blue-100 text-[#082B67] font-bold px-2 py-0.5 rounded text-[10px] shrink-0">
                    {b.code}
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-600 text-[11px] pt-1">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E6A500] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{b.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{b.phone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center">
                <span className="text-[10px] text-slate-400">{b.city}, {b.state}</span>
                <button
                  onClick={() => startEditBranch(b)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded font-semibold text-[10px] text-[#082B67] flex items-center gap-1 transition-colors"
                >
                  <Edit3 className="w-3 h-3 text-[#E6A500]" /> Edit Address
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Admin RBAC Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h2 className="text-base font-bold text-[#082B67] flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#E6A500]" /> Multi-Admin RBAC Role Matrix
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-[#082B67]">Super Admin</div>
            <p className="text-slate-500 text-[11px] mt-1">Full control, create staff, maker-checker oversight, branch management.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-[#082B67]">Loan Officer</div>
            <p className="text-slate-500 text-[11px] mt-1">Customer onboarding, prepare loan proposals (Maker).</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-[#082B67]">Accountant</div>
            <p className="text-slate-500 text-[11px] mt-1">Payment entry, ledger reconciliation, statutory reports.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-[#082B67]">Collection Officer</div>
            <p className="text-slate-500 text-[11px] mt-1">Counter and field EMI collections, receipt issuance.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="font-bold text-[#082B67]">Auditor</div>
            <p className="text-slate-500 text-[11px] mt-1">Strict read-only oversight of all transactions and audit trail.</p>
          </div>
        </div>
      </div>

      <div className="pt-4 text-center">
        <CyberSignature variant="light" />
      </div>

      {/* Add New Branch Modal */}
      {showAddBranch && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-bold text-sm text-[#082B67]">Add New Branch Office</span>
              <button onClick={() => setShowAddBranch(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBranchSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branch Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kuppam Branch Office"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Branch Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if blank"
                    value={newBranch.code}
                    onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none uppercase focus:ring-2 focus:ring-[#082B67]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City / Town *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kuppam"
                    value={newBranch.city}
                    onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 8579 000 000"
                    value={newBranch.phone}
                    onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Full Postal Address *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Door number, street, landmarks, district and pin code"
                    value={newBranch.address}
                    onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddBranch(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#082B67] hover:bg-[#051A40] text-white font-bold rounded-lg transition-colors shadow"
                >
                  {saving ? "Saving..." : "Add Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Branch Address Modal */}
      {editingBranch && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="font-bold text-sm text-[#082B67]">Edit Branch Details</span>
                <span className="text-[10px] text-slate-400 block">{editingBranch.name} ({editingBranch.code})</span>
              </div>
              <button onClick={() => setEditingBranch(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBranch} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Branch Postal Address *</label>
                <textarea
                  rows={3}
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Branch Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingBranch(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#082B67] hover:bg-[#051A40] text-white font-bold rounded-lg transition-colors shadow"
                >
                  {saving ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
