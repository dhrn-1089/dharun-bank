"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Phone, Mail, MapPin, CreditCard, Lock, CheckCircle2, AlertCircle, ArrowRight, X } from "lucide-react";
import CyberSignature from "@/components/CyberSignature";
import { safeJson } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    dob: "",
    gender: "Male",
    address: "",
    city: "V.KOTA",
    state: "Andhra Pradesh",
    pincode: "517424",
    panNumber: "",
    aadhaarNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Google Modal
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Password symbol and length validation
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>_\-]/;
    if (formData.password.length < 6 || !symbolRegex.test(formData.password)) {
      setError("Password must be at least 6 characters and contain at least one special symbol (!@#$%^&* etc.).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const { ok, data, error: parseError } = await safeJson(res);
      if (!ok) throw new Error(parseError || data?.error || "Registration failed");

      setSuccess(data);
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGoogleLoading(true);

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleEmail,
          name: googleName,
        }),
      });

      const { ok, data, error: parseError } = await safeJson(res);
      if (!ok) throw new Error(parseError || data?.error || "Google sign-up failed");

      setShowGoogleModal(false);
      router.push(data.redirect || "/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate via Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center mb-4">
          <Link href="/" className="flex items-center space-x-3 bg-white p-2.5 rounded-xl shadow-sm border border-slate-200">
            <div className="relative w-12 h-10">
              <Image src="/logo.jpg" alt="AFS Logo" fill className="object-contain" priority />
            </div>
            <div>
              <span className="text-base font-bold text-[#082B67] block leading-tight">
                ANNAPURNA FUTURE
              </span>
              <span className="text-[10px] font-semibold text-[#E6A500] block uppercase tracking-wider">
                Financial Services Nidhi Limited
              </span>
            </div>
          </Link>
        </div>

        <h2 className="text-center text-3xl font-extrabold text-[#082B67]">
          Member Application & Registration
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Apply for Shareholder-Membership to access exclusive loan and financial services.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200">
          {success ? (
            <div className="text-center space-y-6 py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#082B67]">Application Submitted Successfully!</h3>
                <p className="text-slate-600 mt-2 text-sm">
                  Your registration reference is{" "}
                  <span className="font-mono font-bold text-[#082B67] bg-slate-100 px-2 py-1 rounded">
                    {success.customerId}
                  </span>
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 text-left space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#E6A500]" />
                  Dual Verification & Membership Approval Workflow
                </div>
                <p>
                  In accordance with Nidhi Rules under the Companies Act, your membership and KYC details will be reviewed by an authorized AFS branch officer.
                </p>
                <p>
                  Once your identity and membership are approved, you will receive full access to your Member Portal, loan application facilities, and live EMI tracking.
                </p>
              </div>

              <div className="flex gap-4 justify-center pt-2">
                <Link
                  href="/login"
                  className="px-6 py-2.5 bg-[#082B67] text-white font-semibold rounded-lg hover:bg-[#051A40] transition-colors"
                >
                  Proceed to Login
                </Link>
                <Link
                  href="/"
                  className="px-6 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Google Fast Sign-up Option */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(true)}
                  className="w-full py-2.5 px-4 border border-slate-300 rounded-xl font-semibold text-xs text-slate-700 bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Quick Sign-Up with Google Mail</span>
                </button>
              </div>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-slate-200" />
                <span className="px-3 text-[11px] font-semibold text-slate-400 uppercase">Or fill detailed membership application</span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Personal Info */}
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-[#082B67] mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#E6A500]" /> Personal & Contact Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name (as per PAN/Aadhaar) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dharun Kumar"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#082B67] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mobile Number *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs text-slate-500 font-semibold">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="9876543210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full pl-12 pr-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#082B67] outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Email Address (Google / personal)
                      </label>
                      <input
                        type="email"
                        placeholder="name@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#082B67] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#082B67] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-bold text-[#082B67] mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#E6A500]" /> Residential Address
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Address Details
                      </label>
                      <input
                        type="text"
                        placeholder="Street, locality, landmarks"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#082B67] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">City / Town</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#082B67] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#082B67] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="517424"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#082B67] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Password with Symbol requirement */}
                <div>
                  <h3 className="text-base font-bold text-[#082B67] mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#E6A500]" /> Security & Password
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-4">
                    Must be at least 6 characters and include at least one special symbol (@, #, $, %, etc.).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="e.g. Dharun@1089"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#082B67] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password *</label>
                      <input
                        type="password"
                        required
                        placeholder="Re-enter password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#082B67] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-[#082B67] to-[#123F85] text-white font-bold rounded-xl shadow hover:from-[#051A40] hover:to-[#082B67] transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? "Submitting Application..." : "Submit Membership Application"}
                    <ArrowRight className="w-4 h-4 text-[#E6A500]" />
                  </button>
                </div>

                <div className="text-center text-xs text-slate-500">
                  Already registered?{" "}
                  <Link href="/login" className="font-semibold text-[#082B67] hover:underline">
                    Sign in here
                  </Link>
                </div>

                <div className="text-center pt-2">
                  <CyberSignature variant="light" />
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Google Sign-up Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-bold text-sm text-slate-800">Quick Google Registration</span>
              <button onClick={() => setShowGoogleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Register instantly with your Google account. Your Member ID will be generated automatically.
            </p>

            <form onSubmit={handleGoogleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dharun Kumar"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Google Email (@gmail.com) *</label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={googleLoading}
                  className="px-5 py-2 bg-[#082B67] hover:bg-[#051A40] text-white font-bold rounded-lg transition-colors shadow"
                >
                  {googleLoading ? "Registering..." : "Complete Sign-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
