"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { formatINR } from "@/lib/financial";
import { safeJson } from "@/lib/api";
import {
  User,
  ArrowLeft,
  CreditCard,
  Receipt,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Clock,
  Printer,
  Ban,
  UserCheck
} from "lucide-react";

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchProfile = () => {
    fetch(`/api/admin/customers/${id}`)
      .then(safeJson)
      .then(({ ok, data: d, error }) => {
        if (!ok) throw new Error(error || "Customer not found");
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  const handleStatusAction = async (action: string) => {
    setActionLoading(true);
    setMsg("");
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const { ok, data: resData, error: parseError } = await safeJson(res);
      if (!ok) throw new Error(parseError || resData?.error || "Action failed");
      setMsg(resData.message || "Customer status updated successfully.");
      fetchProfile();
    } catch (err: any) {
      alert(err.message || "Failed to update customer status.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#082B67] border-t-[#E6A500] rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.customer) {
    return (
      <div className="bg-white p-8 rounded-xl text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Customer Profile Not Found</h2>
        <Link href="/admin/customers" className="text-xs text-[#082B67] font-semibold underline">
          Back to Directory
        </Link>
      </div>
    );
  }

  const { customer, summary } = data;

  return (
    <div className="space-y-6">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/customers"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-[#082B67]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#082B67]">{customer.fullName}</h1>
              <span className="font-mono bg-blue-100 text-[#082B67] text-xs font-bold px-2 py-0.5 rounded">
                {customer.customerId}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Registered on {new Date(customer.createdAt).toLocaleDateString("en-IN")} via {customer.createdByAdmin ? "Admin Onboarding" : "Self-Registration"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {customer.accountStatus === "PENDING_APPROVAL" && (
            <button
              onClick={() => handleStatusAction("APPROVE_REGISTRATION")}
              disabled={actionLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow transition-colors"
            >
              <UserCheck className="w-4 h-4" /> Approve Registration
            </button>
          )}

          {customer.accountStatus === "ACTIVE" && (
            <button
              onClick={() => handleStatusAction("REJECT_REGISTRATION")}
              disabled={actionLoading}
              className="px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Ban className="w-3.5 h-3.5" /> Suspend
            </button>
          )}

          <Link
            href="/admin/loans/new"
            className="px-4 py-2 bg-[#082B67] hover:bg-[#051A40] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#E6A500]" /> Issue New Loan
          </Link>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* 8 Required Financial Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block uppercase font-semibold">Total Loans Taken</span>
          <span className="text-2xl font-black text-[#082B67] mt-1 block">{summary.totalLoansTaken}</span>
          <span className="text-[10px] text-slate-400">
            {summary.activeLoansCount} Active | {summary.completedLoansCount} Closed
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block uppercase font-semibold">Amount Disbursed</span>
          <span className="text-xl font-black text-[#082B67] mt-1 block">
            {formatINR(summary.totalAmountDisbursed)}
          </span>
          <span className="text-[10px] text-slate-400">Principal disbursed</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block uppercase font-semibold">Amount Repaid</span>
          <span className="text-xl font-black text-emerald-600 mt-1 block">
            {formatINR(summary.totalAmountRepaid)}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium">Total collections</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block uppercase font-semibold">Total Outstanding</span>
          <span className="text-xl font-black text-amber-600 mt-1 block">
            {formatINR(summary.totalOutstanding)}
          </span>
          <span className="text-[10px] text-slate-400">Balance to clear</span>
        </div>
      </div>

      {/* Personal & KYC Profile Details */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="text-sm font-bold text-[#082B67] flex items-center gap-2">
          <User className="w-4 h-4 text-[#E6A500]" /> KYC & Identity Details
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#F5F7FB] p-4 rounded-xl border border-slate-100">
          <div>
            <span className="text-slate-500 block">Phone</span>
            <span className="font-semibold text-slate-800">{customer.phone}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Email</span>
            <span className="font-semibold text-slate-800">{customer.email || "N/A"}</span>
          </div>
          <div>
            <span className="text-slate-500 block">PAN Number</span>
            <span className="font-mono font-semibold text-slate-800">{customer.panNumber || "N/A"}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Aadhaar (Masked)</span>
            <span className="font-mono font-semibold text-slate-800">{customer.aadhaarMasked || "N/A"}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-500 block">Address</span>
            <span className="font-semibold text-slate-800">
              {customer.address}, {customer.city}, {customer.state} - {customer.pincode}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Membership Status</span>
            <span className="font-bold text-emerald-700">{customer.membershipStatus}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Account Status</span>
            <span className="font-bold text-[#082B67]">{customer.accountStatus}</span>
          </div>
        </div>
      </div>

      {/* Customer Loan History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-sm text-[#082B67] flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#E6A500]" /> Customer Loan History
          </h3>
          <span className="text-xs text-slate-500">{customer.loans.length} Loans recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#082B67] text-white">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Loan ID</th>
                <th className="py-2.5 px-4 font-semibold">Type</th>
                <th className="py-2.5 px-4 font-semibold text-right">Principal</th>
                <th className="py-2.5 px-4 font-semibold text-right">Interest Rate</th>
                <th className="py-2.5 px-4 font-semibold text-right">Monthly EMI</th>
                <th className="py-2.5 px-4 font-semibold text-right">Repaid</th>
                <th className="py-2.5 px-4 font-semibold text-right">Outstanding</th>
                <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                <th className="py-2.5 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customer.loans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-400">
                    No loans issued for this customer yet.
                  </td>
                </tr>
              ) : (
                customer.loans.map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-[#082B67]">{l.loanId}</td>
                    <td className="py-3 px-4 font-semibold">{l.loanType}</td>
                    <td className="py-3 px-4 text-right font-semibold">{formatINR(l.principalAmount)}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{l.annualInterestRate}%</td>
                    <td className="py-3 px-4 text-right font-bold text-[#082B67]">{formatINR(l.monthlyEmi)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">{formatINR(l.amountRepaid)}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-amber-600">{formatINR(l.outstandingBalance)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        href={`/admin/loans/${l.loanId}`}
                        className="text-xs font-semibold text-[#082B67] hover:underline"
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Payment History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-sm text-[#082B67] flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#E6A500]" /> Payment & Collection History
          </h3>
          <span className="text-xs text-slate-500">{customer.payments.length} Payments</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#082B67] text-white">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Transaction ID</th>
                <th className="py-2.5 px-4 font-semibold">Receipt Number</th>
                <th className="py-2.5 px-4 font-semibold">Payment Date</th>
                <th className="py-2.5 px-4 font-semibold">Method</th>
                <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                <th className="py-2.5 px-4 font-semibold">Processed By</th>
                <th className="py-2.5 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customer.payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No payment transactions recorded for this customer.
                  </td>
                </tr>
              ) : (
                customer.payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-[#082B67]">{p.transactionId}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{p.receiptNumber}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(p.paymentDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3 px-4 font-semibold">{p.paymentMethod}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600">
                      {formatINR(p.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {p.recordedByAdmin?.fullName || "System"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
