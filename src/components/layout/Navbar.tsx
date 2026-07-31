"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, ShieldCheck, Search, Menu, X, CreditCard, UserPlus } from "lucide-react";
import { THOFNAA_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminRoute = pathname.startsWith("/admin");

  const navLinks = [
    { href: "/", label: "Home & Verification", icon: <GraduationCap className="w-4 h-4" /> },
    { href: "/payment", label: "Submit Payment Proof", icon: <CreditCard className="w-4 h-4" /> },
    { href: "/payment/status", label: "Check Status", icon: <Search className="w-4 h-4" /> },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard Overview" },
    { href: "/admin/payments", label: "Payment Verification" },
    { href: "/admin/students", label: "Student Roster & Add" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-thofnaa-navy text-white shadow-md border-b border-thofnaa-gold/30">
      {/* Top Academic Info Strip */}
      <div className="bg-thofnaa-navy-900 py-1.5 px-4 text-xs text-thofnaa-ivory/80 border-b border-thofnaa-navy-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-serif italic text-thofnaa-gold hidden sm:inline">
              {THOFNAA_CONFIG.secondaryTagline}
            </span>
            <span className="text-thofnaa-gold font-bold sm:hidden">
              THOFNAA SINHALA TUITION
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>WhatsApp: <a href={THOFNAA_CONFIG.contact.whatsappLink} target="_blank" rel="noreferrer" className="text-thofnaa-gold hover:underline font-mono">{THOFNAA_CONFIG.contact.whatsappFormatted}</a></span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Email: <a href={`mailto:${THOFNAA_CONFIG.contact.email}`} className="text-thofnaa-gold hover:underline font-mono">{THOFNAA_CONFIG.contact.email}</a></span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Institute Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-thofnaa-gold flex items-center justify-center text-thofnaa-navy shadow-gold group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="font-serif font-bold text-lg tracking-tight text-white group-hover:text-thofnaa-gold transition-colors flex items-center gap-2">
                <span>{THOFNAA_CONFIG.name}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-thofnaa-gold/20 text-thofnaa-gold border border-thofnaa-gold/40">
                  VERIFY
                </span>
              </div>
              <p className="text-[11px] text-thofnaa-ivory/70 font-sans tracking-widest uppercase">
                {THOFNAA_CONFIG.tagline}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {!isAdminRoute ? (
              navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all",
                      isActive
                        ? "bg-thofnaa-gold text-thofnaa-navy shadow-xs font-bold"
                        : "text-thofnaa-ivory hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                );
              })
            ) : (
              adminLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3.5 py-2 rounded-lg text-xs font-semibold transition-all",
                      isActive
                        ? "bg-thofnaa-emerald text-white shadow-xs font-bold"
                        : "text-thofnaa-ivory hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })
            )}

            <div className="ml-4 pl-4 border-l border-thofnaa-navy-600 flex items-center gap-2">
              {!isAdminRoute ? (
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-thofnaa-gold border border-thofnaa-gold/40 hover:bg-thofnaa-gold hover:text-thofnaa-navy transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Login</span>
                </Link>
              ) : (
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-thofnaa-ivory hover:bg-white/10"
                >
                  <span>Student Portal</span>
                </Link>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-thofnaa-ivory hover:bg-white/10 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-thofnaa-navy-900 border-b border-thofnaa-gold/20 px-4 pt-2 pb-6 space-y-2">
          {!isAdminRoute ? (
            navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-thofnaa-ivory hover:bg-white/10 hover:text-thofnaa-gold"
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))
          ) : (
            adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm text-thofnaa-ivory hover:bg-white/10 hover:text-thofnaa-emerald"
              >
                {link.label}
              </Link>
            ))
          )}
          <div className="pt-4 border-t border-thofnaa-navy-800">
            <Link
              href={isAdminRoute ? "/" : "/admin/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-thofnaa-gold text-thofnaa-navy font-bold text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isAdminRoute ? "Go to Public Portal" : "Admin Dashboard Login"}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
