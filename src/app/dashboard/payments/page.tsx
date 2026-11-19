"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatINR } from "@/lib/financial";
import { History, Receipt, Printer, X, ShieldCheck, CheckCircle2 } from "lucide-react";
import { safeJson } from "@/lib/api";

export default function PaymentHistoryPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeReceipt, setActiveReceipt] = useState<any>(null);

  useEffect(() => {
    fetch("/api/customer/dashboard")
      .then(safeJson)
      .then(({ ok, data }) => {
        setLoans(ok && data?.loans ? data.loans : []);
        setCustomer(ok && data?.customer ? data.customer : null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Collect all payments across loans
  const allPayments = loans.flatMap((l) =>
    (l.payments || []).map((p: any) => ({ ...p, loanRef: l.loanId, loanType: l.loanType }))
  );

  allPayments.sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  const handlePrint = () => {
    window.print();
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#082B67]">Payment History & Receipts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete transaction ledger for all EMI and principal repayments.
          </p>
        </div>
      </div>

      {allPayments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <History className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Transactions Found</h3>
          <p className="text-xs text-slate-500 mt-1">No payment transactions recorded yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#082B67] text-white">
                <tr>
                  <th className="py-3 px-4 font-semibold">Transaction ID</th>
                  <th className="py-3 px-4 font-semibold">Receipt Number</th>
                  <th className="py-3 px-4 font-semibold">Facility ID</th>
                  <th className="py-3 px-4 font-semibold">Payment Date</th>
                  <th className="py-3 px-4 font-semibold">Payment Method</th>
                  <th className="py-3 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                  <th className="py-3 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#082B67]">{p.transactionId}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{p.receiptNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{p.loanRef}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600">
                      {formatINR(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setActiveReceipt(p)}
                        className="px-2.5 py-1 bg-[#082B67] text-white hover:bg-[#051A40] rounded font-semibold text-[11px] flex items-center gap-1 mx-auto transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5 text-[#E6A500]" /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#E6A500]" />
                <span className="font-bold text-base text-[#082B67]">Official Payment Receipt</span>
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Printable Card */}
            <div id="receipt-print-area" className="p-6 bg-[#FDF9EE]/50 border border-amber-200 rounded-xl my-4 text-xs space-y-4">
              <div className="flex justify-between items-start border-b border-amber-200 pb-3">
                <div>
                  <div className="font-extrabold text-sm text-[#082B67]">ANNAPURNA FUTURE</div>
                  <div className="text-[10px] text-amber-700 font-semibold uppercase">
                    Financial Services Nidhi Limited
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    108 Mount Road, Chennai - 600018 | CIN: U65999TN2024PLN100000
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-800">{activeReceipt.receiptNumber}</div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(activeReceipt.paymentDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Received From:</span>
                  <span className="font-bold text-[#082B67]">{customer?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Member ID:</span>
                  <span className="font-mono font-bold">{customer?.customerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Loan Facility ID:</span>
                  <span className="font-bold">{activeReceipt.loanRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-semibold">{activeReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Ref:</span>
                  <span className="font-mono">{activeReceipt.transactionId}</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-amber-200 flex justify-between items-center">
                <span className="font-bold text-slate-700">Amount Received:</span>
                <span className="text-xl font-extrabold text-[#082B67]">
                  {formatINR(activeReceipt.amount)}
                </span>
              </div>

              <div className="pt-2 text-[10px] text-slate-500 flex justify-between items-center border-t border-amber-200">
                <span>Computer generated receipt. Valid under Nidhi Rules.</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                </span>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-[#082B67] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 hover:bg-[#051A40] transition-colors"
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
