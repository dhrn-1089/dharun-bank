"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/financial";
import Greeting from "@/components/Greeting";
import CyberSignature from "@/components/CyberSignature";
import { safeJson } from "@/lib/api";
import {
  Users,
  CreditCard,
  TrendingUp,
  Receipt,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  FileText,
  ArrowUpRight,
  ExternalLink,
  UserPlus
} from "lucide-react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(safeJson)
      .then(({ ok, data: resData }) => {
        if (ok && resData) {
          setData(resData);
        }
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
          <p className="text-xs text-slate-500 font-semibold">Aggregating Financial Ledger...</p>
        </div>
      </div>
    );
  }

  const { stats, recentPayments, recentCustomers, admin } = data || {};

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#082B67] via-[#0C367C] to-[#051A40] rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#E6A500] text-[#082B67] font-extrabold text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
              {admin?.role} DASHBOARD
            </span>
            <span className="text-xs text-slate-300">Annapurna Future Financial Services</span>
          </div>
          <Greeting name={admin?.fullName || "Administrator"} />
          <p className="text-xs text-slate-300">
            Main Branch: <strong>V.KOTA Head Office (AP)</strong> | Employee Code: <span className="font-mono text-[#E6A500]">{admin?.adminCode || "AFS-EMP-1001"}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/staff"
            className="px-4 py-2 bg-[#E6A500] hover:bg-amber-400 text-[#082B67] text-xs font-bold rounded-xl transition-all shadow flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" /> Manage Staff
          </Link>
          <Link
            href="/admin/payments/new"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4 text-[#E6A500]" /> Record Payment
          </Link>
          <Link
            href="/admin/loans/new"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-[#E6A500]" /> Create Loan
          </Link>
        </div>
      </div>

      {/* 10 Required Live Statistics Cards */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#082B67]">Live Financial Portfolio Statistics</h2>
          <span className="text-xs text-slate-500">Auto-calculated from PostgreSQL/SQLite records</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Stat 1: Total Registered Customers */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              1. Total Customers
            </span>
            <div className="text-2xl font-black text-[#082B67] mt-1">{stats?.totalCustomers || 0}</div>
            <span className="text-[10px] text-slate-400">All registered profiles</span>
          </div>

          {/* Stat 2: Total Active Members */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              2. Active Members
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats?.activeMembers || 0}</div>
            <span className="text-[10px] text-emerald-700 font-medium">Admitted shareholders</span>
          </div>

          {/* Stat 3: Total Active Loans */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              3. Active Loans
            </span>
            <div className="text-2xl font-black text-blue-700 mt-1">{stats?.activeLoans || 0}</div>
            <span className="text-[10px] text-slate-400">Performing credit accounts</span>
          </div>

          {/* Stat 4: Disbursed Amount */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              4. Total Disbursed
            </span>
            <div className="text-xl font-black text-[#082B67] mt-1">{formatINR(stats?.totalDisbursed || 0)}</div>
            <span className="text-[10px] text-slate-400">Cumulative disbursement</span>
          </div>

          {/* Stat 5: Amount Collected */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              5. Total Collected
            </span>
            <div className="text-xl font-black text-emerald-600 mt-1">{formatINR(stats?.totalCollected || 0)}</div>
            <span className="text-[10px] text-emerald-700 font-medium">Principal & interest repaid</span>
          </div>

          {/* Stat 6: Outstanding Balance */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              6. Outstanding Loan
            </span>
            <div className="text-xl font-black text-amber-600 mt-1">{formatINR(stats?.totalOutstanding || 0)}</div>
            <span className="text-[10px] text-slate-400">Total portfolio at risk</span>
          </div>

          {/* Stat 7: Total Monthly EMI Collection */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              7. Monthly EMI Run
            </span>
            <div className="text-xl font-black text-[#082B67] mt-1">{formatINR(stats?.totalMonthlyEmi || 0)}</div>
            <span className="text-[10px] text-slate-400">Expected monthly flow</span>
          </div>

          {/* Stat 8: Pending EMI Payments */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              8. Upcoming Installments
            </span>
            <div className="text-2xl font-black text-blue-600 mt-1">{stats?.pendingSchedules || 0}</div>
            <span className="text-[10px] text-slate-400">Active schedule cycles</span>
          </div>

          {/* Stat 9: Overdue EMI Payments */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              9. Overdue EMIs
            </span>
            <div className="text-2xl font-black text-rose-600 mt-1">{stats?.overdueSchedules || 0}</div>
            <span className="text-[10px] text-rose-700 font-medium">Require collection follow-up</span>
          </div>

          {/* Stat 10: Pending Approvals */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              10. Pending Approvals
            </span>
            <div className="text-2xl font-black text-purple-700 mt-1">{stats?.pendingApprovals || 0}</div>
            <span className="text-[10px] text-purple-700 font-medium">Maker-checker queue</span>
          </div>
        </div>
      </div>

      {/* Grid: Recent Transactions & Pending Member Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Transactions (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-[#082B67]">Recent Payment Collections</h3>
            <Link
              href="/admin/payments"
              className="text-xs font-semibold text-[#082B67] hover:text-[#E6A500] flex items-center gap-1"
            >
              All Transactions <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="py-2.5 px-3">Receipt / Tx</th>
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments && recentPayments.length > 0 ? (
                  recentPayments.map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#082B67]">
                        {p.receiptNumber}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold">{p.customer?.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.customer?.customerId}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-emerald-600">
                        {formatINR(p.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-[10px] text-slate-500">
                        {p.recordedByAdmin?.fullName || "System"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-400">
                      No recent transactions recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Registrations & Approvals (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-[#082B67]">Recent Member Onboarding</h3>
            <Link
              href="/admin/customers"
              className="text-xs font-semibold text-[#082B67] hover:text-[#E6A500] flex items-center gap-1"
            >
              Customer Directory <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentCustomers && recentCustomers.length > 0 ? (
              recentCustomers.map((cust: any) => (
                <div
                  key={cust.id}
                  className="p-3 bg-slate-50 hover:bg-blue-50/40 rounded-xl border border-slate-200 transition-colors flex justify-between items-center text-xs"
                >
                  <div>
                    <div className="font-bold text-[#082B67]">{cust.fullName}</div>
                    <div className="text-[10px] text-slate-500">
                      ID: <span className="font-mono font-semibold">{cust.customerId}</span> | {cust.phone}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        cust.accountStatus === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {cust.accountStatus}
                    </span>
                    <Link
                      href={`/admin/customers/${cust.customerId}`}
                      className="block text-[11px] font-semibold text-[#082B67] hover:underline mt-1"
                    >
                      Review Profile →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No customers registered yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4 text-center">
        <CyberSignature variant="light" />
      </div>
    </div>
  );
}
