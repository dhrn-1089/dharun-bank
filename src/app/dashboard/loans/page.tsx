"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/financial";
import { CreditCard, Calendar, CheckCircle2, ShieldCheck, ArrowRight, Clock } from "lucide-react";

export default function MyLoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/customer/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setLoans(data.loans || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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
          <h1 className="text-2xl font-extrabold text-[#082B67]">My Member Loans</h1>
          <p className="text-xs text-slate-500 mt-1">
            Active and past credit facilities extended by Annapurna Future Financial Services.
          </p>
        </div>
        <Link
          href="/dashboard/emi"
          className="px-4 py-2 bg-[#082B67] text-white text-xs font-semibold rounded-lg hover:bg-[#051A40] transition-colors"
        >
          View Repayment Calendar
        </Link>
      </div>

      {loans.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <CreditCard className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Loans Found</h3>
          <p className="text-xs text-slate-500 mt-1">You do not have any active loans at this time.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {loans.map((loan) => {
            const progress =
              loan.totalRepaymentAmount > 0
                ? Math.round((loan.amountRepaid / loan.totalRepaymentAmount) * 100)
                : 0;

            return (
              <div
                key={loan.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-base text-[#082B67]">
                      {loan.loanId}
                    </span>
                    <span className="bg-blue-100 text-[#082B67] text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {loan.loanType} LOAN
                    </span>
                    <span className="text-xs text-slate-500">
                      Method: <strong className="text-slate-700">{loan.interestType}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        loan.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : loan.status === "CLOSED"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {loan.status}
                    </span>
                  </div>
                </div>

                {/* Body Details Grid */}
                <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">Approved Principal</span>
                    <span className="text-base font-extrabold text-[#082B67]">
                      {formatINR(loan.principalAmount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">Annual Interest Rate</span>
                    <span className="text-base font-extrabold text-[#082B67]">
                      {loan.annualInterestRate}% p.a.
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">Monthly Installment (EMI)</span>
                    <span className="text-base font-extrabold text-[#082B67]">
                      {formatINR(loan.monthlyEmi)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">Loan Duration (Tenure)</span>
                    <span className="text-base font-extrabold text-slate-800">
                      {loan.tenureMonths} Months
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">Total Payable Amount</span>
                    <span className="text-base font-bold text-slate-800">
                      {formatINR(loan.totalRepaymentAmount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">Amount Repaid</span>
                    <span className="text-base font-bold text-emerald-600">
                      {formatINR(loan.amountRepaid)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">Remaining Balance</span>
                    <span className="text-base font-bold text-amber-600">
                      {formatINR(loan.outstandingBalance)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block mb-1">Repayment Due Day</span>
                    <span className="text-base font-bold text-slate-800">
                      {loan.emiDueDay}th of every month
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="px-6 pb-6">
                  <div className="flex justify-between text-xs text-slate-500 mb-1 font-semibold">
                    <span>Repayment Progress</span>
                    <span>{progress}% cleared</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-[#082B67] h-full" style={{ width: `${progress}%` }} />
                    <div className="bg-[#E6A500] h-full" style={{ width: `${100 - progress}%` }} />
                  </div>
                </div>

                {/* Footer action */}
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500">
                    Sanction Date: {new Date(loan.startDate).toLocaleDateString("en-IN")}
                  </span>
                  <Link
                    href="/dashboard/emi"
                    className="font-bold text-[#082B67] hover:text-[#E6A500] flex items-center gap-1 transition-colors"
                  >
                    View Amortization Schedule <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
