"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LoanCalculator from "@/components/LoanCalculator";
import CyberSignature from "@/components/CyberSignature";
import {
  ShieldCheck,
  TrendingUp,
  Award,
  Users,
  Coins,
  Building,
  CheckCircle2,
  ArrowRight,
  FileText,
  Clock,
  Lock,
  ChevronDown,
  PhoneCall,
  MapPin,
  Mail,
  HelpCircle,
  Landmark,
  BadgeCheck
} from "lucide-react";

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is a Nidhi Company and who can avail financial services from AFS?",
      a: "Annapurna Future Financial Services Nidhi Limited is registered under Section 406 of the Companies Act, 2013 and regulated by the Ministry of Corporate Affairs (MCA). In accordance with statutory Nidhi Rules, our deposit and loan services are exclusively offered to our shareholder-members to cultivate mutual thrift and financial assistance."
    },
    {
      q: "Where is the Head Office and which branches are operational?",
      a: "Our Main Branch & Headquarters is located at 2/843, Nayakaneri Road, Durganagar, Near MDO. Office, V.KOTA, Chittoor District, Andhra Pradesh - 517 424. We operate branch offices in Palamaneru and Thavanampalli with centralized digital record management."
    },
    {
      q: "How do I become a member of Annapurna Future Financial Services?",
      a: "Any eligible Indian citizen can apply for membership by submitting a completed membership application along with verified KYC documents (Aadhaar & PAN) and subscribing to the statutory qualifying equity share(s) of the Nidhi company."
    },
    {
      q: "What types of loans are offered by AFS?",
      a: "AFS provides secured member loans strictly adhering to Nidhi Rules: Gold & Silver Jewellery Loans, Mortgage & Immovable Property Loans, Fixed Deposit Backed Loans, and Micro Member Business Loans with transparent reducing balance interest rates."
    },
    {
      q: "How is the monthly EMI calculated and can I track my repayment?",
      a: "Our EMI is calculated using standard banking formulas on a reducing balance basis. Upon loan disbursement, a complete month-wise amortization schedule is generated and instantly available on your Customer Portal where you can download receipts and loan statements."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FB]">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#082B67] via-[#0C367C] to-[#051A40] text-white py-20 lg:py-28">
        {/* Subtle geometric background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E6A500_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-[#E6A500] text-xs font-semibold uppercase tracking-wider animate-fadeIn">
                <ShieldCheck className="w-4 h-4" />
                Registered Nidhi Limited • Section 406 Companies Act
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Building Financial Confidence.{" "}
                <span className="text-[#E6A500] underline decoration-[#E6A500]/50 decoration-wavy decoration-2">
                  Securing Your Future.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-2xl">
                Annapurna Future Financial Services Nidhi Limited is committed to providing accessible, transparent and reliable member-focused financial services under statutory Indian Nidhi guidelines.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/register"
                  className="px-6 py-3.5 bg-gradient-to-r from-[#E6A500] to-[#F2B924] hover:from-[#CC9100] hover:to-[#E6A500] text-[#082B67] font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-base hover:-translate-y-0.5"
                >
                  Become a Member
                  <ArrowRight className="w-5 h-5 text-[#082B67]" />
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-xl backdrop-blur-sm transition-all text-base"
                >
                  Customer Login
                </Link>
                <Link
                  href="#calculator"
                  className="px-6 py-3.5 text-slate-200 hover:text-white font-semibold rounded-xl transition-all text-base flex items-center gap-1.5"
                >
                  Calculate EMI ↓
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 grid grid-cols-3 gap-6 border-t border-white/15 text-slate-200">
                <div>
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-slate-300">Nidhi Regulatory Compliance</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#E6A500]">₹ 10+ Cr</div>
                  <div className="text-xs text-slate-300">Member Credit Disbursed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">Bank-Grade</div>
                  <div className="text-xs text-slate-300">Vault & Asset Custody</div>
                </div>
              </div>
            </div>

            {/* Right Card: Institutional Financial Showcase (Clean Production Design - No hardcoded demo user) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-white/95 backdrop-blur-md p-7 rounded-3xl shadow-2xl border-4 border-[#E6A500]/40 max-w-md w-full text-slate-800 transition-transform duration-300 hover:scale-[1.01]">
                <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-4 border border-slate-200">
                  <Image
                    src="/logo.jpg"
                    alt="Annapurna Future Financial Services Logo"
                    fill
                    className="object-contain p-2"
                    priority
                  />
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-200">
                    <span className="flex items-center gap-1.5 text-[#082B67] font-bold">
                      <Landmark className="w-4 h-4 text-[#E6A500]" /> Institutional Highlights
                    </span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      MCA Certified
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 bg-[#F5F7FB] rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Headquarters</span>
                      <span className="font-bold text-[#082B67]">V.KOTA, Chittoor (A.P.)</span>
                    </div>

                    <div className="p-3 bg-[#F5F7FB] rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Regulatory Framework</span>
                      <span className="font-bold text-slate-800">Nidhi Rules, 2014</span>
                    </div>

                    <div className="p-3 bg-[#F5F7FB] rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Digital Verification</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <BadgeCheck className="w-3.5 h-3.5" /> Instant KYC Verification
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/login"
                      className="w-full py-3 bg-[#082B67] hover:bg-[#051A40] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow hover:shadow-md"
                    >
                      Member Portal Login
                      <ArrowRight className="w-4 h-4 text-[#E6A500]" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: ABOUT US */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E6A500] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                About Annapurna Future Financial Services
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#082B67] leading-tight">
                Empowering Member Prosperity Through Mutual Assistance & Ethical Finance
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                Annapurna Future Financial Services Nidhi Limited (AFS) is established under the Companies Act, 2013 and Nidhi Rules. Our primary objective is to inculcate the habit of thrift and savings among our members while providing convenient, low-cost credit facilities for personal, agricultural, and business endeavors.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-[#082B67] rounded-lg">
                    <Award className="w-5 h-5 text-[#E6A500]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#082B67] text-sm">Strict Statutory Compliance</h4>
                    <p className="text-xs text-slate-500 mt-1">Full adherence to MCA rules and statutory audits.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-[#082B67] rounded-lg">
                    <Lock className="w-5 h-5 text-[#E6A500]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#082B67] text-sm">Vault & Asset Security</h4>
                    <p className="text-xs text-slate-500 mt-1">Insured, multi-layered vault custody for gold assets.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-[#082B67] rounded-lg">
                    <TrendingUp className="w-5 h-5 text-[#E6A500]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#082B67] text-sm">Fair Reducing Rates</h4>
                    <p className="text-xs text-slate-500 mt-1">Transparent calculations with no hidden deductions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-[#082B67] rounded-lg">
                    <Users className="w-5 h-5 text-[#E6A500]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#082B67] text-sm">Member-First Governance</h4>
                    <p className="text-xs text-slate-500 mt-1">Every borrower is a stakeholder and shareholder.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#F5F7FB] p-8 rounded-2xl border border-slate-200">
              <h3 className="text-xl font-bold text-[#082B67] mb-4">Our Core Pillars</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                  <div className="font-semibold text-slate-800 text-sm">1. Thrift & Mutual Savings</div>
                  <p className="text-xs text-slate-600 mt-1">
                    Encouraging members to build financial reserves through disciplined recurring and fixed deposit avenues.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                  <div className="font-semibold text-slate-800 text-sm">2. Transparent Member Credit</div>
                  <p className="text-xs text-slate-600 mt-1">
                    Instant credit disbursement against tangible collateral with automated month-wise amortization schedules.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                  <div className="font-semibold text-slate-800 text-sm">3. Digital Transparency</div>
                  <p className="text-xs text-slate-600 mt-1">
                    Real-time member portal providing instant receipts, amortization tables, and immutable transaction audit trails.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: FINANCIAL SERVICES */}
      <section id="services" className="py-20 bg-[#F5F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E6A500] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Our Financial Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#082B67] mt-3">
              Comprehensive Member-Centric Financial Solutions
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              Designed in compliance with Nidhi Rules to serve shareholder-members with maximum speed, security, and integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 transition-all">
              <div className="w-14 h-14 bg-amber-50 text-[#E6A500] rounded-xl flex items-center justify-center mb-6">
                <Coins className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#082B67] mb-2">Member Gold Loans</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Instant liquidity against 22K/24K gold jewellery with high loan-to-value (LTV) limits, multi-tier bank locker safety, and lowest interest rates.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Disbursal in as fast as 30 minutes
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Insured vault custody
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Flexible bullet & EMI repayment
                </li>
              </ul>
            </div>

            {/* Service 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 transition-all">
              <div className="w-14 h-14 bg-blue-50 text-[#082B67] rounded-xl flex items-center justify-center mb-6">
                <Building className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#082B67] mb-2">Property & Mortgage Loans</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Secured credit against residential or commercial properties within branch operational jurisdiction for home expansion, business, or education.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tenures up to 60 months
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Clear legal & title verification
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Low processing charges
                </li>
              </ul>
            </div>

            {/* Service 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md border border-slate-200 transition-all">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#082B67] mb-2">Personal & Micro Loans</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Tailored financial assistance for established members with prompt repayment histories to meet urgent medical, family, or trade needs.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Minimal paperwork
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Reducing balance interest
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Convenient online & branch payments
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: LOAN PRODUCTS & INTERACTIVE CALCULATOR */}
      <section id="calculator" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E6A500] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Loan Products & Calculator
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#082B67] mt-3">
              Plan Your Borrowing with Precision
            </h2>
            <p className="text-slate-600 mt-2 text-base">
              Use our live financial calculator to determine your exact monthly installments, interest components, and repayment totals before applying.
            </p>
          </div>

          <div>
            <LoanCalculator />
          </div>
        </div>
      </section>

      {/* SECTION 4: WHY CHOOSE AFS */}
      <section className="py-20 bg-[#082B67] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E6A500] bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Why Choose AFS?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              The Gold Standard in Member Financial Services
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="p-3 bg-[#E6A500]/20 rounded-xl w-fit mb-4 text-[#E6A500]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">100% Transparent</h3>
              <p className="text-sm text-slate-300">
                Zero hidden charges, explicit reducing balance interest calculations, and transparent sanction letters.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="p-3 bg-[#E6A500]/20 rounded-xl w-fit mb-4 text-[#E6A500]">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Swift Turnaround</h3>
              <p className="text-sm text-slate-300">
                Streamlined dual maker-checker appraisal process ensuring fast decisions and direct disbursements.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="p-3 bg-[#E6A500]/20 rounded-xl w-fit mb-4 text-[#E6A500]">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Bank-Grade Vaults</h3>
              <p className="text-sm text-slate-300">
                Pledged gold collateral is preserved in high-security, insured bank-grade safes under continuous surveillance.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="p-3 bg-[#E6A500]/20 rounded-xl w-fit mb-4 text-[#E6A500]">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Self-Service Portal</h3>
              <p className="text-sm text-slate-300">
                Access your real-time EMI schedule, payment history, and downloadable PDF receipts 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CONTACT & BRANCHES (V.KOTA HQ, PALAMANERU, THAVANAMPALLI) */}
      <section id="contact" className="py-20 bg-[#F5F7FB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E6A500] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Registered Offices & Branches
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#082B67] mt-3">
              Visit Our Branches in Andhra Pradesh
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* V.KOTA HQ */}
            <div className="bg-white p-8 rounded-2xl border-2 border-[#E6A500]/50 shadow-md space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-[#082B67] rounded-xl">
                  <Landmark className="w-6 h-6 text-[#082B67]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#082B67]">V.KOTA Head Office</h3>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    MAIN HEADQUARTERS
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-600 pt-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#E6A500] shrink-0 mt-0.5" />
                  <span className="font-medium text-slate-800 leading-relaxed">
                    2/843, Nayakaneri Road, Durganagar, Near MDO. Office, V.KOTA, Chittoor District, Andhra Pradesh - 517 424
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#E6A500] shrink-0" />
                  <span>+91 8579 245 678</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#E6A500] shrink-0" />
                  <span>vkota.hq@annapurnafuture.com</span>
                </div>
              </div>
            </div>

            {/* Palamaneru Branch */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-[#082B67] rounded-xl">
                  <Building className="w-6 h-6 text-[#082B67]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#082B67]">Palamaneru Branch</h3>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Code: AFS-BR-PALAM
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-600 pt-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#E6A500] shrink-0 mt-0.5" />
                  <span>
                    D.No. 4-128, Main Bazaar Road, Near RTC Bus Stand, Palamaneru, Chittoor District, Andhra Pradesh - 517 408
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#E6A500] shrink-0" />
                  <span>+91 8579 251 234</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#E6A500] shrink-0" />
                  <span>palamaneru@annapurnafuture.com</span>
                </div>
              </div>
            </div>

            {/* Thavanampalli Branch */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-[#082B67] rounded-xl">
                  <Building className="w-6 h-6 text-[#082B67]" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#082B67]">Thavanampalli Branch</h3>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Code: AFS-BR-THAVAN
                  </span>
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-600 pt-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#E6A500] shrink-0 mt-0.5" />
                  <span>
                    Door No. 1-89, Kanipakam Main Road, Thavanampalli, Chittoor District, Andhra Pradesh - 517 127
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#E6A500] shrink-0" />
                  <span>+91 8572 278 910</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#E6A500] shrink-0" />
                  <span>thavanampalli@annapurnafuture.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: FREQUENTLY ASKED QUESTIONS */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E6A500] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#082B67] mt-3">
              Clear Answers to Member Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-5 flex justify-between items-center bg-[#F5F7FB] hover:bg-slate-100 transition-colors"
                >
                  <span className="font-bold text-[#082B67] text-base flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#E6A500] shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 transition-transform ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-5 bg-white text-slate-600 text-sm leading-relaxed border-t border-slate-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
