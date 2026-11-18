import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const reportType = searchParams.get("type") || "COLLECTION_MONTHLY";

    if (reportType.startsWith("COLLECTION")) {
      const payments = await prisma.payment.findMany({
        orderBy: { paymentDate: "desc" },
        include: {
          customer: true,
          loan: true,
          recordedByAdmin: true,
        },
      });

      const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);

      return NextResponse.json({
        reportType,
        totalRecords: payments.length,
        totalAmount: totalCollected,
        records: payments,
      });
    }

    if (reportType === "DISBURSEMENT") {
      const loans = await prisma.loan.findMany({
        where: { amountDisbursed: { gt: 0 } },
        orderBy: { startDate: "desc" },
        include: {
          customer: true,
          branch: true,
          disbursedByAdmin: true,
        },
      });

      const totalDisbursed = loans.reduce((acc, l) => acc + l.amountDisbursed, 0);

      return NextResponse.json({
        reportType,
        totalRecords: loans.length,
        totalAmount: totalDisbursed,
        records: loans,
      });
    }

    if (reportType === "OUTSTANDING") {
      const loans = await prisma.loan.findMany({
        where: { outstandingBalance: { gt: 0 } },
        orderBy: { outstandingBalance: "desc" },
        include: {
          customer: true,
          branch: true,
        },
      });

      const totalOutstanding = loans.reduce((acc, l) => acc + l.outstandingBalance, 0);

      return NextResponse.json({
        reportType,
        totalRecords: loans.length,
        totalAmount: totalOutstanding,
        records: loans,
      });
    }

    if (reportType === "OVERDUE") {
      const schedules = await prisma.repaymentSchedule.findMany({
        where: {
          status: { in: ["OVERDUE", "UPCOMING"] },
          dueDate: { lt: new Date() },
          remainingAmount: { gt: 0 },
        },
        include: {
          loan: {
            include: { customer: true },
          },
        },
      });

      const totalOverdue = schedules.reduce((acc, s) => acc + s.remainingAmount, 0);

      return NextResponse.json({
        reportType,
        totalRecords: schedules.length,
        totalAmount: totalOverdue,
        records: schedules,
      });
    }

    if (reportType === "CUSTOMERS") {
      const customers = await prisma.customer.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          branch: true,
          loans: true,
        },
      });

      return NextResponse.json({
        reportType,
        totalRecords: customers.length,
        records: customers,
      });
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
