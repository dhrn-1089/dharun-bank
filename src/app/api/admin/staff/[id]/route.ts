import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const staff = await prisma.adminProfile.findFirst({
      where: {
        OR: [{ id: params.id }, { adminCode: params.id }],
      },
      include: {
        branch: true,
        user: true,
      },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
    }

    return NextResponse.json(staff);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleStaffDeletion(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    if (!session || session.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { reason } = body;

    const staff = await prisma.adminProfile.findFirst({
      where: {
        OR: [{ id: params.id }, { adminCode: params.id }],
      },
      include: {
        user: true,
      },
    });

    if (!staff) {
      return NextResponse.json({ error: "Employee record not found." }, { status: 404 });
    }

    const isSuperAdmin = session.role === "SUPER_ADMIN";

    // 1. DIRECT SUPER ADMIN DELETE
    if (isSuperAdmin) {
      // Safety 1: Cannot delete own account
      if (session.adminProfileId === staff.id || session.userId === staff.userId) {
        return NextResponse.json(
          { error: "Security Violation: You cannot delete your own administrative account." },
          { status: 400 }
        );
      }

      // Safety 2: Cannot delete the only remaining Super Admin
      if (staff.role === "SUPER_ADMIN") {
        const count = await prisma.adminProfile.count({
          where: { role: "SUPER_ADMIN" },
        });
        if (count <= 1) {
          return NextResponse.json(
            { error: "Security Violation: Cannot delete the only remaining Super Admin account." },
            { status: 400 }
          );
        }
      }

      await prisma.$transaction(async (tx) => {
        // Delete Admin Profile
        await tx.adminProfile.delete({
          where: { id: staff.id },
        });

        // Delete linked user
        if (staff.userId) {
          await tx.user.delete({
            where: { id: staff.userId },
          });
        }

        // Clean any pending deletion requests
        await tx.deletionRequest.updateMany({
          where: { entityId: staff.id, status: "PENDING" },
          data: {
            status: "APPROVED",
            reviewedById: session.adminProfileId,
            reviewedByRole: session.role,
            reviewedByName: session.name || "Super Admin",
            reviewRemarks: "Directly removed by Super Admin.",
            reviewedAt: new Date(),
          },
        });

        // Audit Log
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
            remarks: `Employee ${staff.fullName} (${staff.adminCode}) permanently removed by Super Admin. Reason: ${reason || "None specified"}.`,
          },
        });
      });

      return NextResponse.json({
        success: true,
        immediate: true,
        message: `Employee ${staff.fullName} (${staff.adminCode}) permanently removed by Super Admin.`,
      });
    }

    // 2. NON-SUPER ADMIN: Create Deletion Request for Super Admin Approval
    const reqRecord = await prisma.deletionRequest.create({
      data: {
        entityType: "EMPLOYEE",
        entityId: staff.id,
        entityIdentifier: `${staff.adminCode} - ${staff.fullName} (${staff.role})`,
        reason: reason || "Staff requested employee removal.",
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
        action: "STAFF_DELETION_REQUESTED",
        entityType: "ADMIN",
        entityId: staff.adminCode,
        remarks: `Employee deletion requested by ${session.role} (${session.name}): ${reason || "No remarks"}. Pending Super Admin approval.`,
      },
    });

    return NextResponse.json({
      success: true,
      immediate: false,
      pendingApproval: true,
      message: `Employee deletion request submitted for Super Admin review. It will take effect once approved.`,
      request: reqRecord,
    });
  } catch (error: any) {
    console.error("Staff deletion error:", error);
    return NextResponse.json({ error: error.message || "Failed to process staff deletion." }, { status: 500 });
  }
}

export async function POST(req: Request, context: { params: { id: string } }) {
  return handleStaffDeletion(req, context);
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
  return handleStaffDeletion(req, context);
}
