import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.userType !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const staff = await prisma.adminProfile.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        branch: true,
      },
    });

    return NextResponse.json(staff);
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

    // Only Super Admin can create employee accounts
    if (session.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Access Denied: Only Super Admin can create and assign staff accounts." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { fullName, email, phone, role, dob, age, branchId, password } = body;

    if (!fullName || !phone || !email || !password || !role) {
      return NextResponse.json(
        { error: "Full Name, Email, Phone, Role, and Password are required." },
        { status: 400 }
      );
    }

    // Password validation: minimum 6 characters and at least one symbol
    const symbolRegex = /[!@#$%^&*(),.?":{}|<>_\-]/;
    if (password.length < 6 || !symbolRegex.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 6 characters long and contain at least one special symbol (!@#$%^&* etc.).",
        },
        { status: 400 }
      );
    }

    // Check unique email and phone
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A staff account with this email or phone number already exists." },
        { status: 400 }
      );
    }

    // Generate unique employee code
    const count = await prisma.adminProfile.count();
    const adminCode = `AFS-EMP-${1001 + count}`;

    const passwordHash = await hashPassword(password);

    // Calculate age if DOB provided
    let calculatedAge = age ? Number(age) : null;
    if (dob && !calculatedAge) {
      const birthYear = new Date(dob).getFullYear();
      calculatedAge = new Date().getFullYear() - birthYear;
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          phone,
          passwordHash,
          userType: "ADMIN",
          isActive: true,
        },
      });

      const profile = await tx.adminProfile.create({
        data: {
          userId: user.id,
          adminCode,
          fullName,
          role,
          phone,
          email,
          dob: dob || null,
          age: calculatedAge,
          branchId: branchId || null,
        },
        include: { branch: true },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          adminId: session.adminProfileId,
          adminRole: session.role,
          action: "STAFF_CREATE",
          entityType: "ADMIN",
          entityId: adminCode,
          newValues: JSON.stringify({ fullName, role, adminCode, email, phone }),
          remarks: `Super Admin created staff profile for ${fullName} with code ${adminCode} and role ${role}.`,
        },
      });

      return profile;
    });

    return NextResponse.json({
      success: true,
      message: `Staff member ${result.fullName} successfully registered with Code ${result.adminCode}.`,
      staff: result,
    });
  } catch (error: any) {
    console.error("Staff creation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
