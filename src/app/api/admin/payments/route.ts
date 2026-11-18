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
    const query = searchParams.get("query") || "";

    const where: any = {};
    if (query) {
      where.OR = [
        { transactionId: { contains: query } },
        { receiptNumber: { contains: query } },
        { customer: { customerId: { contains: query } } },
        { customer: { fullName: { contains: query } } },
        { loan: { loanId: { contains: query } } },
      ];
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { paymentDate: "desc" },
      include: {
        customer: true,
        loan: true,
        recordedByAdmin: true,
      },
    });

    return NextResponse.json(payments);
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
      loanId,
      customerId,
      amount,
      paymentMethod = "CASH",
      paymentType = "EMI",
      paymentDate = new Date().toISOString(),
      referenceNumber,
      remarks,
    } = body;

    const numAmount = Number(amount);
    if (!loanId || !numAmount || numAmount <= 0) {
      return NextResponse.json(
        { error: "Valid Loan ID and positive payment amount are required." },
        { status: 400 }
      );
    }

    // Find Loan
    const loan = await prisma.loan.findFirst({
      where: {
        OR: [{ id: loanId }, { loanId: loanId }],
      },
      include: {
        customer: true,
        repaymentSchedules: {
          orderBy: { installmentNumber: "asc" },
        },
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan facility not found." }, { status: 404 });
    }

    // Generate Unique Transaction ID and Receipt Number
    const count = await prisma.payment.count();
    const transactionId = `AFS-TXN-${10001 + count}`;
    const receiptNumber = `AFS-REC-${10001 + count}`;

    // Execute payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payment record
      const payment = await tx.payment.create({
        data: {
          transactionId,
          receiptNumber,
          loanId: loan.id,
          customerId: loan.customerId,
          amount: numAmount,
          paymentDate: new Date(paymentDate),
          paymentMethod,
          paymentType,
          status: "SUCCESS",
          referenceNumber: referenceNumber || null,
          remarks: remarks || "EMI payment received and recorded.",
          recordedByAdminId: session.adminProfileId || null,
        },
      });

      // 2. Allocate payment to earliest unpaid / partially paid repayment schedule item
      let remainingToAllocate = numAmount;
      for (const schedule of loan.repaymentSchedules) {
        if (remainingToAllocate <= 0) break;
        if (schedule.status === "PAID") continue;

        const dueInThisSchedule = schedule.remainingAmount;
        if (remainingToAllocate >= dueInThisSchedule) {
          await tx.repaymentSchedule.update({
            where: { id: schedule.id },
            data: {
              paidAmount: schedule.emiAmount,
              remainingAmount: 0,
              status: "PAID",
              paidDate: new Date(paymentDate),
            },
          });
          remainingToAllocate -= dueInThisSchedule;
        } else {
          await tx.repaymentSchedule.update({
            where: { id: schedule.id },
            data: {
              paidAmount: schedule.paidAmount + remainingToAllocate,
              remainingAmount: schedule.remainingAmount - remainingToAllocate,
              status: "PARTIALLY_PAID",
              paidDate: new Date(paymentDate),
            },
          });
          remainingToAllocate = 0;
        }
      }

      // 3. Recalculate and update Loan balance
      const newAmountRepaid = loan.amountRepaid + numAmount;
      const newOutstandingBalance = Math.max(0, loan.outstandingBalance - numAmount);
      const isCompleted = newOutstandingBalance === 0;

      await tx.loan.update({
        where: { id: loan.id },
        data: {
          amountRepaid: newAmountRepaid,
          outstandingBalance: newOutstandingBalance,
          status: isCompleted ? "CLOSED" : loan.status,
        },
      });

      // 4. Create Audit Log
      await tx.auditLog.create({
        data: {
          adminId: session.adminProfileId,
          adminRole: session.role,
          action: "PAYMENT_RECORD",
          entityType: "PAYMENT",
          entityId: payment.transactionId,
          newValues: JSON.stringify({
            amount: numAmount,
            receiptNumber,
            loanId: loan.loanId,
            customerId: loan.customer.customerId,
          }),
          remarks: `Payment of ₹${numAmount} recorded for loan ${loan.loanId} by ${session.role}. Receipt #${receiptNumber} generated.`,
        },
      });

      // 5. Send Notification to Customer
      if (loan.customer.userId) {
        await tx.notification.create({
          data: {
            userId: loan.customer.userId,
            customerId: loan.customerId,
            title: "EMI Payment Confirmation",
            message: `Payment of ₹${numAmount} for facility ${loan.loanId} successfully recorded. Receipt: ${receiptNumber}.`,
            type: "SUCCESS",
          },
        });
      }

      return { payment, newOutstandingBalance };
    });

    return NextResponse.json({
      success: true,
      message: `Payment of ₹${numAmount} successfully recorded. Receipt ${result.payment.receiptNumber} generated.`,
      payment: result.payment,
      outstandingBalance: result.newOutstandingBalance,
    });
  } catch (error: any) {
    console.error("Payment recording error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
