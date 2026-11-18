"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  User,
  CreditCard,
  CalendarDays,
  History,
  FileSpreadsheet,
  Bell,
  Headphones,
  LogOut,
  Menu,
  X,
  Shield
} from "lucide-react";

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    fetch("/api/customer/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setCustomer(data.customer))
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Profile", href: "/dashboard/profile", icon: User },
    { name: "My Loans", href: "/dashboard/loans", icon: CreditCard },
    { name: "EMI Schedule", href: "/dashboard/emi", icon: CalendarDays },
    { name: "Payment History", href: "/dashboard/payments", icon: History },
    { name: "Loan Statements", href: "/dashboard/statements", icon: FileSpreadsheet },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: "Member Support", href: "/dashboard/support", icon: Headphones },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#082B67] text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="relative w-8 h-8">
            <Image src="/logo.jpg" alt="AFS Logo" fill className="object-contain" />
          </div>
          <span className="font-bold text-sm tracking-wide">AFS Member Portal</span>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-1.5 rounded-lg bg-white/10"
        >
          {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar for Desktop & Mobile drawer */}
      <aside
        className={`${
          mobileNavOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-[#082B67] text-white flex-shrink-0 flex flex-col justify-between p-5 fixed md:sticky top-0 h-screen z-40 overflow-y-auto`}
      >
        <div>
          {/* Company Brand Header */}
          <Link href="/" className="flex items-center space-x-3 mb-8 bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="relative w-10 h-8 shrink-0">
              <Image src="/logo.jpg" alt="AFS Logo" fill className="object-contain" />
            </div>
            <div>
              <div className="font-bold text-xs tracking-wider text-white">ANNAPURNA FUTURE</div>
              <div className="text-[9px] text-[#E6A500] font-semibold uppercase">Financial Services</div>
            </div>
          </Link>

          {/* Member Card in Sidebar */}
          {customer && (
            <div className="mb-6 p-3 bg-white/10 rounded-xl border border-white/15">
              <div className="text-xs text-slate-300 font-medium">Logged in Member</div>
              <div className="font-bold text-sm text-white truncate">{customer.fullName}</div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[10px]">
                <span className="font-mono text-[#E6A500] font-bold">{customer.customerId}</span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                  {customer.membershipStatus}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#E6A500] text-[#082B67] shadow-md font-bold"
                      : "text-slate-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-white/10 space-y-2">
          <div className="text-[10px] text-slate-400 flex items-center gap-1 px-2">
            <Shield className="w-3 h-3 text-[#E6A500]" />
            Nidhi Regulated Member Area
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
