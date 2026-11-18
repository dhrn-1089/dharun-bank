"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatINR } from "@/lib/financial";
import { ArrowLeft, Receipt, CheckCircle2, AlertCircle, Coins, ShieldCheck } from "lucide-react";

function RecordPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillLoanId = searchParams.get("loanId") || "";

  const [loans, setLoans] = useState<any[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState(prefillLoanId);
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentType, setPaymentType] = useState("EMI");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("Monthly EMI repayment received.");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/loans?status=ACTIVE")
      .then((res) => res.json())
      .then((data) => {
        const activeLoans = Array.isArray(data) ? data : [];
        setLoans(activeLoans);
        if (!selectedLoanId && activeLoans.length > 0) {
          setSelectedLoanId(activeLoans[0].id);
          setAmount(activeLoans[0].monthlyEmi);
        } else if (selectedLoanId) {
          const found = activeLoans.find(
            (l) => l.id === selectedLoanId || l.loanId === selectedLoanId
          );
          if (found) {
            setSelectedLoanId(found.id);
            setAmount(found.monthlyEmi);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const selectedLoan = loans.find(
    (l) => l.id === selectedLoanId || l.loanId === selectedLoanId
  );

  const handleLoanChange = (id: string) => {
    setSelectedLoanId(id);
    const l = loans.find((item) => item.id === id);
    if (l) {
      setAmount(l.monthlyEmi);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedLoanId || !amount || amount <= 0) {
      setError("Please select an active loan facility and specify valid payment amount.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanId: selectedLoanId,
          amount,
          paymentMethod,
          paymentType,
          paymentDate,
          referenceNumber,
          remarks,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to record payment");

      setSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/payments"
          className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-[#082B67]"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[#082B67]">Record EMI Payment</h1>
          <p className="text-xs text-slate-500">
            Process member offline counter payment or reconcile digital gateway receipts.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-[#082B67]">Payment Recorded Successfully!</h3>
            <p className="text-xs text-slate-600">
              Generated Receipt Number:{" "}
              <span className="font-mono font-bold text-[#082B67] bg-slate-100 px-2 py-1 rounded">
                {success.payment.receiptNumber}
              </span>
            </p>
            <p className="text-xs text-slate-500">
              New Facility Outstanding Balance:{" "}
              <strong className="text-[#082B67]">{formatINR(success.outstandingBalance)}</strong>
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link
                href="/admin/payments"
                className="px-5 py-2.5 bg-[#082B67] text-white font-semibold rounded-lg text-xs hover:bg-[#051A40]"
              >
                View Payment Ledger
              </Link>
              <button
                onClick={() => {
                  setSuccess(null);
                  if (selectedLoan) setAmount(selectedLoan.monthlyEmi);
                }}
                className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg text-xs hover:bg-slate-50"
              >
                Record Another Payment
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Select Active Loan */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select Active Loan Facility *
              </label>
              <select
                required
                value={selectedLoanId}
                onChange={(e) => handleLoanChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-[#082B67]"
              >
                {loans.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.loanId} – {l.customer?.fullName} ({l.loanType} - Outstanding: {formatINR(l.outstandingBalance)})
                  </option>
                ))}
              </select>
            </div>

            {/* Live Loan Summary Box */}
            {selectedLoan && (
              <div className="p-4 bg-[#F5F7FB] border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-500 block">Borrower</span>
                  <span className="font-bold text-[#082B67]">{selectedLoan.customer?.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Monthly Installment</span>
                  <span className="font-bold text-[#082B67]">{formatINR(selectedLoan.monthlyEmi)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Repaid</span>
                  <span className="font-bold text-emerald-600">{formatINR(selectedLoan.amountRepaid)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Outstanding</span>
                  <span className="font-bold text-amber-600">{formatINR(selectedLoan.outstandingBalance)}</span>
                </div>
              </div>
            )}

            {/* Payment Particulars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Amount Received (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  step={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-extrabold text-[#082B67] text-sm focus:ring-2 focus:ring-[#082B67]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white focus:ring-2 focus:ring-[#082B67]"
                >
                  <option value="CASH">Cash Counter</option>
                  <option value="UPI">UPI / QR Payment</option>
                  <option value="BANK_TRANSFER">Bank IMPS / NEFT</option>
                  <option value="CHEQUE">Bank Cheque / DD</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Date *</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Bank / UPI Transaction Reference (if any)
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI-1234567890 or Chq #40921"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Receipt Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-[#082B67]"
                />
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-[#082B67]" /> Automated Ledger Updates
              </div>
              <p className="text-[11px]">
                Recording this payment will immediately reduce the outstanding loan balance, update the earliest unpaid installment in the schedule, generate a printable receipt, and notify the member.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Link
                href="/admin/payments"
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#082B67] hover:bg-[#051A40] text-white font-bold rounded-lg transition-colors shadow flex items-center gap-1.5"
              >
                <Receipt className="w-4 h-4 text-[#E6A500]" />
                {loading ? "Recording Payment..." : "Record Payment & Generate Receipt"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function RecordPaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecordPaymentContent />
    </Suspense>
  );
}
