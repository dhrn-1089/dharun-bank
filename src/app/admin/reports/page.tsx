"use client";

import { useEffect, useState } from "react";
import { formatINR } from "@/lib/financial";
import { FileBarChart, Download, Filter, Calendar } from "lucide-react";

export default function AdminReportsPage() {
  const [reportType, setReportType] = useState("COLLECTION_MONTHLY");
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = () => {
    setLoading(true);
    fetch(`/api/admin/reports?type=${reportType}`)
      .then((res) => res.json())
      .then((data) => {
        setReportData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  const exportCSV = () => {
    if (!reportData?.records) return;
    let headers: string[] = [];
    let rows: any[][] = [];

    if (reportType.startsWith("COLLECTION")) {
      headers = ["Receipt Number", "Transaction ID", "Customer ID", "Customer Name", "Loan ID", "Amount", "Method", "Date"];
      rows = reportData.records.map((r: any) => [
        r.receiptNumber,
        r.transactionId,
        r.customer?.customerId,
        r.customer?.fullName,
        r.loan?.loanId,
        r.amount,
        r.paymentMethod,
        new Date(r.paymentDate).toLocaleDateString("en-IN"),
      ]);
    } else if (reportType === "DISBURSEMENT") {
      headers = ["Loan ID", "Customer ID", "Customer Name", "Type", "Principal", "Disbursed", "Date"];
      rows = reportData.records.map((r: any) => [
        r.loanId,
        r.customer?.customerId,
        r.customer?.fullName,
        r.loanType,
        r.principalAmount,
        r.amountDisbursed,
        new Date(r.startDate).toLocaleDateString("en-IN"),
      ]);
    } else if (reportType === "OUTSTANDING") {
      headers = ["Loan ID", "Customer ID", "Customer Name", "Sanction Principal", "Repaid", "Outstanding Balance"];
      rows = reportData.records.map((r: any) => [
        r.loanId,
        r.customer?.customerId,
        r.customer?.fullName,
        r.principalAmount,
        r.amountRepaid,
        r.outstandingBalance,
      ]);
    } else {
      headers = ["ID", "Name", "Phone", "Email", "Status"];
      rows = reportData.records.map((r: any) => [
        r.customerId,
        r.fullName,
        r.phone,
        r.email || "N/A",
        r.accountStatus,
      ]);
    }

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AFS_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#082B67]">Financial Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Statutory collection, disbursement, and portfolio quality reports.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 text-[#E6A500]" /> Export Report (CSV)
        </button>
      </div>

      {/* Select Report Type */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
        <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-[#082B67]" /> Select Statutory Report:
        </span>
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="text-xs font-bold text-[#082B67] border border-slate-300 rounded-lg px-3 py-2 outline-none bg-white cursor-pointer"
        >
          <option value="COLLECTION_MONTHLY">1. Monthly Collection Ledger</option>
          <option value="COLLECTION_DAILY">2. Daily Counter Collection Report</option>
          <option value="DISBURSEMENT">3. Loan Disbursement Audit Report</option>
          <option value="OUTSTANDING">4. Outstanding Loan Portfolio Report</option>
          <option value="OVERDUE">5. Overdue Payment Tracking Report</option>
          <option value="CUSTOMERS">6. Shareholder-Member Directory Report</option>
        </select>
      </div>

      {/* Report Summary Card */}
      {reportData && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">
              Total Records
            </span>
            <span className="text-2xl font-black text-[#082B67] mt-1 block">
              {reportData.totalRecords || 0}
            </span>
          </div>

          {reportData.totalAmount !== undefined && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Total Value
              </span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">
                {formatINR(reportData.totalAmount)}
              </span>
            </div>
          )}

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">
              Report Generated
            </span>
            <span className="text-sm font-bold text-slate-800 mt-1 block">
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      )}

      {/* Report Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#082B67] text-white">
              <tr>
                <th className="py-3 px-4 font-semibold">#</th>
                <th className="py-3 px-4 font-semibold">Reference</th>
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-4 font-semibold">Particulars</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
                <th className="py-3 px-4 font-semibold text-center">Date / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Compiling report data...
                  </td>
                </tr>
              ) : !reportData?.records || reportData.records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No records found for this report type.
                  </td>
                </tr>
              ) : (
                reportData.records.map((r: any, idx: number) => (
                  <tr key={r.id || idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#082B67]">
                      {r.receiptNumber || r.loanId || r.customerId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">
                        {r.customer?.fullName || r.fullName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {r.customer?.customerId || r.phone}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {r.paymentMethod
                        ? `Mode: ${r.paymentMethod} (${r.loan?.loanId || ""})`
                        : r.loanType
                        ? `${r.loanType} LOAN @ ${r.annualInterestRate}%`
                        : r.city
                        ? `${r.city}, ${r.state}`
                        : "General Ledger"}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-[#082B67]">
                      {formatINR(r.amount || r.amountDisbursed || r.outstandingBalance || 0)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {r.status ||
                          (r.paymentDate
                            ? new Date(r.paymentDate).toLocaleDateString("en-IN")
                            : "Recorded")}
                      </span>
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
