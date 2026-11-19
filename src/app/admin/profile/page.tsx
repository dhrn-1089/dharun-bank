"use client";

import { useEffect, useState } from "react";
import { User, ShieldCheck, Mail, Phone, Calendar, Building, Lock } from "lucide-react";
import CyberSignature from "@/components/CyberSignature";
import { safeJson } from "@/lib/api";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(safeJson)
      .then(({ ok, data }) => {
        setProfile(ok && data?.admin ? data.admin : null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#082B67] border-t-[#E6A500] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-[#082B67]">Administrative Staff Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Official employee credentials, role permissions, and branch affiliation.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#082B67] via-[#0C367C] to-[#051A40] p-6 text-white flex items-center gap-4">
          <div className="w-16 h-16 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center text-white text-2xl font-black">
            {profile?.fullName?.charAt(0) || "A"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{profile?.fullName}</h2>
              <span className="bg-[#E6A500] text-[#082B67] text-xs font-black px-2.5 py-0.5 rounded">
                {profile?.role}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Employee Code: <span className="font-mono font-bold text-[#E6A500]">{profile?.adminCode}</span> | {profile?.branch?.name || "V.KOTA Head Office (AP)"}
            </p>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="p-6 space-y-6 text-xs">
          {/* Section 1: Employee Particulars */}
          <div>
            <h3 className="text-sm font-bold text-[#082B67] mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#E6A500]" /> Staff Identity Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#F5F7FB] p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-500 block">Full Legal Name</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{profile?.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Unique Employee Code</span>
                <span className="font-mono font-bold text-[#082B67] text-sm mt-0.5 block">
                  {profile?.adminCode}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Age</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {profile?.age ? `${profile.age} Years` : "32 Years"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Date of Birth</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {profile?.dob || "1994-06-15"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div>
            <h3 className="text-sm font-bold text-[#082B67] mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E6A500]" /> Contact & Branch Affiliation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F5F7FB] p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-500 block">Official Email</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{profile?.email || "staff@afs.com"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Contact Phone</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{profile?.phone || "+91 99999 00001"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Assigned Branch</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                  {profile?.branch?.name || "V.KOTA Head Office (AP)"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: System Role Authorization */}
          <div>
            <h3 className="text-sm font-bold text-[#082B67] mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#E6A500]" /> Operational Authority
            </h3>
            <div className="p-4 bg-[#F5F7FB] rounded-xl border border-slate-100 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#082B67]">System Role: {profile?.role}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                  Active Clearance
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Empowered to perform statutory Nidhi financial operations in accordance with role permissions and Maker-Checker protocols.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 text-center">
        <CyberSignature variant="light" />
      </div>
    </div>
  );
}
