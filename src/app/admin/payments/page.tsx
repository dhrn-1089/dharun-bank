"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/financial";
import { Receipt, PlusCircle, Search, Printer, CheckCircle2, X } from "lucide-react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeReceipt, setActiveReceipt] = useState<any>(null);

  const fetchPayments = () => {
    setLoading(true);
    fetch(`/api/admin/payments?query=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setPayments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPayments();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#082B67]">EMI Payments & Collections</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official cash and digital collection ledger with automated reconciliation.
          </p>
        </div>

        <Link
          href="/admin/payments/new"
          className="px-4 py-2 bg-[#082B67] hover:bg-[#051A40] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow"
        >
          <PlusCircle className="w-4 h-4 text-[#E6A500]" /> Record Member Payment
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by Receipt #, Tx ID, Member Name, or Loan ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-20 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#082B67]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <button
            type="submit"
            className="absolute right-1.5 top-1 px-3 py-1 bg-[#082B67] text-white text-[10px] font-semibold rounded"
          >
            Search
          </button>
        </form>

        <span className="text-xs text-slate-500 font-medium">
          Total Transactions: <strong>{payments.length}</strong>
        </span>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#082B67] text-white">
              <tr>
                <th className="py-3 px-4 font-semibold">Receipt Number</th>
                <th className="py-3 px-4 font-semibold">Transaction ID</th>
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-4 font-semibold">Loan Facility</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Mode</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
                <th className="py-3 px-4 font-semibold">Staff</th>
                <th className="py-3 px-4 font-semibold text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading payments ledger...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-[#082B67]">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">{p.transactionId}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{p.customer?.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {p.customer?.customerId}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold">{p.loan?.loanId}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(p.paymentDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600">
                      {formatINR(p.amount)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[10px]">
                      {p.recordedByAdmin?.fullName || "System"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setActiveReceipt(p)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-[#082B67] hover:text-white rounded text-[10px] font-semibold transition-colors"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="font-bold text-sm text-[#082B67]">Official Collection Receipt</span>
              <button onClick={() => setActiveReceipt(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 bg-[#FDF9EE]/50 border border-amber-200 rounded-xl my-4 text-xs space-y-3">
              <div className="flex justify-between items-start border-b border-amber-200 pb-2">
                <div>
                  <div className="font-extrabold text-xs text-[#082B67]">ANNAPURNA FUTURE</div>
                  <div className="text-[10px] text-amber-700 font-semibold uppercase">
                    Financial Services Nidhi Limited
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-800">{activeReceipt.receiptNumber}</div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(activeReceipt.paymentDate).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Member Name:</span>
                  <span className="font-bold text-[#082B67]">{activeReceipt.customer?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Member ID:</span>
                  <span className="font-mono font-bold">{activeReceipt.customer?.customerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Facility ID:</span>
                  <span className="font-mono font-bold">{activeReceipt.loan?.loanId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-semibold">{activeReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tx Reference:</span>
                  <span className="font-mono">{activeReceipt.transactionId}</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-amber-200 flex justify-between items-center">
                <span className="font-bold text-slate-700">Amount Received:</span>
                <span className="text-xl font-black text-[#082B67]">
                  {formatINR(activeReceipt.amount)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-[#082B67] hover:bg-[#051A40] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-[#E6A500]" /> Print Receipt
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
