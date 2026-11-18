# ANNAPURNA FUTURE FINANCIAL SERVICES (AFS)
## Enterprise Financial Services, Customer Management & Loan Servicing Platform

**Company Name:** Annapurna Future Financial Services Nidhi Limited  
**Short Name:** AFS  
**Business Type:** Nidhi Limited (Member-based financial services governed under Section 406 of Companies Act, 2013)  
**Country:** India  
**Currency:** Indian Rupee (₹)  
**Primary Branding:** Navy Blue (`#082B67`), Secondary Blue (`#123F85`), Gold (`#E6A500`), White (`#FFFFFF`)  
**Head Office:** `2/843, Nayakaneri Road, Durganagar, Near MDO Office, V.KOTA, Chittoor District, Andhra Pradesh - 517 424`  
**Operational Branches:** Palamaneru Branch Office & Thavanampalli Branch Office, Andhra Pradesh  
**Lead Engineer & Architect:** Designed & Engineered by Dharun — Technical Cybersecurity Expert & Lead Developer

---

## 🏛️ System Architecture Overview

The platform is built using a modern fullstack architecture:
- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS with AFS institutional color palette and responsive mobile viewports
- **Database & ORM:** SQLite / PostgreSQL with Prisma ORM
- **Authentication:** Secure session tokens with HTTP-only cookies, bcryptjs password hashing, and Google Mail instant onboarding
- **Financial Calculation Engine:** Validated reducing balance and flat EMI calculation engine with dynamic amortization schedule generation
- **Document Generation:** Official printable payment receipts and member loan statements
- **Role-Based Access Control (RBAC):** Super Admin, Loan Officer, Accountant, Collection Officer, Auditor, and Member roles

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/dhrn-1089/dharun-bank.git
cd dharun-bank
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Setup Database & Seed Initial Records
```bash
npx prisma db push
node prisma/seed.js
```

### 4. Run Development Server
```bash
npm run dev
# Accessible at http://localhost:3000 or on your local network
```

### 5. Production Build & Start
```bash
npm run build
npm start
```

---

## 👥 Pre-Configured Test Accounts

### A. Staff & Multi-Admin RBAC Accounts (`/admin/login`)
*Supports login using **Employee Code**, **Email**, or **Phone Number**.*

| Role | Employee Code | Email | Password | Access & Responsibilities |
|---|---|---|---|---|
| **Super Admin** | `AFS-EMP-1001` | `superadmin@afs.com` | `Admin@123` | Full system administration, staff creation, Maker-Checker overrides, branch address management |
| **Loan Officer** | `AFS-EMP-1002` | `officer@afs.com` | `Admin@123` | Member onboarding, loan proposal drafting (Maker) |
| **Accountant** | `AFS-EMP-1003` | `accountant@afs.com` | `Admin@123` | Payment recording, ledger reconciliation, balance adjustments |
| **Collection Officer** | `AFS-EMP-1004` | `collector@afs.com` | `Admin@123` | Counter & offline EMI collections, receipt issuance |
| **Auditor** | `AFS-EMP-1005` | `auditor@afs.com` | `Admin@123` | Strict read-only access to transactions, schedules, and audit trails |

### B. Customer / Member Accounts (`/login`)
| Customer ID | Name | Mobile Number | Password | Status |
|---|---|---|---|---|
| **AFS10001** | Rajesh Kumar | `9876543210` | `Member@123` | Active Member with Personal Loan (₹1,00,000) |
| **AFS10002** | Priya Devi | `9876543211` | `Member@123` | Active Member with Gold Loan (₹50,000) |
| **Google Sign-In** | Any User | Any `@gmail.com` | Instant Onboard | Auto-assigned unique Customer ID with fast login |

---

## 🌟 Core Features & Modules

