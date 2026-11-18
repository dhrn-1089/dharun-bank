import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, phone } = body;

    if (!email) {
      return NextResponse.json({ error: "Google email is required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: { email: cleanEmail },
      include: { customer: true, adminProfile: true },
    });

    if (!user) {
      // Automatic customer sign-up from Google Mail
      const randomPass = await hashPassword(`Google@${Date.now()}`);
      const count = await prisma.customer.count();
      const customerId = `AFS${10001 + count}`;
      const defaultPhone = phone || `98${Math.floor(10000000 + Math.random() * 90000000)}`;

      // Default branch (V.KOTA Head Office)
      const hqBranch = await prisma.branch.findFirst({
        where: { code: "AFS-HQ-VKOTA" },
      });

      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          phone: defaultPhone,
          passwordHash: randomPass,
          userType: "CUSTOMER",
          isActive: true,
          customer: {
            create: {
              customerId,
              fullName: name || cleanEmail.split("@")[0].replace(".", " "),
              email: cleanEmail,
              phone: defaultPhone,
              address: "Registered via Google Auth",
              city: "V.KOTA",
              state: "Andhra Pradesh",
              pincode: "517424",
              applicationStatus: "APPROVED",
              verificationStatus: "VERIFIED",
              membershipStatus: "ACTIVE",
              accountStatus: "ACTIVE",
              loanEligibilityStatus: "ELIGIBLE",
              branchId: hqBranch?.id || null,
            },
          },
        },
        include: { customer: true, adminProfile: true },
      });

      // Welcome Notification
      if (user.customer) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            customerId: user.customer.id,
            title: "Welcome to AFS Nidhi Platform",
            message: `Your Google account has been verified. Your permanent Member ID is ${customerId}.`,
            type: "SUCCESS",
          },
        });
      }
    }

    if (user.userType === "CUSTOMER" && user.customer?.accountStatus === "SUSPENDED") {
      return NextResponse.json(
        { error: "Your member account has been suspended. Please contact your branch." },
        { status: 403 }
      );
    }

    // Sign Token
    const token = signToken({
      userId: user.id,
      userType: user.userType as "CUSTOMER" | "ADMIN",
      role: user.adminProfile?.role,
      customerId: user.customer?.customerId,
      adminProfileId: user.adminProfile?.id,
      branchId: user.adminProfile?.branchId || user.customer?.branchId,
      email: user.email,
      phone: user.phone,
    });

    const response = NextResponse.json({
      success: true,
      message: "Google authentication successful.",
      name: user.customer?.fullName || user.email,
      customerId: user.customer?.customerId,
      redirect: user.userType === "ADMIN" ? "/admin/dashboard" : "/dashboard",
    });

    response.cookies.set("afs_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { error: error.message || "Google sign-in failed." },
      { status: 500 }
    );
  }
}
