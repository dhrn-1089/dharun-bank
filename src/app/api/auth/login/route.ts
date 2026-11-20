import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password, expectedType } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Phone/Email/Employee Code and Password are required." },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();

    // Find user by phone, email, or adminCode
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ phone: cleanIdentifier }, { email: cleanIdentifier }],
      },
      include: {
        customer: true,
        adminProfile: true,
      },
    });

    // If not found, check if it's an admin code (e.g. AFS-EMP-1001)
    if (!user) {
      const adminProfile = await prisma.adminProfile.findUnique({
        where: { adminCode: cleanIdentifier.toUpperCase() },
        include: { user: true },
      });
      if (adminProfile) {
        user = await prisma.user.findUnique({
          where: { id: adminProfile.userId },
          include: { customer: true, adminProfile: true },
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your phone, email, or employee code." },
        { status: 401 }
      );
    }

    // Verify Password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid password. Please try again." },
        { status: 401 }
      );
    }

    // Check userType matches portal
    if (expectedType && user.userType !== expectedType) {
      return NextResponse.json(
        {
          error:
            expectedType === "ADMIN"
              ? "Access denied. This portal is strictly for authorized AFS administration staff."
              : "Please login through the Admin Portal.",
        },
        { status: 403 }
      );
    }

    // If Customer, check account status
    if (user.userType === "CUSTOMER" && user.customer) {
      if (user.customer.accountStatus === "PENDING_APPROVAL") {
        return NextResponse.json(
          {
            error:
              "Your membership registration is currently UNDER REVIEW by AFS verification officers. You will be able to access the portal once approved.",
            status: "PENDING_APPROVAL",
          },
          { status: 403 }
        );
      }
      if (user.customer.accountStatus === "SUSPENDED" || user.customer.accountStatus === "DEACTIVATED") {
        return NextResponse.json(
          {
            error: "Your member account has been suspended or deactivated. Please contact your local branch.",
          },
          { status: 403 }
        );
      }
    }

    // Sign JWT Token
    const token = signToken({
      userId: user.id,
      userType: user.userType as "CUSTOMER" | "ADMIN",
      role: user.adminProfile?.role,
      customerId: user.customer?.customerId,
      adminProfileId: user.adminProfile?.id,
      branchId: user.adminProfile?.branchId || user.customer?.branchId,
      email: user.email,
      phone: user.phone,
      name: user.customer?.fullName || user.adminProfile?.fullName || "User",
    });

    const response = NextResponse.json({
      success: true,
      userType: user.userType,
      role: user.adminProfile?.role || null,
      name: user.customer?.fullName || user.adminProfile?.fullName || "User",
      customerId: user.customer?.customerId || null,
      adminCode: user.adminProfile?.adminCode || null,
    });

    // Set cookie: secure=false so mobile phones accessing over HTTP LAN work seamlessly
    response.cookies.set("afs_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication failed." },
      { status: 500 }
    );
  }
}
