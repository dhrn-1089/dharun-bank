import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
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
      aadhaarNumber,
      password,
    } = body;

    if (!fullName || !phone || !password) {
      return NextResponse.json(
        { error: "Full Name, Phone number, and Password are required." },
        { status: 400 }
      );
    }

    // Check duplicate phone
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });
    if (existingPhone) {
      return NextResponse.json(
        { error: "A member account with this mobile number already exists." },
        { status: 400 }
      );
    }

    // Check duplicate email if provided
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: "A member account with this email address already exists." },
          { status: 400 }
        );
      }
    }

    // Generate unique Customer ID
    const count = await prisma.customer.count();
    const customerId = `AFS${10001 + count}`;

    // Hash password
    const passwordHash = await hashPassword(password);

    // Mask Aadhaar (show last 4 only)
    const aadhaarMasked = aadhaarNumber
      ? `XXXXXXXX${aadhaarNumber.slice(-4)}`
      : null;

    // Get default branch (HQ)
    const defaultBranch = await prisma.branch.findFirst({
      where: { code: "AFS-HQ-01" },
    });

    // Create User & Customer in a transaction
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
          gender: gender || null,
          address: address || "Not provided",
          city: city || "Chennai",
          state: state || "Tamil Nadu",
          pincode: pincode || "600001",
          panNumber: panNumber ? panNumber.toUpperCase() : null,
          aadhaarMasked,
          applicationStatus: "PENDING",
          verificationStatus: "PENDING",
          membershipStatus: "APPLIED",
          accountStatus: "PENDING_APPROVAL", // Protected: awaiting admin approval
          loanEligibilityStatus: "UNDER_REVIEW",
          branchId: defaultBranch?.id || null,
        },
      });

      // Welcome Notification
      await tx.notification.create({
        data: {
          userId: user.id,
          customerId: customer.id,
          title: "Membership Application Received",
          message: `Welcome to AFS! Your application reference is ${customerId}. Our verification officer will review your documents for membership approval.`,
          type: "INFO",
        },
      });

      return { user, customer };
    });

    return NextResponse.json({
      success: true,
      message: "Membership registration submitted successfully.",
      customerId: result.customer.customerId,
      applicationStatus: result.customer.applicationStatus,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit registration." },
      { status: 500 }
    );
  }
}
