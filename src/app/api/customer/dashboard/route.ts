import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.userType !== "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: session.userId },
      include: {
        branch: true,
        loans: {
          include: {
            repaymentSchedules: {
              orderBy: { installmentNumber: "asc" },
            },
            payments: {
              orderBy: { paymentDate: "desc" },
            },
          },
        },
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer profile not found" }, { status: 404 });
    }

    // Calculate aggregated statistics
    let totalLoanAmount = 0;
    let totalAmountRepaid = 0;
    let outstandingBalance = 0;
    let monthlyEmi = 0;
    let activeLoansCount = 0;
    let nextPaymentDate: Date | null = null;

    customer.loans.forEach((loan) => {
      if (loan.status === "ACTIVE" || loan.status === "APPROVED" || loan.status === "DISBURSED") {
        totalLoanAmount += loan.principalAmount;
        totalAmountRepaid += loan.amountRepaid;
        outstandingBalance += loan.outstandingBalance;
        monthlyEmi += loan.monthlyEmi;
        activeLoansCount += 1;

        // Find next upcoming EMI
        const nextUpcoming = loan.repaymentSchedules.find((s) => s.status === "UPCOMING");
        if (nextUpcoming && (!nextPaymentDate || new Date(nextUpcoming.dueDate) < nextPaymentDate)) {
          nextPaymentDate = new Date(nextUpcoming.dueDate);
        }
      }
    });

    return NextResponse.json({
      customer: {
        id: customer.id,
        customerId: customer.customerId,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
        membershipStatus: customer.membershipStatus,
        verificationStatus: customer.verificationStatus,
        accountStatus: customer.accountStatus,
        branch: customer.branch?.name,
      },
      stats: {
        totalLoanAmount,
        totalAmountRepaid,
        outstandingBalance,
        monthlyEmi,
        activeLoansCount,
        nextPaymentDate,
      },
      loans: customer.loans,
      notifications: customer.notifications,
    });
  } catch (error: any) {
    console.error("Customer dashboard API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
