import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 1. Total Registered Customers
    const totalCustomers = await prisma.customer.count();

    // 2. Total Active Members
    const activeMembers = await prisma.customer.count({
      where: { membershipStatus: "ACTIVE" },
    });

    // 3. Total Active Loans
    const activeLoans = await prisma.loan.count({
      where: { status: "ACTIVE" },
    });

    // 4. Total Loan Amount Disbursed & Outstanding
    const allLoans = await prisma.loan.findMany();
    let totalDisbursed = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;
    let totalMonthlyEmi = 0;

    allLoans.forEach((loan) => {
      totalDisbursed += loan.amountDisbursed;
      totalCollected += loan.amountRepaid;
      totalOutstanding += loan.outstandingBalance;
      if (loan.status === "ACTIVE") {
        totalMonthlyEmi += loan.monthlyEmi;
      }
    });

    // 5. Repayment Schedules status
    const pendingSchedules = await prisma.repaymentSchedule.count({
      where: { status: "UPCOMING" },
    });

    const overdueSchedules = await prisma.repaymentSchedule.count({
      where: { status: "OVERDUE" },
    });

    // 6. Pending Approvals (Customers awaiting approval + Loans awaiting approval)
    const pendingCustomerApprovals = await prisma.customer.count({
      where: { accountStatus: "PENDING_APPROVAL" },
    });

    const pendingLoanApprovals = await prisma.loan.count({
      where: { status: "PENDING_APPROVAL" },
    });

    // 7. Recent Transactions (last 6)
    const recentPayments = await prisma.payment.findMany({
      take: 6,
      orderBy: { paymentDate: "desc" },
      include: {
        customer: true,
        loan: true,
        recordedByAdmin: true,
      },
    });

    // 8. Recent Customers (last 5)
    const recentCustomers = await prisma.customer.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      stats: {
        totalCustomers,
        activeMembers,
        activeLoans,
        totalDisbursed,
        totalCollected,
        totalOutstanding,
        totalMonthlyEmi,
        pendingSchedules,
        overdueSchedules,
        pendingApprovals: pendingCustomerApprovals + pendingLoanApprovals,
        pendingCustomerApprovals,
        pendingLoanApprovals,
      },
      recentPayments,
      recentCustomers,
      admin: {
        role: session.role,
        phone: session.phone,
        email: session.email,
      },
    });
  } catch (error: any) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
