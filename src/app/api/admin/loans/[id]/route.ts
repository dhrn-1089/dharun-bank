import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loan = await prisma.loan.findFirst({
      where: {
        OR: [{ id: params.id }, { loanId: params.id }],
      },
      include: {
        customer: true,
        branch: true,
        createdByAdmin: true,
        approvedByAdmin: true,
        disbursedByAdmin: true,
        repaymentSchedules: {
          orderBy: { installmentNumber: "asc" },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
          include: { recordedByAdmin: true },
        },
      },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    return NextResponse.json(loan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, remarks } = body; // action: "APPROVE", "DISBURSE", "REJECT", "CLOSE"

    const loan = await prisma.loan.findFirst({
      where: {
        OR: [{ id: params.id }, { loanId: params.id }],
      },
      include: { customer: true },
    });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    // MAKER-CHECKER CONTROL ENFORCEMENT:
    // The person who initiates a controlled transaction cannot approve their own transaction.
    if (action === "APPROVE") {
      if (loan.createdByAdminId && loan.createdByAdminId === session.adminProfileId) {
        return NextResponse.json(
          {
            error:
              "Maker-Checker Violation: You created this loan proposal and cannot approve your own submission. A separate authorized administrator or Super Admin must review and approve it.",
          },
          { status: 403 }
        );
      }
    }

    let updateData: any = {};

    if (action === "APPROVE") {
      updateData = {
        status: "APPROVED",
        approvedByAdminId: session.adminProfileId || null,
        approvalDate: new Date(),
      };
    } else if (action === "DISBURSE") {
      updateData = {
        status: "ACTIVE",
        amountDisbursed: loan.principalAmount,
        disbursedByAdminId: session.adminProfileId || null,
        disbursementDate: new Date(),
      };
    } else if (action === "REJECT") {
      updateData = {
        status: "REJECTED",
      };
    } else if (action === "CLOSE") {
      updateData = {
        status: "CLOSED",
        outstandingBalance: 0,
      };
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.loan.update({
        where: { id: loan.id },
        data: updateData,
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          adminId: session.adminProfileId,
          adminRole: session.role,
          action: `LOAN_${action}`,
          entityType: "LOAN",
          entityId: loan.loanId,
          remarks:
            remarks ||
            `Loan ${loan.loanId} ${action} action executed by ${session.role}.`,
        },
      });

      // Customer notification
      if (loan.customer?.userId) {
        let msg = "";
        if (action === "APPROVE") {
          msg = `Your loan facility ${loan.loanId} of ${loan.principalAmount} has been approved by credit committee.`;
        } else if (action === "DISBURSE") {
          msg = `Your loan facility ${loan.loanId} has been successfully disbursed! The EMI repayment schedule is now live.`;
        }

        if (msg) {
          await tx.notification.create({
            data: {
              userId: loan.customer.userId,
              customerId: loan.customerId,
              title: `Loan Facility ${action}`,
              message: msg,
              type: "SUCCESS",
            },
          });
        }
      }

      return res;
    });

    return NextResponse.json({
      success: true,
      message: `Loan ${loan.loanId} successfully updated with action: ${action}.`,
      loan: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
