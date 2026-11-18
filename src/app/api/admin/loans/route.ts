import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateReducingBalanceEmi,
  calculateFlatInterestEmi,
  generateAmortizationSchedule,
} from "@/lib/financial";

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";
    const type = searchParams.get("type") || "ALL";

    const where: any = {};
    if (status !== "ALL") where.status = status;
    if (type !== "ALL") where.loanType = type;

    const loans = await prisma.loan.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            customerId: true,
            fullName: true,
            phone: true,
          },
        },
        createdByAdmin: { select: { fullName: true, role: true } },
        approvedByAdmin: { select: { fullName: true, role: true } },
        disbursedByAdmin: { select: { fullName: true, role: true } },
      },
    });

    return NextResponse.json(loans);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      customerId,
      loanType = "PERSONAL",
      principalAmount,
      annualInterestRate,
      interestType = "REDUCING_BALANCE",
      tenureMonths,
      startDate = new Date().toISOString(),
      emiDueDay = 5,
      collateralDetails,
      remarks,
    } = body;

    if (!customerId || !principalAmount || !annualInterestRate || !tenureMonths) {
      return NextResponse.json(
        { error: "Customer, Principal, Interest Rate, and Tenure are required." },
        { status: 400 }
      );
    }

    // Verify Customer exists and is approved
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [{ id: customerId }, { customerId }],
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    if (customer.accountStatus !== "ACTIVE" || customer.membershipStatus !== "ACTIVE") {
      return NextResponse.json(
        { error: "Loans can only be created for active and approved shareholder-members." },
        { status: 400 }
      );
    }

    // Backend Accurate Financial Calculation
    const principal = Number(principalAmount);
    const rate = Number(annualInterestRate);
    const tenure = Number(tenureMonths);

    const calc =
      interestType === "FLAT"
        ? calculateFlatInterestEmi(principal, rate, tenure)
        : calculateReducingBalanceEmi(principal, rate, tenure);

    const start = new Date(startDate);
    const end = new Date(start.getFullYear(), start.getMonth() + tenure, emiDueDay);

    // Generate Unique Loan ID
    const loanCount = await prisma.loan.count();
    const currentYear = new Date().getFullYear();
    const loanId = `AFS-LN-${currentYear}-${String(loanCount + 1).padStart(3, "0")}`;

    // Generate Month-wise Repayment Schedule
    const scheduleRows = generateAmortizationSchedule(
      principal,
      rate,
      tenure,
      start,
      interestType as any,
      emiDueDay
    );

    // Create Loan and Repayment Schedules in transaction
    const newLoan = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: {
          loanId,
          customerId: customer.id,
          branchId: customer.branchId,
          loanType,
          principalAmount: principal,
          annualInterestRate: rate,
          interestType,
          tenureMonths: tenure,
          monthlyEmi: calc.monthlyEmi,
          totalInterest: calc.totalInterest,
          totalRepaymentAmount: calc.totalRepayment,
          amountDisbursed: 0,
          amountRepaid: 0,
          outstandingBalance: calc.totalRepayment,
          startDate: start,
          endDate: end,
          emiDueDay: Number(emiDueDay),
          collateralDetails: collateralDetails || null,
          remarks: remarks || null,
          status: "PENDING_APPROVAL", // Maker-Checker requirement
          createdByAdminId: session.adminProfileId || null,
        },
      });

      // Insert Repayment Schedules
      for (const row of scheduleRows) {
        await tx.repaymentSchedule.create({
          data: {
            loanId: loan.id,
            installmentNumber: row.installmentNumber,
            monthName: row.monthName,
            dueDate: row.dueDate,
            emiAmount: row.emiAmount,
            principalComponent: row.principalComponent,
            interestComponent: row.interestComponent,
            paidAmount: 0,
            remainingAmount: row.remainingAmount,
            status: "UPCOMING",
          },
        });
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          adminId: session.adminProfileId,
          adminRole: session.role,
          action: "LOAN_CREATE",
          entityType: "LOAN",
          entityId: loan.loanId,
          newValues: JSON.stringify({
            principal,
            rate,
            tenure,
            monthlyEmi: calc.monthlyEmi,
          }),
          remarks: `Loan ${loan.loanId} proposal created for ${customer.fullName} (${customer.customerId}) by ${session.role}.`,
        },
      });

      return loan;
    });

    return NextResponse.json({
      success: true,
      message: `Loan proposal ${newLoan.loanId} created and submitted for Maker-Checker approval.`,
      loan: newLoan,
    });
  } catch (error: any) {
    console.error("Loan creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
