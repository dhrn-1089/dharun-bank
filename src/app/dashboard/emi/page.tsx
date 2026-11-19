"use client";

import { useEffect, useState } from "react";
import { formatINR } from "@/lib/financial";
import { CalendarDays, Filter, Download, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { safeJson } from "@/lib/api";

export default function EMISchedulePage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customer/dashboard")
      .then(safeJson)
      .then(({ ok, data }) => {
        const loadedLoans = ok && data?.loans ? data.loans : [];
        setLoans(loadedLoans);
        if (loadedLoans.length > 0) {
          setSelectedLoanId(loadedLoans[0].id);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const activeLoan = loans.find((l) => l.id === selectedLoanId);
  const schedules = activeLoan?.repaymentSchedules || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">Paid</span>;
      case "UPCOMING":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">Upcoming</span>;
      case "PENDING":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">Pending</span>;
      case "OVERDUE":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800">Overdue</span>;
      case "PARTIALLY_PAID":
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800">Partially Paid</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#082B67] border-t-[#E6A500] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#082B67]">Monthly EMI Schedule</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official month-wise amortization and repayment schedule.
          </p>
        </div>

        {/* Loan Selector */}
        {loans.length > 1 && (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Facility:</span>
            <select
              value={selectedLoanId}
              onChange={(e) => setSelectedLoanId(e.target.value)}
              className="text-xs font-bold text-[#082B67] bg-transparent outline-none cursor-pointer"
            >
              {loans.map((loan) => (
                <option key={loan.id} value={loan.id}>
                  {loan.loanId} ({loan.loanType} - {formatINR(loan.principalAmount)})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeLoan && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Facility ID</span>
            <span className="font-mono font-bold text-sm text-[#082B67]">{activeLoan.loanId}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Monthly Installment</span>
            <span className="font-bold text-sm text-[#082B67]">{formatINR(activeLoan.monthlyEmi)}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Tenure</span>
            <span className="font-bold text-sm text-slate-800">{activeLoan.tenureMonths} Months</span>
          </div>
          <div>
            <span className="text-slate-500 block">Outstanding</span>
            <span className="font-bold text-sm text-amber-600">{formatINR(activeLoan.outstandingBalance)}</span>
          </div>
          <Link
            href="/dashboard/statements"
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF Schedule
          </Link>
        </div>
      )}

      {/* Amortization Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#082B67] text-white">
              <tr>
                <th className="py-3 px-4 font-semibold">#</th>
                <th className="py-3 px-4 font-semibold">Month</th>
                <th className="py-3 px-4 font-semibold">Due Date</th>
                <th className="py-3 px-4 font-semibold text-right">Principal</th>
                <th className="py-3 px-4 font-semibold text-right">Interest</th>
                <th className="py-3 px-4 font-semibold text-right">EMI Amount</th>
                <th className="py-3 px-4 font-semibold text-right">Paid Amount</th>
                <th className="py-3 px-4 font-semibold text-right">Remaining</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.map((row: any) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-500 font-medium">
                    {row.installmentNumber}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{row.monthName}</td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {new Date(row.dueDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-600">
                    {formatINR(row.principalComponent)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-600">
                    {formatINR(row.interestComponent)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-[#082B67]">
                    {formatINR(row.emiAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-emerald-600">
                    {formatINR(row.paidAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-700">
                    {formatINR(row.remainingAmount)}
                  </td>
                  <td className="py-3.5 px-4 text-center">{getStatusBadge(row.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
