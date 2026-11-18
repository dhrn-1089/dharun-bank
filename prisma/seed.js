const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Annapurna Future Financial Services (AFS) database with exact AP branches...");

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.repaymentSchedule.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.loanApplication.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();

  // 1. Create Branches with user's official AP addresses
  const hqBranch = await prisma.branch.create({
    data: {
      code: "AFS-HQ-VKOTA",
      name: "V.KOTA Head Office (Main Branch)",
      city: "V.KOTA",
      state: "Andhra Pradesh",
      address: "2/843, Nayakaneri Road, Durganagar, Near MDO. Office, V.KOTA, Chittoor District, Andhra Pradesh - 517 424",
      phone: "+91 8579 245 678",
    },
  });

  const palamaneruBranch = await prisma.branch.create({
    data: {
      code: "AFS-BR-PALAM",
      name: "Palamaneru Branch Office",
      city: "Palamaneru",
      state: "Andhra Pradesh",
      address: "D.No. 4-128, Main Bazaar Road, Near RTC Bus Stand, Palamaneru, Chittoor District, Andhra Pradesh - 517 408",
      phone: "+91 8579 251 234",
    },
  });

  const thavanampalliBranch = await prisma.branch.create({
    data: {
      code: "AFS-BR-THAVAN",
      name: "Thavanampalli Branch Office",
      city: "Thavanampalli",
      state: "Andhra Pradesh",
      address: "Door No. 1-89, Kanipakam Main Road, Thavanampalli, Chittoor District, Andhra Pradesh - 517 127",
      phone: "+91 8572 278 910",
    },
  });

  console.log("AP Branches created successfully.");

  // Password hashes (with symbol included: 'Admin@123' and 'Member@123')
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const customerPasswordHash = await bcrypt.hash("Member@123", 10);

  // 2. Create Super Admin
  const superAdminUser = await prisma.user.create({
    data: {
      email: "superadmin@afs.com",
      phone: "9999900001",
      passwordHash: adminPasswordHash,
      userType: "ADMIN",
      isActive: true,
      adminProfile: {
        create: {
          adminCode: "AFS-EMP-1001",
          fullName: "Dharun Kumar",
          role: "SUPER_ADMIN",
          phone: "9999900001",
          email: "superadmin@afs.com",
          dob: "1994-06-15",
          age: 32,
          branchId: hqBranch.id,
        },
      },
    },
    include: { adminProfile: true },
  });

  // 3. Create Loan Officer
  const loanOfficerUser = await prisma.user.create({
    data: {
      email: "officer@afs.com",
      phone: "9999900002",
      passwordHash: adminPasswordHash,
      userType: "ADMIN",
      isActive: true,
      adminProfile: {
        create: {
          adminCode: "AFS-EMP-1002",
          fullName: "K. Venkatesh",
          role: "LOAN_OFFICER",
          phone: "9999900002",
          email: "officer@afs.com",
          dob: "1991-03-22",
          age: 35,
          branchId: palamaneruBranch.id,
        },
      },
    },
    include: { adminProfile: true },
  });

  // 4. Create Accountant
  const accountantUser = await prisma.user.create({
    data: {
      email: "accountant@afs.com",
      phone: "9999900003",
      passwordHash: adminPasswordHash,
      userType: "ADMIN",
      isActive: true,
      adminProfile: {
        create: {
          adminCode: "AFS-EMP-1003",
          fullName: "M. Meenakshi",
          role: "ACCOUNTANT",
          phone: "9999900003",
          email: "accountant@afs.com",
          dob: "1993-08-10",
          age: 33,
          branchId: hqBranch.id,
        },
      },
    },
    include: { adminProfile: true },
  });

  // 5. Create Collection Officer
  const collectionOfficerUser = await prisma.user.create({
    data: {
      email: "collector@afs.com",
      phone: "9999900004",
      passwordHash: adminPasswordHash,
      userType: "ADMIN",
      isActive: true,
      adminProfile: {
        create: {
          adminCode: "AFS-EMP-1004",
          fullName: "R. Karthik",
          role: "COLLECTION_OFFICER",
          phone: "9999900004",
          email: "collector@afs.com",
          dob: "1996-11-05",
          age: 30,
          branchId: thavanampalliBranch.id,
        },
      },
    },
    include: { adminProfile: true },
  });

  // 6. Create Auditor
  const auditorUser = await prisma.user.create({
    data: {
      email: "auditor@afs.com",
      phone: "9999900005",
      passwordHash: adminPasswordHash,
      userType: "ADMIN",
      isActive: true,
      adminProfile: {
        create: {
          adminCode: "AFS-EMP-1005",
          fullName: "S. Balasubramanian, FCA",
          role: "AUDITOR",
          phone: "9999900005",
          email: "auditor@afs.com",
          dob: "1980-01-14",
          age: 46,
          branchId: hqBranch.id,
        },
      },
    },
    include: { adminProfile: true },
  });

  console.log("Admin accounts created with employee codes.");

  // 7. Create Customers
  // Customer 1: Rajesh Kumar
  const userRajesh = await prisma.user.create({
    data: {
      email: "rajesh@gmail.com",
      phone: "9876543210",
      passwordHash: customerPasswordHash,
      userType: "CUSTOMER",
      isActive: true,
    },
  });

  const rajesh = await prisma.customer.create({
    data: {
      customerId: "AFS10001",
      userId: userRajesh.id,
      fullName: "Rajesh Kumar",
      phone: "9876543210",
      email: "rajesh@gmail.com",
      dob: "1988-04-15",
      gender: "Male",
      address: "Near Old Bus Stand, Durganagar",
      city: "V.KOTA",
      state: "Andhra Pradesh",
      pincode: "517424",
      panNumber: "ABCDE1234F",
      aadhaarMasked: "XXXXXXXX4321",
      applicationStatus: "APPROVED",
      verificationStatus: "VERIFIED",
      membershipStatus: "ACTIVE",
      accountStatus: "ACTIVE",
      loanEligibilityStatus: "ELIGIBLE",
      branchId: hqBranch.id,
      createdByAdminId: superAdminUser.adminProfile.id,
    },
  });

  // Customer 2: Priya Devi
  const userPriya = await prisma.user.create({
    data: {
      email: "priya@gmail.com",
      phone: "9876543211",
      passwordHash: customerPasswordHash,
      userType: "CUSTOMER",
      isActive: true,
    },
  });

  const priya = await prisma.customer.create({
    data: {
      customerId: "AFS10002",
      userId: userPriya.id,
      fullName: "Priya Devi",
      phone: "9876543211",
      email: "priya@gmail.com",
      dob: "1992-08-22",
      gender: "Female",
      address: "Bypass Road, Palamaneru",
      city: "Palamaneru",
      state: "Andhra Pradesh",
      pincode: "517408",
      panNumber: "PQRST5678K",
      aadhaarMasked: "XXXXXXXX8765",
      applicationStatus: "APPROVED",
      verificationStatus: "VERIFIED",
      membershipStatus: "ACTIVE",
      accountStatus: "ACTIVE",
      loanEligibilityStatus: "ELIGIBLE",
      branchId: palamaneruBranch.id,
      createdByAdminId: loanOfficerUser.adminProfile.id,
    },
  });

  // 8. Create Loan for Rajesh Kumar
  const loan1 = await prisma.loan.create({
    data: {
      loanId: "AFS-LN-2026-001",
      customerId: rajesh.id,
      branchId: hqBranch.id,
      loanType: "PERSONAL",
      principalAmount: 100000,
      annualInterestRate: 12.0,
      interestType: "REDUCING_BALANCE",
      tenureMonths: 18,
      monthlyEmi: 6098,
      totalInterest: 9764,
      totalRepaymentAmount: 109764,
      amountDisbursed: 100000,
      amountRepaid: 30490,
      outstandingBalance: 79274,
      startDate: new Date("2026-06-05"),
      endDate: new Date("2027-12-05"),
      emiDueDay: 5,
      status: "ACTIVE",
      createdByAdminId: loanOfficerUser.adminProfile.id,
      approvedByAdminId: superAdminUser.adminProfile.id,
      disbursedByAdminId: accountantUser.adminProfile.id,
      approvalDate: new Date("2026-06-03"),
      disbursementDate: new Date("2026-06-05"),
      remarks: "Personal member loan approved under Nidhi guidelines.",
    },
  });

  // Amortization Schedule
  const months = [
    { num: 1, name: "July 2026", date: "2026-07-05", status: "PAID", paid: 6098, rem: 0 },
    { num: 2, name: "August 2026", date: "2026-08-05", status: "PAID", paid: 6098, rem: 0 },
    { num: 3, name: "September 2026", date: "2026-09-05", status: "PAID", paid: 6098, rem: 0 },
    { num: 4, name: "October 2026", date: "2026-10-05", status: "PAID", paid: 6098, rem: 0 },
    { num: 5, name: "November 2026", date: "2026-11-05", status: "PAID", paid: 6098, rem: 0 },
    { num: 6, name: "December 2026", date: "2026-12-05", status: "UPCOMING", paid: 0, rem: 6098 },
    { num: 7, name: "January 2027", date: "2027-01-05", status: "UPCOMING", paid: 0, rem: 6098 },
    { num: 8, name: "February 2027", date: "2027-02-05", status: "UPCOMING", paid: 0, rem: 6098 },
  ];

  for (const m of months) {
    await prisma.repaymentSchedule.create({
      data: {
        loanId: loan1.id,
        installmentNumber: m.num,
        monthName: m.name,
        dueDate: new Date(m.date),
        emiAmount: 6098,
        principalComponent: 5098,
        interestComponent: 1000,
        paidAmount: m.paid,
        remainingAmount: m.rem,
        status: m.status,
        paidDate: m.status === "PAID" ? new Date(m.date) : null,
      },
    });
  }

  // Payments
  const paymentsRajesh = [
    { tx: "AFS-TXN-10001", rec: "AFS-REC-10001", date: "2026-07-05", mode: "BANK_TRANSFER" },
    { tx: "AFS-TXN-10002", rec: "AFS-REC-10002", date: "2026-08-05", mode: "UPI" },
    { tx: "AFS-TXN-10003", rec: "AFS-REC-10003", date: "2026-09-05", mode: "UPI" },
    { tx: "AFS-TXN-10004", rec: "AFS-REC-10004", date: "2026-10-05", mode: "CASH" },
    { tx: "AFS-TXN-10005", rec: "AFS-REC-10005", date: "2026-11-05", mode: "BANK_TRANSFER" },
  ];

  for (const p of paymentsRajesh) {
    await prisma.payment.create({
      data: {
        transactionId: p.tx,
        receiptNumber: p.rec,
        loanId: loan1.id,
        customerId: rajesh.id,
        amount: 6098,
        paymentDate: new Date(p.date),
        paymentMethod: p.mode,
        paymentType: "EMI",
        status: "SUCCESS",
        referenceNumber: `REF-${p.tx}`,
        remarks: "Monthly EMI repayment received and reconciled.",
        recordedByAdminId: accountantUser.adminProfile.id,
      },
    });
  }

  // Audit Log
  await prisma.auditLog.create({
    data: {
      adminId: superAdminUser.adminProfile.id,
      adminRole: "SUPER_ADMIN",
      action: "SYSTEM_INITIALIZE",
      entityType: "SYSTEM",
      entityId: "AFS-HQ-VKOTA",
      remarks: "Headquarters set to V.KOTA, Chittoor District, Andhra Pradesh. Initial staff registered.",
    },
  });

  console.log("Database seeded successfully with exact AP branches and staff!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
