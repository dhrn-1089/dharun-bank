import Link from "next/link";
import Image from "next/image";
import { Shield, Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import CyberSignature from "@/components/CyberSignature";

export default function Footer() {
  return (
    <footer className="bg-[#051A40] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: About & Logo */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3 bg-white/10 p-3 rounded-lg w-fit">
              <div className="relative w-12 h-10">
                <Image
                  src="/logo.jpg"
                  alt="AFS Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-white">
                <div className="font-bold text-sm tracking-wide">ANNAPURNA FUTURE</div>
                <div className="text-[10px] text-[#E6A500] font-semibold">FINANCIAL SERVICES NIDHI LTD</div>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Committed to cultivating mutual savings, financial discipline, and accessible, transparent member-centric credit solutions under the regulatory framework of the Companies Act, 2013 and Nidhi Rules.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#E6A500] font-semibold bg-[#082B67] px-3 py-1.5 rounded w-fit border border-[#123F85]">
              <Shield className="w-4 h-4" />
              CIN: U65999AP2024PLN100000
            </div>
          </div>

          {/* Col 2: Member Services */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-b border-slate-700 pb-2">
              Member Services
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/#loans" className="hover:text-[#E6A500] transition-colors">
                  Member Gold Loans
                </Link>
              </li>
              <li>
                <Link href="/#loans" className="hover:text-[#E6A500] transition-colors">
                  Property & Mortgage Loans
                </Link>
              </li>
              <li>
                <Link href="/#loans" className="hover:text-[#E6A500] transition-colors">
                  Personal & Micro Loans
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-[#E6A500] transition-colors">
                  Fixed Deposit Schemes
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-[#E6A500] transition-colors">
                  Recurring Deposit Accounts
                </Link>
              </li>
              <li>
                <Link href="/#calculator" className="hover:text-[#E6A500] transition-colors">
                  EMI & Amortization Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Portals */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-b border-slate-700 pb-2">
              Quick Portals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="hover:text-[#E6A500] flex items-center gap-1 transition-colors">
                  Customer / Member Portal
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#E6A500] flex items-center gap-1 transition-colors">
                  Apply for Membership
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-[#E6A500] flex items-center gap-1 transition-colors text-amber-300">
                  Staff & Admin Login <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-[#E6A500] transition-colors">
                  About Nidhi Structure
                </Link>
              </li>
              <li>
                <Link href="/#compliance" className="hover:text-[#E6A500] transition-colors">
                  Regulatory Compliance & Fair Practices
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Head Office & Contact */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 border-b border-slate-700 pb-2">
              Head Office & Contact
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E6A500] shrink-0 mt-1" />
                <span className="leading-snug">
                  <strong>Headquarters:</strong> 2/843, Nayakaneri Road, Durganagar, Near MDO. Office, V.KOTA, Chittoor District, Andhra Pradesh - 517 424
                </span>
              </li>
              <li className="text-xs text-slate-400 pl-6 space-y-1">
                <div>• <strong>Palamaneru Branch:</strong> D.No. 4-128, Main Bazaar Road, Palamaneru - 517 408</div>
                <div>• <strong>Thavanampalli Branch:</strong> Door No. 1-89, Kanipakam Road - 517 127</div>
              </li>
              <li className="flex items-center gap-2.5 pt-1">
                <Phone className="w-4 h-4 text-[#E6A500] shrink-0" />
                <span>+91 8579 245 678 / 1800 425 6789</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E6A500] shrink-0" />
                <span>support@annapurnafuture.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory Disclosure */}
        <div className="border-t border-slate-800 pt-8 pb-6 text-xs text-slate-400 leading-relaxed bg-[#03112b] p-6 rounded-xl">
          <p className="font-semibold text-slate-300 mb-2">
            STATUTORY DISCLOSURES & REGULATORY NOTICE:
          </p>
          <p className="mb-2">
            Annapurna Future Financial Services Nidhi Limited (AFS) is incorporated as a Nidhi Company under Section 406 of the Companies Act, 2013 and is governed by the Nidhi Rules, 2014 as amended. AFS is NOT a commercial bank or an RBI-licensed Non-Banking Financial Company (NBFC).
          </p>
          <p>
            The company accepts deposits and extends credit facilities ONLY to its admitted shareholder-members in accordance with statutory Nidhi guidelines. No business transactions or deposits are accepted from the general public.
          </p>
        </div>

        {/* Developer Signature & Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} Annapurna Future Financial Services Nidhi Limited. All rights reserved.
          </div>
          <div>
            <CyberSignature variant="dark" />
          </div>
          <div className="flex space-x-6">
            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
            <span>Fair Practices Code</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
