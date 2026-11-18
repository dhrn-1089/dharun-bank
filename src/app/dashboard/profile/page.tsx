"use client";

import { useEffect, useState } from "react";
import { User, Phone, Mail, MapPin, ShieldCheck, CheckCircle2, Lock } from "lucide-react";

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.customer);
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-[#082B67]">Member Profile & KYC</h1>
        <p className="text-xs text-slate-500 mt-1">
          Registered identity details and statutory Nidhi shareholder membership status.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Top Profile Banner */}
        <div className="bg-gradient-to-r from-[#082B67] to-[#123F85] p-6 text-white flex items-center gap-4">
          <div className="w-16 h-16 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-center text-white text-2xl font-extrabold">
            {profile?.fullName?.charAt(0) || "M"}
          </div>
          <div>
            <h2 className="text-xl font-bold">{profile?.fullName}</h2>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="font-mono bg-[#E6A500] text-[#082B67] px-2 py-0.5 rounded font-bold">
                {profile?.customerId}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-emerald-300 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Admitted Shareholder Member
              </span>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6 text-xs">
          {/* Section 1: Member Statuses */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div>
              <span className="text-slate-500 block mb-1">Application Status</span>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {profile?.applicationStatus}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">KYC Verification</span>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {profile?.verificationStatus}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Membership</span>
              <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                {profile?.membershipStatus}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Loan Eligibility</span>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                {profile?.loanEligibilityStatus}
              </span>
            </div>
          </div>

          {/* Section 2: Personal Details */}
          <div>
            <h3 className="text-sm font-bold text-[#082B67] mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#E6A500]" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#F5F7FB] rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-500 block">Full Legal Name</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{profile?.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Date of Birth</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{profile?.dob || "Not specified"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Gender</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{profile?.gender || "Not specified"}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Contact & KYC */}
          <div>
            <h3 className="text-sm font-bold text-[#082B67] mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#E6A500]" /> Contact & Statutory KYC
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#F5F7FB] rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-500 block">Registered Phone</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{profile?.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Registered Email</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{profile?.email || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">PAN Number</span>
                <span className="font-mono font-semibold text-slate-800 text-sm mt-0.5 block">{profile?.panNumber || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Aadhaar (Masked)</span>
                <span className="font-mono font-semibold text-slate-800 text-sm mt-0.5 block">{profile?.aadhaarMasked || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Section 4: Address */}
          <div>
            <h3 className="text-sm font-bold text-[#082B67] mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#E6A500]" /> Registered Address
            </h3>
            <div className="p-4 bg-[#F5F7FB] rounded-xl border border-slate-100 space-y-1">
              <div className="font-semibold text-slate-800">{profile?.address}</div>
              <div className="text-slate-600">
                {profile?.city}, {profile?.state} - {profile?.pincode}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
