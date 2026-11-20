import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: Fetch all deletion requests
export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";

    const where: any = {};
    if (status !== "ALL") {
      where.status = status;
    }

    const requests = await prisma.deletionRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Handle deletion requests and Super Admin approvals
export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { action, requestId, entityType, entityId, reason, reviewRemarks } = body;

    const isSuperAdmin = session.role === "SUPER_ADMIN";

    // 1. APPROVE DELETION REQUEST (Super Admin Only)
    if (action === "APPROVE_DELETION") {
      if (!isSuperAdmin) {
        return NextResponse.json(
          { error: "Access Denied: Only Super Admin can approve permanent deletions." },
          { status: 403 }
        );
      }

      if (!requestId) {
        return NextResponse.json({ error: "Request ID is required." }, { status: 400 });
      }

      const delReq = await prisma.deletionRequest.findUnique({
        where: { id: requestId },
      });

      if (!delReq) {
        return NextResponse.json({ error: "Deletion request not found." }, { status: 404 });
      }

      if (delReq.status !== "PENDING") {
        return NextResponse.json(
          { error: `Request has already been ${delReq.status.toLowerCase()}.` },
          { status: 400 }
        );
      }

      // Execute deletion
      if (delReq.entityType === "CUSTOMER") {
        await executeCustomerDelete(delReq.entityId, session, `Approved deletion request: ${delReq.reason}`);
      } else if (delReq.entityType === "EMPLOYEE") {
        await executeStaffDelete(delReq.entityId, session, `Approved deletion request: ${delReq.reason}`);
      }

      // Mark request approved
      const updatedReq = await prisma.deletionRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          reviewedById: session.adminProfileId,
          reviewedByRole: session.role,
          reviewedByName: session.name || "Super Admin",
          reviewRemarks: reviewRemarks || "Approved and permanently removed by Super Admin.",
          reviewedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `${delReq.entityType === "CUSTOMER" ? "Customer" : "Employee"} permanently deleted.`,
        request: updatedReq,
      });
    }

    // 2. REJECT DELETION REQUEST (Super Admin Only)
    if (action === "REJECT_DELETION") {
      if (!isSuperAdmin) {
        return NextResponse.json(
          { error: "Access Denied: Only Super Admin can reject deletion requests." },
          { status: 403 }
        );
      }

      if (!requestId) {
        return NextResponse.json({ error: "Request ID is required." }, { status: 400 });
      }

      const delReq = await prisma.deletionRequest.findUnique({
        where: { id: requestId },
      });

      if (!delReq) {
        return NextResponse.json({ error: "Deletion request not found." }, { status: 404 });
      }

      // Restore customer status if customer
      if (delReq.entityType === "CUSTOMER") {
        await prisma.customer.updateMany({
          where: { id: delReq.entityId, accountStatus: "PENDING_DELETION" },
          data: { accountStatus: "ACTIVE" },
        });
      }

      const updatedReq = await prisma.deletionRequest.update({
        where: { id: requestId },
        data: {
          status: "REJECTED",
          reviewedById: session.adminProfileId,
          reviewedByRole: session.role,
          reviewedByName: session.name || "Super Admin",
          reviewRemarks: reviewRemarks || "Deletion request rejected by Super Admin.",
          reviewedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Deletion request rejected. Entity restored to active status.",
        request: updatedReq,
      });
    }

    // 3. CREATE DELETION REQUEST OR DIRECT SUPER ADMIN DELETE
    if (action === "REQUEST_DELETION" || action === "DELETE") {
      if (!entityType || !entityId) {
        return NextResponse.json({ error: "Entity Type and Entity ID are required." }, { status: 400 });
      }

      // If SUPER ADMIN -> Direct Deletion without approval
      if (isSuperAdmin) {
        if (entityType === "CUSTOMER") {
          await executeCustomerDelete(entityId, session, reason || "Direct removal by Super Admin.");
        } else if (entityType === "EMPLOYEE") {
          await executeStaffDelete(entityId, session, reason || "Direct removal by Super Admin.");
        }

        // Clean any pending requests for this entity
        await prisma.deletionRequest.updateMany({
          where: { entityId, status: "PENDING" },
          data: {
            status: "APPROVED",
            reviewedById: session.adminProfileId,
            reviewedByRole: session.role,
            reviewedByName: session.name || "Super Admin",
            reviewRemarks: "Directly removed by Super Admin.",
            reviewedAt: new Date(),
          },
        });

        return NextResponse.json({
          success: true,
          immediate: true,
          message: `${entityType === "CUSTOMER" ? "Customer" : "Employee"} permanently removed by Super Admin without approval.`,
        });
      }

      // Non-Super Admin: Create pending deletion request
      let entityIdentifier = entityId;
      if (entityType === "CUSTOMER") {
        const cust = await prisma.customer.findFirst({
          where: { OR: [{ id: entityId }, { customerId: entityId }] },
        });
        if (!cust) return NextResponse.json({ error: "Customer not found." }, { status: 404 });
        entityIdentifier = `${cust.customerId} - ${cust.fullName}`;

        // Mark account as PENDING_DELETION
        await prisma.customer.update({
          where: { id: cust.id },
          data: { accountStatus: "PENDING_DELETION" },
        });
      } else if (entityType === "EMPLOYEE") {
        const emp = await prisma.adminProfile.findFirst({
          where: { OR: [{ id: entityId }, { adminCode: entityId }] },
        });
        if (!emp) return NextResponse.json({ error: "Employee not found." }, { status: 404 });
        entityIdentifier = `${emp.adminCode} - ${emp.fullName} (${emp.role})`;
      }

      const newReq = await prisma.deletionRequest.create({
        data: {
          entityType,
          entityId,
          entityIdentifier,
          reason: reason || "Staff requested permanent removal.",
          status: "PENDING",
          requestedById: session.adminProfileId || session.userId,
          requestedByRole: session.role || "STAFF",
          requestedByName: session.name || "Staff Member",
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          adminId: session.adminProfileId,
          adminRole: session.role,
          action: `${entityType}_DELETION_REQUESTED`,
          entityType,
          entityId,
          remarks: `Deletion requested by ${session.role} (${session.name}): ${reason || "No remarks"}`,
        },
      });

      return NextResponse.json({
        success: true,
        immediate: false,
        pendingApproval: true,
        message: `Deletion request submitted successfully. It will take effect once approved by Super Admin.`,
        request: newReq,
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Deletion error:", error);
    return NextResponse.json({ error: error.message || "Failed to process deletion." }, { status: 500 });
  }
}

// Helper: Permanent Customer Delete
async function executeCustomerDelete(customerIdOrId: string, session: any, remarks: string) {
  const customer = await prisma.customer.findFirst({
    where: {
      OR: [{ id: customerIdOrId }, { customerId: customerIdOrId }],
    },
    include: {
      loans: true,
      user: true,
    },
  });

  if (!customer) {
    throw new Error("Customer record not found.");
  }

  await prisma.$transaction(async (tx) => {
    // 1. Delete loan repayment schedules & payments for all loans of this customer
    const loanIds = customer.loans.map((l) => l.id);
    if (loanIds.length > 0) {
      await tx.repaymentSchedule.deleteMany({
        where: { loanId: { in: loanIds } },
      });
      await tx.payment.deleteMany({
        where: { loanId: { in: loanIds } },
      });
      await tx.loan.deleteMany({
        where: { id: { in: loanIds } },
      });
    }

    // 2. Delete payments directly linked to customer
    await tx.payment.deleteMany({
      where: { customerId: customer.id },
    });

    // 3. Delete loan applications
    await tx.loanApplication.deleteMany({
      where: { customerId: customer.id },
    });

    // 4. Delete notifications
    await tx.notification.deleteMany({
      where: { customerId: customer.id },
    });

    // 5. Delete Customer
    await tx.customer.delete({
      where: { id: customer.id },
    });

    // 6. Delete linked User account if exists
    if (customer.userId) {
      await tx.notification.deleteMany({
        where: { userId: customer.userId },
      });
      await tx.user.delete({
        where: { id: customer.userId },
      });
    }

    // 7. Record Audit Log
    await tx.auditLog.create({
      data: {
        adminId: session.adminProfileId,
        adminRole: session.role,
        action: "CUSTOMER_PERMANENT_DELETE",
        entityType: "CUSTOMER",
        entityId: customer.customerId,
        previousValues: JSON.stringify({
          customerId: customer.customerId,
          fullName: customer.fullName,
          phone: customer.phone,
          email: customer.email,
        }),
        remarks: `${remarks} Executed by ${session.role} (${session.name || "Super Admin"}).`,
      },
    });
  });
}

// Helper: Permanent Staff Delete
async function executeStaffDelete(staffIdOrCode: string, session: any, remarks: string) {
  const staff = await prisma.adminProfile.findFirst({
    where: {
      OR: [{ id: staffIdOrCode }, { adminCode: staffIdOrCode }],
    },
    include: {
      user: true,
    },
  });

  if (!staff) {
    throw new Error("Employee record not found.");
  }

  // Safety 1: Prevent deleting yourself
  if (session.adminProfileId === staff.id || session.userId === staff.userId) {
    throw new Error("Security Violation: You cannot delete your own administrative account.");
  }

  // Safety 2: Prevent deleting the last remaining Super Admin
  if (staff.role === "SUPER_ADMIN") {
    const superAdminCount = await prisma.adminProfile.count({
      where: { role: "SUPER_ADMIN" },
    });
    if (superAdminCount <= 1) {
      throw new Error("Security Violation: Cannot delete the only remaining Super Admin account.");
    }
  }

  await prisma.$transaction(async (tx) => {
    // 1. Delete AdminProfile
    await tx.adminProfile.delete({
      where: { id: staff.id },
    });

    // 2. Delete linked User account
    if (staff.userId) {
      await tx.user.delete({
        where: { id: staff.userId },
      });
    }

    // 3. Record Audit Log
    await tx.auditLog.create({
      data: {
        adminId: session.adminProfileId,
        adminRole: session.role,
        action: "STAFF_PERMANENT_DELETE",
        entityType: "ADMIN",
        entityId: staff.adminCode,
        previousValues: JSON.stringify({
          adminCode: staff.adminCode,
          fullName: staff.fullName,
          role: staff.role,
          phone: staff.phone,
          email: staff.email,
        }),
        remarks: `${remarks} Executed by ${session.role} (${session.name || "Super Admin"}).`,
      },
    });
  });
}
