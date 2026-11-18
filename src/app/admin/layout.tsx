"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CreditCard,
  PlusCircle,
  Receipt,
  FileBarChart,
  ShieldAlert,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  CheckCircle2,
  ChevronRight
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        if (data.userType !== "ADMIN") {
          router.push("/admin/login");
        } else {
          setAdminUser(data.admin);
        }
      })
      .catch(() => {
        router.push("/admin/login");
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const navItems = [
    { name: "Admin Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Staff & Employees", href: "/admin/staff", icon: Users },
    { name: "Customer Management", href: "/admin/customers", icon: Users },
    { name: "Add Customer (Manual)", href: "/admin/customers/new", icon: UserPlus },
    { name: "Loan Portfolio", href: "/admin/loans", icon: CreditCard },
    { name: "Create New Loan", href: "/admin/loans/new", icon: PlusCircle },
    { name: "Payments & Collections", href: "/admin/payments", icon: Receipt },
    { name: "Record EMI Payment", href: "/admin/payments/new", icon: PlusCircle },
    { name: "Reports & Analytics", href: "/admin/reports", icon: FileBarChart },
    { name: "Audit Trail", href: "/admin/audit-logs", icon: ShieldAlert },
    { name: "Settings & Branches", href: "/admin/settings", icon: Settings },
    { name: "My Staff Profile", href: "/admin/profile", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#051A40] text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="relative w-8 h-8">
            <Image src="/logo.jpg" alt="AFS Logo" fill className="object-contain" />
          </div>
          <span className="font-bold text-sm tracking-wide">AFS Admin Console</span>
        </div>
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-1.5 rounded-lg bg-white/10"
        >
          {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileNavOpen ? "block" : "hidden"
        } md:block w-full md:w-64 bg-[#051A40] text-white flex-shrink-0 flex flex-col justify-between p-5 fixed md:sticky top-0 h-screen z-40 overflow-y-auto`}
      >
        <div>
          {/* Logo & Platform Name */}
          <Link href="/admin/dashboard" className="flex items-center space-x-3 mb-6 bg-white/5 p-3 rounded-xl border border-white/10">
            <div className="relative w-10 h-8 shrink-0">
              <Image src="/logo.jpg" alt="AFS Logo" fill className="object-contain" />
            </div>
            <div>
              <div className="font-extrabold text-xs tracking-wider text-white">AFS ADMIN</div>
              <div className="text-[9px] text-[#E6A500] font-semibold uppercase">Management Suite</div>
            </div>
          </Link>

          {/* Active Admin Identity Badge */}
          {adminUser && (
            <div className="mb-6 p-3 bg-white/10 rounded-xl border border-white/15">
              <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">
                Active Administrator
              </div>
              <div className="font-bold text-sm text-white truncate mt-0.5">{adminUser.fullName}</div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-[10px]">
                <span className="bg-[#E6A500] text-[#082B67] font-extrabold px-2 py-0.5 rounded">
                  {adminUser.role}
                </span>
                <span className="text-slate-300 font-mono">{adminUser.adminCode}</span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
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
                      ? "bg-[#082B67] text-[#E6A500] border border-[#123F85] shadow font-bold"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
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
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white"
          >
            <ChevronRight className="w-3.5 h-3.5 text-[#E6A500]" /> Public Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
