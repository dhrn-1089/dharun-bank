"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/financial";
import Greeting from "@/components/Greeting";
import CyberSignature from "@/components/CyberSignature";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  FileText,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

export default function CustomerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customer/dashboard")
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#082B67] border-t-[#E6A500] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Loading Member Portfolio...</p>
        </div>
      </div>
    );
  }

  const { customer, stats, loans, notifications } = data || {};
  const repaidRatio =
    stats?.totalLoanAmount > 0
      ? Math.round((stats.totalAmountRepaid / stats.totalLoanAmount) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Welcome & Member Banner */}
      <div className="bg-gradient-to-r from-[#082B67] via-[#0C367C] to-[#051A40] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[#E6A500] text-xs font-bold tracking-wider uppercase">
                Member Portfolio Overview
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                Active Member
              </span>
            </div>
            <Greeting name={customer?.fullName || "Member"} />
            <p className="text-xs sm:text-sm text-slate-200">
              Member ID: <span className="font-mono font-bold text-[#E6A500]">{customer?.customerId}</span> | Branch: {customer?.branch || "V.KOTA Head Office"}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/dashboard/statements"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-sm transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-[#E6A500]" />
              Download Statement
            </Link>
            <Link
              href="/dashboard/emi"
              className="px-4 py-2 bg-[#E6A500] hover:bg-amber-400 text-[#082B67] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
            >
              View EMI Schedule
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* 6 Required Financial Cards */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#082B67]">Financial Summary</h2>
          <span className="text-xs text-slate-500">Real-time ledger data</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Total Loan Amount */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Loan Amount
              </span>
              <div className="text-2xl font-extrabold text-[#082B67] mt-1">
                {formatINR(stats?.totalLoanAmount || 0)}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Total sanctioned principal</span>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-[#082B67] rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Total Amount Repaid */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Amount Repaid
              </span>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                {formatINR(stats?.totalAmountRepaid || 0)}
              </div>
              <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
                {repaidRatio}% of total loan cleared
              </span>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Outstanding Loan Balance */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Outstanding Balance
              </span>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">
                {formatINR(stats?.outstandingBalance || 0)}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Remaining balance to clear</span>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-[#E6A500] rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Monthly EMI Amount */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Monthly EMI Amount
              </span>
              <div className="text-2xl font-extrabold text-[#082B67] mt-1">
                {formatINR(stats?.monthlyEmi || 0)}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Combined monthly installment</span>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 5: Next Payment Date */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Next Payment Date
              </span>
              <div className="text-xl font-extrabold text-[#082B67] mt-1">
                {stats?.nextPaymentDate
                  ? new Date(stats.nextPaymentDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "No dues pending"}
              </div>
              <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">
                Scheduled repayment cycle
              </span>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          {/* Card 6: Total Active Loans */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total Active Loans
              </span>
              <div className="text-2xl font-extrabold text-[#082B67] mt-1">
                {stats?.activeLoansCount || 0}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Approved member accounts</span>
            </div>
            <div className="w-12 h-12 bg-slate-100 text-[#082B67] rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Repayment Progress & Active Loans */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Repayment Progress (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-[#082B67]">Repayment Progress</h3>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              {repaidRatio}% Completed
            </span>
          </div>

          <div className="space-y-2">
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="bg-[#082B67] h-full transition-all duration-500"
                style={{ width: `${repaidRatio}%` }}
              />
              <div
                className="bg-[#E6A500] h-full transition-all duration-500"
                style={{ width: `${100 - repaidRatio}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#082B67]" />
                Repaid: {formatINR(stats?.totalAmountRepaid || 0)}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E6A500]" />
                Outstanding: {formatINR(stats?.outstandingBalance || 0)}
              </span>
            </div>
          </div>

          {/* Active Loans Preview */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Your Active Facilities
            </h4>
            {loans && loans.length > 0 ? (
              loans.map((loan: any) => (
                <div
                  key={loan.id}
                  className="p-4 bg-slate-50 hover:bg-blue-50/40 rounded-xl border border-slate-200 transition-colors flex justify-between items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#082B67]">{loan.loanId}</span>
                      <span className="text-[10px] bg-blue-100 text-[#082B67] font-semibold px-2 py-0.5 rounded">
                        {loan.loanType} LOAN
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Sanctioned: {formatINR(loan.principalAmount)} @ {loan.annualInterestRate}% p.a. ({loan.interestType})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-[#082B67]">
                      {formatINR(loan.monthlyEmi)} / mo
                    </div>
                    <Link
                      href="/dashboard/emi"
                      className="text-xs text-[#082B67] hover:text-[#E6A500] font-semibold flex items-center justify-end gap-0.5 mt-0.5"
                    >
                      Schedule <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No active loans found.</p>
            )}
          </div>
        </div>

        {/* Right: Notifications & Reminders (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-[#082B67]">Recent Activity & Alerts</h3>
            <span className="text-[11px] font-semibold text-[#082B67] bg-slate-100 px-2 py-0.5 rounded">
              In-App Center
            </span>
          </div>

          <div className="space-y-3">
            {notifications && notifications.length > 0 ? (
              notifications.map((notif: any) => (
                <div
                  key={notif.id}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-xs text-[#082B67]">{notif.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notif.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500">No notifications at this time.</p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <Link
              href="/dashboard/payments"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              View Complete Payment History
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="pt-4 text-center">
        <CyberSignature variant="light" />
      </div>
    </div>
  );
}
