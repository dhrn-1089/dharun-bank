"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, UserCheck, Briefcase } from "lucide-react";
import CyberSignature from "@/components/CyberSignature";
import { safeJson } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError("Please enter your official Staff Email, Mobile number, or Employee Code.");
      return;
    }

    if (!password) {
      setError("Please enter your administrative password.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
          expectedType: "ADMIN",
        }),
      });

      const { ok, data, error: parseError } = await safeJson(res);
      if (!ok) throw new Error(parseError || data?.error || "Administrative authentication failed");

      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Administrative authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#051A40] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-4">
          <Link href="/" className="flex items-center space-x-3 bg-white p-2.5 rounded-xl shadow-lg border border-slate-200">
            <div className="relative w-12 h-10">
              <Image src="/logo.jpg" alt="AFS Logo" fill className="object-contain" priority />
            </div>
            <div>
              <span className="text-base font-bold text-[#082B67] block leading-tight">
                ANNAPURNA FUTURE
              </span>
              <span className="text-[10px] font-semibold text-[#E6A500] block uppercase tracking-wider">
                Staff & Administration Portal
              </span>
            </div>
          </Link>
        </div>

        <h2 className="text-center text-3xl font-extrabold text-white">
          Multi-Admin RBAC Console
        </h2>
        <p className="mt-2 text-center text-xs text-slate-300">
          Authorized personnel access only. Actions are cryptographically logged and monitored.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200 space-y-5">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Staff Email, Mobile or Employee Code
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. AFS-EMP-1001 or staff@afs.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#082B67] outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Enter your assigned employee code or staff email address.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Administrative Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#082B67] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#082B67] to-[#123F85] text-white font-bold rounded-xl shadow hover:from-[#051A40] hover:to-[#082B67] transition-all flex items-center justify-center gap-2"
            >
              {loading ? "Verifying Credentials..." : "Authenticate as Administrator"}
              <ShieldCheck className="w-4 h-4 text-[#E6A500]" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <Link href="/login" className="text-xs text-slate-600 hover:text-[#082B67] font-semibold">
              ← Switch to Customer / Member Login
            </Link>
          </div>

          <div className="pt-2 text-center">
            <CyberSignature variant="light" />
          </div>
        </div>
      </div>
    </div>
  );
}
