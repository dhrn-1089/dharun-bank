"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { formatINR } from "@/lib/financial";
import { Download, Printer, ShieldCheck, FileSpreadsheet } from "lucide-react";
import { safeJson } from "@/lib/api";

export default function LoanStatementPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customer/dashboard")
      .then(safeJson)
      .then(({ ok, data: resData }) => {
        setData(ok ? resData : null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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

  const { customer, stats, loans } = data || {};
  const primaryLoan = loans && loans.length > 0 ? loans[0] : null;

  return (
    <div className="space-y-6">
      {/* Top action bar - hidden during print */}
      <div className="no-print flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-[#082B67]">Official Loan Statement</h1>
          <p className="text-xs text-slate-500">Member account statement and repayment ledger.</p>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-[#082B67] hover:bg-[#051A40] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow"
        >
          <Printer className="w-4 h-4 text-[#E6A500]" /> Print / Save as PDF
        </button>
      </div>

      {/* Printable Statement Document */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-300 shadow-lg text-slate-800 space-y-8">
        {/* Document Header */}
        <div className="flex justify-between items-start border-b-2 border-[#082B67] pb-6">
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-14">
              <Image src="/logo.jpg" alt="AFS Logo" fill className="object-contain" priority />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#082B67] tracking-tight">
                ANNAPURNA FUTURE FINANCIAL SERVICES
              </h2>
              <h3 className="text-xs font-bold text-[#E6A500] uppercase tracking-wider">
                Nidhi Limited – Member Financial Services
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">
                Regd Office: 108 Mount Road, Teynampet, Chennai, Tamil Nadu - 600018 | CIN: U65999TN2024PLN100000
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Statement Date</span>
            <div className="text-sm font-extrabold text-[#082B67]">
              {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Member and Facility Details Grid */}
        <div className="grid grid-cols-2 gap-8 text-xs border-b border-slate-200 pb-6">
          <div>
            <h4 className="font-bold text-[#082B67] uppercase tracking-wider mb-2">Member Details</h4>
            <div className="space-y-1">
              <div>
                <span className="text-slate-500">Name:</span> <strong className="text-slate-800">{customer?.fullName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Customer ID:</span> <strong className="font-mono text-[#082B67]">{customer?.customerId}</strong>
              </div>
              <div>
                <span className="text-slate-500">Phone:</span> {customer?.phone}
              </div>
              <div>
                <span className="text-slate-500">Membership Status:</span>{" "}
                <span className="font-bold text-emerald-700">{customer?.membershipStatus}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-[#082B67] uppercase tracking-wider mb-2">Facility Summary</h4>
            {primaryLoan ? (
              <div className="space-y-1">
                <div>
                  <span className="text-slate-500">Facility ID:</span> <strong className="font-mono">{primaryLoan.loanId}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Loan Type:</span> <strong>{primaryLoan.loanType} LOAN</strong> ({primaryLoan.interestType})
                </div>
                <div>
                  <span className="text-slate-500">Sanctioned Principal:</span> <strong>{formatINR(primaryLoan.principalAmount)}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Rate of Interest:</span> <strong>{primaryLoan.annualInterestRate}% p.a.</strong>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No active loan facility.</p>
            )}
          </div>
        </div>

        {/* Outstanding Ledger Summary */}
        {primaryLoan && (
          <div>
            <h4 className="font-bold text-[#082B67] uppercase tracking-wider text-xs mb-3">
              Account Position
            </h4>
            <div className="grid grid-cols-4 gap-4 p-4 bg-[#F5F7FB] rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 block">Total Sanctioned</span>
                <span className="text-base font-bold text-[#082B67]">{formatINR(primaryLoan.principalAmount)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Amount Repaid</span>
                <span className="text-base font-bold text-emerald-600">{formatINR(primaryLoan.amountRepaid)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Outstanding Balance</span>
                <span className="text-base font-bold text-amber-600">{formatINR(primaryLoan.outstandingBalance)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Monthly Installment</span>
                <span className="text-base font-bold text-[#082B67]">{formatINR(primaryLoan.monthlyEmi)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Repayment Schedule Ledger */}
        {primaryLoan && primaryLoan.repaymentSchedules && (
          <div>
            <h4 className="font-bold text-[#082B67] uppercase tracking-wider text-xs mb-3">
              Repayment Schedule Ledger
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3 text-right">Principal</th>
                    <th className="py-2.5 px-3 text-right">Interest</th>
                    <th className="py-2.5 px-3 text-right">EMI</th>
                    <th className="py-2.5 px-3 text-right">Paid</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {primaryLoan.repaymentSchedules.map((row: any) => (
                    <tr key={row.id}>
                      <td className="py-2 px-3 font-mono text-slate-400">{row.installmentNumber}</td>
                      <td className="py-2 px-3 font-semibold">{row.monthName}</td>
                      <td className="py-2 px-3 text-slate-600">
                        {new Date(row.dueDate).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-2 px-3 text-right">{formatINR(row.principalComponent)}</td>
                      <td className="py-2 px-3 text-right">{formatINR(row.interestComponent)}</td>
                      <td className="py-2 px-3 text-right font-bold">{formatINR(row.emiAmount)}</td>
                      <td className="py-2 px-3 text-right text-emerald-600 font-semibold">{formatINR(row.paidAmount)}</td>
                      <td className="py-2 px-3 text-right font-semibold">{formatINR(row.remainingAmount)}</td>
                      <td className="py-2 px-3 text-center font-bold text-[10px]">
                        {row.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer & Certification */}
        <div className="pt-8 border-t border-slate-200 text-xs text-slate-500 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="font-semibold text-slate-700">Notes & Statutory Disclosures:</p>
              <p className="text-[11px] mt-1 max-w-lg leading-relaxed">
                This is a computer-generated statement issued by Annapurna Future Financial Services Nidhi Limited. In case of any discrepancy, please notify your branch within 7 days.
              </p>
            </div>
            <div className="text-right">
              <div className="border-t border-slate-400 pt-1 w-44 text-center font-bold text-slate-800">
                Authorized Signatory
              </div>
              <div className="text-[10px] text-slate-500 text-center">AFS Nidhi Limited</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
