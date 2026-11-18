import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const status = searchParams.get("status") || "ALL";

    const where: any = {};

    if (query) {
      where.OR = [
        { fullName: { contains: query } },
        { customerId: { contains: query } },
        { phone: { contains: query } },
        { email: { contains: query } },
      ];
    }

    if (status !== "ALL") {
      where.accountStatus = status;
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        branch: true,
        createdByAdmin: true,
        loans: {
          select: {
            principalAmount: true,
            outstandingBalance: true,
            status: true,
          },
        },
      },
    });

    // Format for customer table with total loans & outstanding
    const formatted = customers.map((c) => {
      let totalLoan = 0;
      let totalOutstanding = 0;
      c.loans.forEach((l) => {
        if (l.status === "ACTIVE" || l.status === "APPROVED") {
          totalLoan += l.principalAmount;
          totalOutstanding += l.outstandingBalance;
        }
      });

      return {
        id: c.id,
        customerId: c.customerId,
        fullName: c.fullName,
        phone: c.phone,
        email: c.email,
        city: c.city,
        state: c.state,
        membershipStatus: c.membershipStatus,
        verificationStatus: c.verificationStatus,
        accountStatus: c.accountStatus,
        totalLoan,
        outstanding: totalOutstanding,
        branch: c.branch?.name || "Chennai HQ",
        createdAt: c.createdAt,
        createdBy: c.createdByAdmin?.fullName || "Self-Registered",
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Method 2: Admin-created accounts
export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      fullName,
      phone,
      email,
      dob,
      gender,
      address,
      city,
      state,
      pincode,
      panNumber,
      aadhaarMasked,
      branchId,
      initialPassword = "customer123",
      membershipStatus = "ACTIVE",
      accountStatus = "ACTIVE",
    } = body;

    if (!fullName || !phone) {
      return NextResponse.json({ error: "Name and Phone are mandatory." }, { status: 400 });
    }

    // Uniqueness check
    const existing = await prisma.customer.findFirst({
      where: {
        OR: [{ phone }, ...(email ? [{ email }] : [])],
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A customer with this phone number or email already exists in the system." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(initialPassword);

    // Generate next Customer ID
    const totalCount = await prisma.customer.count();
    const customerId = `AFS${10001 + totalCount}`;

    const defaultBranch = branchId
      ? { id: branchId }
      : await prisma.branch.findFirst({ where: { code: "AFS-HQ-01" } });

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          phone,
          email: email || null,
          passwordHash,
          userType: "CUSTOMER",
          isActive: true,
        },
      });

      const customer = await tx.customer.create({
        data: {
          customerId,
          userId: user.id,
          fullName,
          phone,
          email: email || null,
          dob: dob || null,
          gender: gender || "Male",
          address: address || "N/A",
          city: city || "Chennai",
          state: state || "Tamil Nadu",
          pincode: pincode || "600001",
          panNumber: panNumber ? panNumber.toUpperCase() : null,
          aadhaarMasked: aadhaarMasked || null,
          applicationStatus: "APPROVED",
          verificationStatus: "VERIFIED",
          membershipStatus,
          accountStatus,
          loanEligibilityStatus: "ELIGIBLE",
          branchId: defaultBranch?.id || null,
          createdByAdminId: session.adminProfileId || null,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          adminId: session.adminProfileId,
          adminRole: session.role,
          action: "CUSTOMER_CREATE_MANUAL",
          entityType: "CUSTOMER",
          entityId: customer.customerId,
          remarks: `Administrator created customer record for ${fullName} (${customerId}).`,
        },
      });

      return customer;
    });

    return NextResponse.json({
      success: true,
      message: "Customer record created and activated successfully.",
      customer: result,
    });
  } catch (error: any) {
    console.error("Admin customer create error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
