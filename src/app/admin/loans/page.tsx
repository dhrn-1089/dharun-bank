"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/financial";
import { CreditCard, PlusCircle, Search, Filter, ArrowRight, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { safeJson } from "@/lib/api";

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchLoans = () => {
    setLoading(true);
    fetch(`/api/admin/loans?status=${status}&type=${type}`)
      .then(safeJson)
      .then(({ ok, data }) => {
        setLoans(ok && Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLoans();
  }, [status, type]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#082B67]">Loan Portfolio & Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maker-Checker workflow, appraisal review, and active facility administration.
          </p>
        </div>

        <Link
          href="/admin/loans/new"
          className="px-4 py-2 bg-[#082B67] hover:bg-[#051A40] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow"
        >
          <PlusCircle className="w-4 h-4 text-[#E6A500]" /> Issue New Member Loan
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" /> Facility Status:
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs font-semibold text-[#082B67] border border-slate-300 rounded-lg px-3 py-1.5 outline-none bg-white cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING_APPROVAL">PENDING_APPROVAL (Checker Queue)</option>
            <option value="APPROVED">APPROVED (Pending Disbursal)</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold ml-2">
            Loan Type:
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="text-xs font-semibold text-[#082B67] border border-slate-300 rounded-lg px-3 py-1.5 outline-none bg-white cursor-pointer"
          >
            <option value="ALL">All Products</option>
            <option value="PERSONAL">Personal Loan</option>
            <option value="GOLD">Gold Loan</option>
            <option value="PROPERTY">Property / Mortgage</option>
            <option value="BUSINESS">Micro Member Business</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing <strong>{loans.length}</strong> facilities
        </span>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#082B67] text-white">
              <tr>
                <th className="py-3 px-4 font-semibold">Loan ID</th>
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-4 font-semibold">Type & Interest</th>
                <th className="py-3 px-4 font-semibold text-right">Principal</th>
                <th className="py-3 px-4 font-semibold text-right">Monthly EMI</th>
                <th className="py-3 px-4 font-semibold text-right">Repaid</th>
                <th className="py-3 px-4 font-semibold text-right">Outstanding</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading loan records...
                  </td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No loan facilities match selected criteria.
                  </td>
                </tr>
              ) : (
                loans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#082B67]">
                      {l.loanId}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{l.customer?.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {l.customer?.customerId} | {l.customer?.phone}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-700">{l.loanType} LOAN</div>
                      <div className="text-[10px] text-slate-500">
                        {l.annualInterestRate}% p.a. ({l.interestType})
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-[#082B67]">
                      {formatINR(l.principalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                      {formatINR(l.monthlyEmi)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-600">
                      {formatINR(l.amountRepaid)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-amber-600">
                      {formatINR(l.outstandingBalance)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                          l.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : l.status === "PENDING_APPROVAL"
                            ? "bg-amber-100 text-amber-800"
                            : l.status === "APPROVED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/admin/loans/${l.loanId}`}
                        className="px-3 py-1.5 bg-[#082B67] hover:bg-[#051A40] text-white rounded font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        Review <ArrowRight className="w-3 h-3 text-[#E6A500]" />
                      </Link>
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
