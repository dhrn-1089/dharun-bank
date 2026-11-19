"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatINR } from "@/lib/financial";
import { safeJson } from "@/lib/api";
import {
  CreditCard,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Coins,
  Receipt,
  Download,
  Check,
  Ban,
  UserCheck
} from "lucide-react";

export default function AdminLoanDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchLoan = () => {
    fetch(`/api/admin/loans/${id}`)
      .then(safeJson)
      .then(({ ok, data, error }) => {
        if (!ok) throw new Error(error || "Loan not found");
        setLoan(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (id) fetchLoan();
  }, [id]);

  const handleAction = async (action: string) => {
    setActionLoading(true);
    setMsg("");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/admin/loans/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const { ok, data: resData, error: parseError } = await safeJson(res);
      if (!ok) throw new Error(parseError || resData?.error || "Action failed");

      setMsg(resData.message || "Action successful");
      fetchLoan();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to execute action.");
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

  if (!loan) {
    return (
      <div className="bg-white p-8 rounded-xl text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Loan Facility Not Found</h2>
        <Link href="/admin/loans" className="text-xs text-[#082B67] font-semibold underline">
          Back to Loan Portfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/loans"
            className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-[#082B67]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#082B67]">{loan.loanId}</h1>
              <span className="bg-blue-100 text-[#082B67] text-xs font-bold px-2.5 py-0.5 rounded">
                {loan.loanType} LOAN
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  loan.status === "ACTIVE"
                    ? "bg-emerald-100 text-emerald-800"
                    : loan.status === "PENDING_APPROVAL"
                    ? "bg-amber-100 text-amber-800"
                    : loan.status === "APPROVED"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {loan.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Borrower:{" "}
              <Link
                href={`/admin/customers/${loan.customer?.customerId}`}
                className="font-bold text-[#082B67] hover:underline"
              >
                {loan.customer?.fullName} ({loan.customer?.customerId})
              </Link>
            </p>
          </div>
        </div>

        {/* Maker-Checker Workflow Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {loan.status === "PENDING_APPROVAL" && (
            <>
              <button
                onClick={() => handleAction("APPROVE")}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow transition-colors"
              >
                <Check className="w-4 h-4" /> Approve Proposal (Checker)
              </button>
              <button
                onClick={() => handleAction("REJECT")}
                disabled={actionLoading}
                className="px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Ban className="w-3.5 h-3.5" /> Reject
              </button>
            </>
          )}

          {loan.status === "APPROVED" && (
            <button
              onClick={() => handleAction("DISBURSE")}
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow transition-colors"
            >
              <Coins className="w-4 h-4 text-[#E6A500]" /> Disburse Funds (Activate)
            </button>
          )}

          {loan.status === "ACTIVE" && (
            <Link
              href={`/admin/payments/new?loanId=${loan.loanId}`}
              className="px-4 py-2 bg-[#082B67] hover:bg-[#051A40] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition-colors"
            >
              <Receipt className="w-4 h-4 text-[#E6A500]" /> Record Payment
            </Link>
          )}
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block uppercase font-semibold">Sanctioned Principal</span>
          <span className="text-2xl font-black text-[#082B67] mt-1 block">
            {formatINR(loan.principalAmount)}
          </span>
          <span className="text-[10px] text-slate-400">{loan.interestType}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block uppercase font-semibold">Monthly Installment</span>
          <span className="text-2xl font-black text-[#082B67] mt-1 block">
            {formatINR(loan.monthlyEmi)}
          </span>
          <span className="text-[10px] text-slate-400">{loan.tenureMonths} Months tenure</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block uppercase font-semibold">Amount Collected</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {formatINR(loan.amountRepaid)}
          </span>
          <span className="text-[10px] text-emerald-700 font-medium">Principal & interest</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 block uppercase font-semibold">Outstanding Balance</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {formatINR(loan.outstandingBalance)}
          </span>
          <span className="text-[10px] text-slate-400">Total remaining</span>
        </div>
      </div>

      {/* Maker-Checker & Governance Particulars */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
        <h3 className="text-xs font-bold text-[#082B67] uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#E6A500]" /> Governance & Maker-Checker Audit Trail
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#F5F7FB] p-4 rounded-xl border border-slate-100">
          <div>
            <span className="text-slate-500 block">Proposal Maker (Initiator)</span>
            <span className="font-semibold text-slate-800">
              {loan.createdByAdmin?.fullName || "Staff Initiated"} ({loan.createdByAdmin?.role || "LOAN_OFFICER"})
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Checker (Approver)</span>
            <span className="font-semibold text-slate-800">
              {loan.approvedByAdmin
                ? `${loan.approvedByAdmin.fullName} (${loan.approvedByAdmin.role})`
                : "Pending Committee Review"}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Disbursal Officer</span>
            <span className="font-semibold text-slate-800">
              {loan.disbursedByAdmin
                ? `${loan.disbursedByAdmin.fullName} (${loan.disbursedByAdmin.role})`
                : "Pending Disbursal"}
            </span>
          </div>
        </div>
        {loan.collateralDetails && (
          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-amber-950">
            <strong>Collateral Vault Particulars:</strong> {loan.collateralDetails}
          </div>
        )}
      </div>

      {/* Repayment Schedule */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-sm text-[#082B67] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#E6A500]" /> Month-wise Repayment Schedule
          </h3>
          <span className="text-xs text-slate-500">
            {loan.repaymentSchedules?.length || 0} Scheduled Installments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#082B67] text-white">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Month</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3 text-right">Principal</th>
                <th className="py-2.5 px-3 text-right">Interest</th>
                <th className="py-2.5 px-3 text-right">EMI Amount</th>
                <th className="py-2.5 px-3 text-right">Paid</th>
                <th className="py-2.5 px-3 text-right">Remaining</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(loan.repaymentSchedules || []).map((row: any) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-slate-400">{row.installmentNumber}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{row.monthName}</td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {new Date(row.dueDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{formatINR(row.principalComponent)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{formatINR(row.interestComponent)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#082B67]">{formatINR(row.emiAmount)}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-600 font-semibold">{formatINR(row.paidAmount)}</td>
                  <td className="py-2.5 px-3 text-right font-semibold">{formatINR(row.remainingAmount)}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.status === "PAID"
                          ? "bg-emerald-100 text-emerald-800"
                          : row.status === "OVERDUE"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
