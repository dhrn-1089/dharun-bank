"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Shield, User, ArrowRight } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Compliance Bar */}
      <div className="bg-[#082B67] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="w-3.5 h-3.5 text-[#E6A500]" />
            <span className="font-medium tracking-wide">
              Registered Nidhi Company under Companies Act, 2013 | Member-based Financial Services
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-slate-300">Helpline: +91 44 2435 6789</span>
            <span className="text-slate-400">|</span>
            <Link href="/admin/login" className="text-[#E6A500] hover:underline font-semibold flex items-center gap-1">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-16 h-14 overflow-hidden rounded">
              <Image
                src="/logo.jpg"
                alt="AFS Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#082B67] block leading-tight">
                ANNAPURNA FUTURE
              </span>
              <span className="text-xs font-semibold tracking-wider text-[#E6A500] block uppercase">
                Financial Services Nidhi Limited
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-slate-700 hover:text-[#082B67] font-medium transition-colors">
              Home
            </Link>
            <Link href="/#about" className="text-slate-700 hover:text-[#082B67] font-medium transition-colors">
              About Us
            </Link>
            <Link href="/#services" className="text-slate-700 hover:text-[#082B67] font-medium transition-colors">
              Our Services
            </Link>
            <Link href="/#loans" className="text-slate-700 hover:text-[#082B67] font-medium transition-colors">
              Loan Products
            </Link>
            <Link href="/#calculator" className="text-slate-700 hover:text-[#082B67] font-medium transition-colors">
              EMI Calculator
            </Link>
            <Link href="/#contact" className="text-slate-700 hover:text-[#082B67] font-medium transition-colors">
              Contact Us
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-[#082B67] hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <User className="w-4 h-4" />
              Customer Login
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#082B67] to-[#123F85] hover:from-[#051A40] hover:to-[#082B67] rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              Become a Member
              <ArrowRight className="w-4 h-4 text-[#E6A500]" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs font-semibold text-[#082B67] border border-[#082B67] rounded-md"
            >
              Login
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#082B67]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 font-medium"
          >
            Home
          </Link>
          <Link
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 font-medium"
          >
            About Us
          </Link>
          <Link
            href="/#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 font-medium"
          >
            Our Services
          </Link>
          <Link
            href="/#loans"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 font-medium"
          >
            Loan Products
          </Link>
          <Link
            href="/#calculator"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 font-medium"
          >
            EMI Calculator
          </Link>
          <Link
            href="/#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 font-medium"
          >
            Contact Us
          </Link>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 font-semibold text-[#082B67] border border-[#082B67] rounded-lg"
            >
              Customer Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 font-semibold text-white bg-[#082B67] rounded-lg"
            >
              Become a Member (Register)
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 font-medium text-xs text-[#E6A500] bg-slate-900 rounded-lg"
            >
              Staff & Admin Portal Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
