"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileCheck2, 
  Users, 
  Palette, 
  GraduationCap, 
  LogOut, 
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { THOFNAA_CONFIG } from "@/lib/constants";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard Overview",
      href: "/admin",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: "Payment Verification",
      href: "/admin/payments",
      icon: <FileCheck2 className="w-4 h-4" />,
    },
    {
      label: "Student Roster & Import",
      href: "/admin/students",
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: "UI Design System",
      href: "/design-system",
      icon: <Palette className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-thofnaa-navy text-white rounded-2xl p-5 shadow-academic-elevated space-y-6 gold-accent-line shrink-0">
      {/* Admin Title */}
      <div className="flex items-center gap-3 pb-4 border-b border-thofnaa-navy-800">
        <div className="w-9 h-9 rounded-xl bg-thofnaa-gold text-thofnaa-navy flex items-center justify-center font-bold shadow-gold shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-serif font-bold text-sm tracking-tight text-white">
            THOFNAA Admin
          </h2>
          <p className="text-[10px] text-thofnaa-gold font-mono uppercase">
            Verification Portal
          </p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="space-y-1" aria-label="Admin Sidebar Navigation">
        <span className="text-[10px] font-mono uppercase tracking-widest text-thofnaa-ivory/60 px-3 block mb-2">
          Main Menu
        </span>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group",
                isActive
                  ? "bg-thofnaa-emerald text-white font-bold shadow-sm"
                  : "text-thofnaa-ivory/90 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <ChevronRight
                className={cn(
                  "w-3.5 h-3.5 transition-transform",
                  isActive ? "text-white opacity-100" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5"
                )}
              />
            </Link>
          );
        })}
      </nav>

      {/* Admin Profile Footer */}
      <div className="pt-4 border-t border-thofnaa-navy-800 space-y-3">
        <div className="p-3 rounded-xl bg-thofnaa-navy-900/80 border border-thofnaa-gold/20 flex items-center gap-3 text-xs">
          <div className="w-8 h-8 rounded-full bg-thofnaa-gold/20 text-thofnaa-gold flex items-center justify-center font-bold font-mono">
            AH
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-white truncate">Umer Ahsen</p>
            <p className="text-[10px] text-thofnaa-ivory/60 truncate">admin@thofnaa.lk</p>
          </div>
        </div>

        <Link href="/admin/login" className="block">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-thofnaa-gold border border-thofnaa-gold/30 hover:bg-thofnaa-gold hover:text-thofnaa-navy transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </Link>
      </div>
    </aside>
  );
}
