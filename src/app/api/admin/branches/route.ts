import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: { customers: true, loans: true, admins: true },
        },
      },
    });

    return NextResponse.json(branches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === "UPDATE_BRANCH" || body.id) {
      return handleBranchUpdate(session, body);
    }

    const { name, code, city, state, address, phone } = body;

    if (!name || !address || !city) {
      return NextResponse.json(
        { error: "Branch Name, City, and Address are required." },
        { status: 400 }
      );
    }

    const branchCount = await prisma.branch.count();
    const branchCode = code || `AFS-BR-${String(branchCount + 1).padStart(2, "0")}`;

    const branch = await prisma.branch.create({
      data: {
        code: branchCode.toUpperCase(),
        name,
        city,
        state: state || "Andhra Pradesh",
        address,
        phone: phone || "+91 8579 000 000",
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        adminId: session.adminProfileId,
        adminRole: session.role,
        action: "BRANCH_CREATE",
        entityType: "BRANCH",
        entityId: branch.code,
        remarks: `Branch ${branch.name} (${branch.code}) added at ${branch.city}.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Branch ${branch.name} added successfully.`,
      branch,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleBranchUpdate(session: any, body: any) {
  const { id, name, address, city, state, phone } = body;

  if (!id) {
    return NextResponse.json({ error: "Branch ID is required." }, { status: 400 });
  }

  const updated = await prisma.branch.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(address && { address }),
      ...(city && { city }),
      ...(state && { state }),
      ...(phone && { phone }),
    },
  });

  // Audit Log
  await prisma.auditLog.create({
    data: {
      adminId: session.adminProfileId,
      adminRole: session.role,
      action: "BRANCH_UPDATE",
      entityType: "BRANCH",
      entityId: updated.code,
      remarks: `Branch ${updated.name} address updated to: ${updated.address}.`,
    },
  });

  return NextResponse.json({
    success: true,
    message: `Branch ${updated.name} updated successfully.`,
    branch: updated,
  });
}

export async function PATCH(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    return handleBranchUpdate(session, body);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
