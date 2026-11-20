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

    const customer = await prisma.customer.findFirst({
      where: {
        OR: [{ id: params.id }, { customerId: params.id }],
      },
      include: {
        branch: true,
        createdByAdmin: true,
        loans: {
          include: {
            repaymentSchedules: {
              orderBy: { installmentNumber: "asc" },
            },
            payments: {
              orderBy: { paymentDate: "desc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
          include: {
            loan: true,
            recordedByAdmin: true,
          },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Compute aggregated financial analytics
    let totalLoansTaken = customer.loans.length;
    let totalAmountDisbursed = 0;
    let totalAmountRepaid = 0;
    let totalOutstanding = 0;
    let monthlyEmi = 0;
    let activeLoansCount = 0;
    let completedLoansCount = 0;
    let overdueAmount = 0;
    let nextDueDate: Date | null = null;

    customer.loans.forEach((loan) => {
      totalAmountDisbursed += loan.amountDisbursed;
      totalAmountRepaid += loan.amountRepaid;
      totalOutstanding += loan.outstandingBalance;

      if (loan.status === "ACTIVE") {
        activeLoansCount += 1;
        monthlyEmi += loan.monthlyEmi;

        // Find upcoming and overdue schedules
        loan.repaymentSchedules.forEach((s) => {
          if (s.status === "OVERDUE") {
            overdueAmount += s.remainingAmount;
          }
          if (s.status === "UPCOMING" && (!nextDueDate || new Date(s.dueDate) < nextDueDate)) {
            nextDueDate = new Date(s.dueDate);
          }
        });
      } else if (loan.status === "CLOSED") {
        completedLoansCount += 1;
      }
    });

    return NextResponse.json({
      customer,
      summary: {
        totalLoansTaken,
        totalAmountDisbursed,
        totalAmountRepaid,
        totalOutstanding,
        monthlyEmi,
        activeLoansCount,
        completedLoansCount,
        overdueAmount,
        nextDueDate,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleCustomerUpdate(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, status, reason } = body;

    const customer = await prisma.customer.findFirst({
      where: {
        OR: [{ id: params.id }, { customerId: params.id }],
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const previousStatus = {
      applicationStatus: customer.applicationStatus,
      verificationStatus: customer.verificationStatus,
      membershipStatus: customer.membershipStatus,
      accountStatus: customer.accountStatus,
      loanEligibilityStatus: customer.loanEligibilityStatus,
    };

    let updateData: any = {};

    if (action === "DELETE" || action === "REQUEST_DELETION") {
      const isSuperAdmin = session.role === "SUPER_ADMIN";

      if (isSuperAdmin) {
        // Direct Super Admin Delete without approval
        await prisma.$transaction(async (tx) => {
          const loans = await tx.loan.findMany({ where: { customerId: customer.id } });
          const loanIds = loans.map((l) => l.id);
          if (loanIds.length > 0) {
            await tx.repaymentSchedule.deleteMany({ where: { loanId: { in: loanIds } } });
            await tx.payment.deleteMany({ where: { loanId: { in: loanIds } } });
            await tx.loan.deleteMany({ where: { id: { in: loanIds } } });
          }
          await tx.payment.deleteMany({ where: { customerId: customer.id } });
          await tx.loanApplication.deleteMany({ where: { customerId: customer.id } });
          await tx.notification.deleteMany({ where: { customerId: customer.id } });
          await tx.customer.delete({ where: { id: customer.id } });

          if (customer.userId) {
            await tx.notification.deleteMany({ where: { userId: customer.userId } });
            await tx.user.delete({ where: { id: customer.userId } });
          }

          await tx.deletionRequest.updateMany({
            where: { entityId: customer.id, status: "PENDING" },
            data: { status: "APPROVED", reviewedAt: new Date() },
          });

          await tx.auditLog.create({
            data: {
              adminId: session.adminProfileId,
              adminRole: session.role,
              action: "CUSTOMER_PERMANENT_DELETE",
              entityType: "CUSTOMER",
              entityId: customer.customerId,
              remarks: `Customer ${customer.fullName} (${customer.customerId}) permanently removed by Super Admin. Reason: ${reason || "Direct removal"}.`,
            },
          });
        });

        return NextResponse.json({
          success: true,
          immediate: true,
          message: `Customer ${customer.fullName} (${customer.customerId}) permanently deleted by Super Admin.`,
        });
      } else {
        // Staff Request Deletion - Requires Super Admin Approval
        await prisma.customer.update({
          where: { id: customer.id },
          data: { accountStatus: "PENDING_DELETION" },
        });

        const reqRecord = await prisma.deletionRequest.create({
          data: {
            entityType: "CUSTOMER",
            entityId: customer.id,
            entityIdentifier: `${customer.customerId} - ${customer.fullName}`,
            reason: reason || "Staff requested customer removal.",
            status: "PENDING",
            requestedById: session.adminProfileId || session.userId,
            requestedByRole: session.role || "STAFF",
            requestedByName: session.name || "Staff Member",
          },
        });

        await prisma.auditLog.create({
          data: {
            adminId: session.adminProfileId,
            adminRole: session.role,
            action: "CUSTOMER_DELETION_REQUESTED",
            entityType: "CUSTOMER",
            entityId: customer.customerId,
            remarks: `Deletion requested by ${session.role} (${session.name}): ${reason || "No remarks"}. Pending Super Admin approval.`,
          },
        });

        return NextResponse.json({
          success: true,
          immediate: false,
          pendingApproval: true,
          message: `Deletion request submitted for Super Admin review. Customer account placed in PENDING DELETION.`,
          request: reqRecord,
        });
      }
    }

    if (action === "APPROVE_REGISTRATION") {
      updateData = {
        applicationStatus: "APPROVED",
        verificationStatus: "VERIFIED",
        membershipStatus: "ACTIVE",
        accountStatus: "ACTIVE",
        loanEligibilityStatus: "ELIGIBLE",
      };
    } else if (action === "REJECT_REGISTRATION") {
      updateData = {
        applicationStatus: "REJECTED",
        verificationStatus: "REJECTED",
        membershipStatus: "INACTIVE",
        accountStatus: "DEACTIVATED",
        loanEligibilityStatus: "INELIGIBLE",
      };
    } else if (action === "UPDATE_STATUS") {
      if (status) updateData.accountStatus = status;
    }

    const updatedCustomer = await prisma.$transaction(async (tx) => {
      const res = await tx.customer.update({
        where: { id: customer.id },
        data: updateData,
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          adminId: session.adminProfileId,
          adminRole: session.role,
          action: action || "CUSTOMER_UPDATE",
          entityType: "CUSTOMER",
          entityId: customer.customerId,
          previousValues: JSON.stringify(previousStatus),
          newValues: JSON.stringify(updateData),
          remarks: reason || `Customer ${action || "status updated"} by ${session.role}.`,
        },
      });

      // Customer Notification
      if (customer.userId) {
        await tx.notification.create({
          data: {
            userId: customer.userId,
            customerId: customer.id,
            title:
              action === "APPROVE_REGISTRATION"
                ? "Membership Approved!"
                : "Profile Status Update",
            message:
              action === "APPROVE_REGISTRATION"
                ? `Congratulations! Your membership under ID ${customer.customerId} is approved. You can now access all financial features.`
                : `Your account status has been updated to ${updateData.accountStatus || "UPDATED"}.`,
            type: action === "APPROVE_REGISTRATION" ? "SUCCESS" : "INFO",
          },
        });
      }

      return res;
    });

    return NextResponse.json({
      success: true,
      message: "Customer status successfully updated.",
      customer: updatedCustomer,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: { params: { id: string } }) {
  return handleCustomerUpdate(req, context);
}

export async function POST(req: Request, context: { params: { id: string } }) {
  return handleCustomerUpdate(req, context);
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
  return handleCustomerUpdate(req, context);
}
