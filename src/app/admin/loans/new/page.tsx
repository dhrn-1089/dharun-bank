"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatINR, calculateReducingBalanceEmi, calculateFlatInterestEmi } from "@/lib/financial";
import { ArrowLeft, CreditCard, Calculator, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

export default function CreateLoanPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [loanType, setLoanType] = useState("PERSONAL");
  const [principalAmount, setPrincipalAmount] = useState(100000);
  const [annualInterestRate, setAnnualInterestRate] = useState(12);
  const [interestType, setInterestType] = useState<"REDUCING_BALANCE" | "FLAT">("REDUCING_BALANCE");
  const [tenureMonths, setTenureMonths] = useState(18);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [emiDueDay, setEmiDueDay] = useState(5);
  const [collateralDetails, setCollateralDetails] = useState("");
  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/customers?status=ACTIVE")
      .then((res) => res.json())
      .then((data) => {
        const activeCusts = Array.isArray(data) ? data : [];
        setCustomers(activeCusts);
        if (activeCusts.length > 0) {
          setSelectedCustomerId(activeCusts[0].id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Live Calculation
  const calc =
    interestType === "FLAT"
      ? calculateFlatInterestEmi(principalAmount, annualInterestRate, tenureMonths)
      : calculateReducingBalanceEmi(principalAmount, annualInterestRate, tenureMonths);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedCustomerId) {
      setError("Please select an approved member.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          loanType,
          principalAmount,
          annualInterestRate,
          interestType,
          tenureMonths,
          startDate,
          emiDueDay,
          collateralDetails,
          remarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create loan");

      setSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/loans"
          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-[#082B67]"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[#082B67]">Create New Member Loan</h1>
          <p className="text-xs text-slate-500">
            Submit loan proposal for Maker-Checker credit committee review and disbursement.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Loan Creation Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-[#082B67]">Loan Proposal Generated!</h3>
              <p className="text-xs text-slate-600">
                Facility ID:{" "}
                <span className="font-mono font-bold text-[#082B67] bg-slate-100 px-2 py-1 rounded">
                  {success.loan.loanId}
                </span>
              </p>
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-left text-xs space-y-1">
                <div className="font-bold flex items-center gap-1 text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#E6A500]" /> Maker-Checker Status: Pending Review
                </div>
                <p>
                  This proposal is currently in the Checker queue. An authorized administrator or Super Admin must review and grant dual approval before funds can be disbursed.
                </p>
              </div>
              <div className="pt-4 flex justify-center gap-3">
                <Link
                  href={`/admin/loans/${success.loan.loanId}`}
                  className="px-5 py-2.5 bg-[#082B67] text-white font-semibold rounded-lg text-xs hover:bg-[#051A40]"
                >
                  View Loan Details & Schedule
                </Link>
                <Link
                  href="/admin/loans"
                  className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-50"
                >
                  Return to Loan List
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Select Member */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Select Approved Shareholder Member *
                </label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-[#082B67] font-semibold text-slate-800"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.customerId} - {c.phone})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Only admitted members in active standing are eligible to borrow under Nidhi Rules.
                </span>
              </div>

              {/* Loan Type & Principal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loan Product *</label>
                  <select
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-[#082B67]"
                  >
                    <option value="PERSONAL">Personal Member Loan</option>
                    <option value="GOLD">Gold Jewellery Loan</option>
                    <option value="PROPERTY">Mortgage / Property Loan</option>
                    <option value="BUSINESS">Micro Member Business Loan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Principal Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={5000}
                    max={2000000}
                    step={1000}
                    value={principalAmount}
                    onChange={(e) => setPrincipalAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-bold text-[#082B67] focus:ring-2 focus:ring-[#082B67]"
                  />
                </div>
              </div>

              {/* Interest Rate & Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Annual Interest Rate (% p.a.) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={24}
                    step={0.25}
                    value={annualInterestRate}
                    onChange={(e) => setAnnualInterestRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Calculation Method</label>
                  <select
                    value={interestType}
                    onChange={(e) => setInterestType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-[#082B67]"
                  >
                    <option value="REDUCING_BALANCE">Reducing Balance Interest</option>
                    <option value="FLAT">Flat Interest</option>
                  </select>
                </div>
              </div>

              {/* Tenure & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Months) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={60}
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Due Day</label>
                  <input
                    type="number"
                    min={1}
                    max={28}
                    value={emiDueDay}
                    onChange={(e) => setEmiDueDay(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                  />
                </div>
              </div>

              {/* Collateral Details */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Security / Collateral Particulars (if applicable)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Gold: 22K 28 grams custody receipt #GR-1049, or Property Survey No. 42/1A"
                  value={collateralDetails}
                  onChange={(e) => setCollateralDetails(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Credit Remarks</label>
                <input
                  type="text"
                  placeholder="Appraisal notes or purpose of facility"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <Link
                  href="/admin/loans"
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#082B67] hover:bg-[#051A40] text-white font-bold rounded-lg transition-colors shadow flex items-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4 text-[#E6A500]" />
                  {loading ? "Generating Amortization..." : "Submit Loan Proposal"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Live Calculation Preview (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#F5F7FB] to-[#E6EDF8] p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#082B67] tracking-wider">
              <Calculator className="w-4 h-4 text-[#E6A500]" /> Financial Engine Preview
            </div>

            <div>
              <span className="text-xs text-slate-500 font-semibold">Calculated Monthly Installment</span>
              <div className="text-3xl font-black text-[#082B67] mt-1">
                {formatINR(calc.monthlyEmi)}
                <span className="text-xs font-normal text-slate-500"> / month</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Sanction Principal:</span>
                <span className="font-bold text-slate-800">{formatINR(principalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Interest Component:</span>
                <span className="font-bold text-amber-600">{formatINR(calc.totalInterest)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Repayment Value:</span>
                <span className="font-bold text-[#082B67]">{formatINR(calc.totalRepayment)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-500">Tenure:</span>
                <span className="font-semibold text-slate-800">{tenureMonths} Installments</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Interest Basis:</span>
                <span className="font-semibold text-slate-800">{interestType}</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-[#082B67] space-y-1">
              <div className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E6A500]" /> Automated Schedule Engine
              </div>
              <p>
                Upon submission, a complete month-wise amortization schedule will be generated and linked directly to the member portal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
