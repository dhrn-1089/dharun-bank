"use client";

import { useState } from "react";
import { formatINR, calculateReducingBalanceEmi, calculateFlatInterestEmi } from "@/lib/financial";
import { Calculator, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState<number>(100000);
  const [tenure, setTenure] = useState<number>(18);
  const [rate, setRate] = useState<number>(12);
  const [interestType, setInterestType] = useState<"REDUCING" | "FLAT">("REDUCING");

  const calc =
    interestType === "REDUCING"
      ? calculateReducingBalanceEmi(principal, rate, tenure)
      : calculateFlatInterestEmi(principal, rate, tenure);

  const principalPercent = Math.round((principal / calc.totalRepayment) * 100);
  const interestPercent = 100 - principalPercent;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-[#082B67] to-[#123F85] p-6 text-white flex justify-between items-center">
        <div>
          <span className="text-[#E6A500] font-semibold text-xs tracking-wider uppercase flex items-center gap-1.5">
            <Calculator className="w-4 h-4" /> Accurate Financial Engine
          </span>
          <h3 className="text-2xl font-bold mt-1">Interactive EMI Calculator</h3>
        </div>
        <div className="flex bg-white/10 rounded-lg p-1 border border-white/20 text-xs font-semibold">
          <button
            onClick={() => setInterestType("REDUCING")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              interestType === "REDUCING" ? "bg-[#E6A500] text-[#082B67] shadow" : "text-white"
            }`}
          >
            Reducing Balance
          </button>
          <button
            onClick={() => setInterestType("FLAT")}
            className={`px-3 py-1.5 rounded-md transition-all ${
              interestType === "FLAT" ? "bg-[#E6A500] text-[#082B67] shadow" : "text-white"
            }`}
          >
            Flat Rate
          </button>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sliders Area (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Principal Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700">Loan Amount</label>
              <span className="text-lg font-bold text-[#082B67]">{formatINR(principal)}</span>
            </div>
            <input
              type="range"
              min={10000}
              max={1000000}
              step={10000}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#082B67]"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>₹10,000</span>
              <span>₹5,00,000</span>
              <span>₹10,00,000</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700">Loan Duration (Tenure)</label>
              <span className="text-lg font-bold text-[#082B67]">{tenure} Months</span>
            </div>
            <input
              type="range"
              min={6}
              max={60}
              step={6}
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#082B67]"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>6 Months</span>
              <span>24 Months</span>
              <span>60 Months</span>
            </div>
          </div>

          {/* Interest Rate Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-slate-700">Annual Interest Rate (% p.a.)</label>
              <span className="text-lg font-bold text-[#082B67]">{rate}%</span>
            </div>
            <input
              type="range"
              min={8}
              max={20}
              step={0.5}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#082B67]"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>8% p.a.</span>
              <span>12% p.a.</span>
              <span>20% p.a.</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3 text-xs text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              All calculations adhere strictly to the Nidhi Rules under the Companies Act, 2013 with 100% transparent fee structures.
            </span>
          </div>
        </div>

        {/* Results Card (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#F5F7FB] to-[#EDF2F9] p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Estimated Monthly Installment
            </span>
            <div className="text-4xl font-extrabold text-[#082B67] mt-1 mb-4">
              {formatINR(calc.monthlyEmi)}
              <span className="text-sm font-normal text-slate-500"> / month</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-200 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Principal Amount</span>
                <span className="font-semibold text-slate-800">{formatINR(principal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Interest Payable</span>
                <span className="font-semibold text-amber-600">{formatINR(calc.totalInterest)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#082B67] pt-2 border-t border-slate-200">
                <span>Total Amount Payable</span>
                <span>{formatINR(calc.totalRepayment)}</span>
              </div>
            </div>

            {/* Proportion Bar */}
            <div className="mt-6">
              <div className="text-xs text-slate-500 flex justify-between mb-1.5 font-medium">
                <span>Principal ({principalPercent}%)</span>
                <span>Interest ({interestPercent}%)</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#082B67] h-full"
                  style={{ width: `${principalPercent}%` }}
                />
                <div
                  className="bg-[#E6A500] h-full"
                  style={{ width: `${interestPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <Link
              href="/register"
              className="w-full py-3 bg-[#082B67] hover:bg-[#051A40] text-white font-semibold rounded-lg text-center flex items-center justify-center gap-2 shadow transition-all"
            >
              Apply For Member Loan
              <ArrowRight className="w-4 h-4 text-[#E6A500]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