### 1. Institutional Public Portal (`/`)
- Brand header showcasing the official AFS company logo
- Hero section: *"Building Financial Confidence. Securing Your Future."*
- Statutory 9-part presentation:
  1. About Annapurna Future Financial Services Nidhi Limited
  2. Financial Offerings (Gold loans, property loans, micro-enterprise credit)
  3. Interactive Live EMI Calculator (Reducing balance vs Flat interest)
  4. Security & Assurance (Bank-grade gold storage, transparent fee structure)
  5. 4-Stage Maker-Checker Loan Approval Workflow
  6. Financial Transparency & Statutory Nidhi Compliance
  7. Frequently Asked Questions (Interactive Accordion)
  8. Branch Network & Head Office (V.KOTA HQ, Palamaneru, Thavanampalli)
  9. Statutory legal disclosures under Section 406 of the Companies Act, 2013

### 2. Smart User Experience & Security
- **Dynamic Time Greetings:** Personal greeting on dashboards ("Good Morning / Afternoon / Evening, {Name}!") with time-aware sun/moon animations.
- **Strong Password Policy:** Strict enforcement of $\ge 6$ characters with required special symbols (`[!@#$%^&*(),.?":{}|<>\-_]`).
- **Google Mail Fast Onboarding:** Native integration supporting instant `@gmail.com` authentication and customer ID generation.
- **Cybersecurity & Engineering Signature:** Embedded institutional security credit: *"Designed & Engineered by Dharun — Technical Cybersecurity Expert & Lead Developer"*.

### 3. Super Admin & Staff Management (`/admin/staff` & `/admin/profile`)
- **Add Employee Modal:** Super Admin can onboard new staff by assigning roles (Super Admin, Loan Officer, Accountant, Collection Officer, Auditor, Administrator).
- **Auto-Generated Employee Codes:** Sequentially generates unique `AFS-EMP-XXXX` identifiers.
- **Personal Admin Profile:** Shows verified employee profile with code, age, date of birth, role badge, assigned branch, and security status.

### 4. Dynamic Branch Management (`/admin/settings`)
- View and manage operational branches.
- Head Office: Nayakaneri Road, Durganagar, Near MDO Office, V.KOTA, Chittoor District, AP - 517 424.
- Branches: Palamaneru & Thavanampalli.
- Super Admin can dynamically update branch addresses and add new branches directly from the dashboard.

### 5. Loan Lifecycle & Maker-Checker Workflow (`/admin/loans`)
- Loan proposal generation with live reducing balance amortization schedule preview.
- Dual Maker-Checker verification: Loan Officer creates proposal $\rightarrow$ Super Admin / Manager reviews and disburses funds.
- Printable official loan sanction letters and loan statements.

### 6. Payment & EMI Collection Engine (`/admin/payments`)
- Counter EMI collection with automated principal/interest split.
- Instant official printable receipt with barcode simulation and institutional seal.
- Payment reversal capability with mandatory audit remark tracking.

---

## ☁️ Deployment Guide

### Deploying to Vercel
1. Push this repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import `dhrn-1089/dharun-bank`.
4. Under **Environment Variables**, add:
   - `JWT_SECRET`: `your_random_secure_jwt_secret`
   - `DATABASE_URL`: `file:./dev.db` (or your PostgreSQL / Supabase connection string for production)
5. Click **Deploy**. Vercel will run `prisma generate && next build` automatically.

### Deploying to Render / Railway / Self-Hosted VPS
1. Set the build command: `npm install && npx prisma generate && npm run build`
2. Set the start command: `npm start`
3. Add environment variables:
   - `DATABASE_URL`: `file:./dev.db` (or PostgreSQL connection string)
   - `JWT_SECRET`: `your_production_secret`
   - `PORT`: `3000`

---

## 📜 Compliance & Legal Notice
Annapurna Future Financial Services Nidhi Limited is registered under Section 406 of the Companies Act, 2013 and operates strictly in compliance with Nidhi Rules, 2014. Financial services, deposit schemes, and lending facilities are available exclusively to verified registered members of the Nidhi company.
