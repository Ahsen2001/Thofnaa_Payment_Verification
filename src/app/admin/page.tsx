"use client";

import React from "react";
import Link from "next/link";
import { 
  CreditCard, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  TrendingUp, 
  GraduationCap, 
  UserPlus,
  FileCheck2
} from "lucide-react";
import { THOFNAA_CONFIG } from "@/lib/constants";
import { INITIAL_SUBMISSIONS, INITIAL_STUDENTS } from "@/lib/mockData";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function AdminDashboardPage() {
  const pendingCount = INITIAL_SUBMISSIONS.filter((s) => s.status === "PENDING").length;
  const verifiedCount = INITIAL_SUBMISSIONS.filter((s) => s.status === "VERIFIED").length;
  const clarificationCount = INITIAL_SUBMISSIONS.filter((s) => s.status === "CLARIFICATION_NEEDED").length;

  const totalRevenueLKR = INITIAL_SUBMISSIONS
    .filter((s) => s.status === "VERIFIED")
    .reduce((acc, curr) => acc + curr.feeAmount, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="THOFNAA Administrative Dashboard"
        subtitle={`Tuition Payment Verification & Student Management System • Academic Year ${THOFNAA_CONFIG.tuition.academicYear}`}
        badgeText="Admin Mode"
        action={
          <div className="flex gap-2">
            <Link href="/admin/students">
              <Button variant="secondary" size="sm" leftIcon={<UserPlus className="w-4 h-4" />}>
                Add / Import Students
              </Button>
            </Link>
            <Link href="/admin/payments">
              <Button variant="success" size="sm" leftIcon={<FileCheck2 className="w-4 h-4" />}>
                Review Pending ({pendingCount})
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Verified Income */}
        <Card className="border-l-4 border-l-thofnaa-emerald shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-thofnaa-charcoal-muted font-mono">
                Verified Tuition Revenue
              </span>
              <div className="text-2xl font-extrabold text-thofnaa-navy font-mono">
                LKR {totalRevenueLKR.toLocaleString()}.00
              </div>
              <p className="text-[11px] text-thofnaa-emerald font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> {verifiedCount} Verified Receipts
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-thofnaa-emerald/10 text-thofnaa-emerald flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Pending Submissions */}
        <Card className="border-l-4 border-l-amber-500 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-thofnaa-charcoal-muted font-mono">
                Pending Verification
              </span>
              <div className="text-2xl font-extrabold text-amber-900 font-mono">
                {pendingCount}
              </div>
              <p className="text-[11px] text-amber-700 font-medium">
                Requires Admin Action
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Clarification Requests */}
        <Card className="border-l-4 border-l-orange-500 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-thofnaa-charcoal-muted font-mono">
                Clarification Needed
              </span>
              <div className="text-2xl font-extrabold text-orange-900 font-mono">
                {clarificationCount}
              </div>
              <p className="text-[11px] text-orange-700 font-medium">
                Awaiting Parent Re-upload
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Total Enrolled Students */}
        <Card className="border-l-4 border-l-thofnaa-navy shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-thofnaa-charcoal-muted font-mono">
                Enrolled Students
              </span>
              <div className="text-2xl font-extrabold text-thofnaa-navy font-mono">
                {INITIAL_STUDENTS.length}
              </div>
              <p className="text-[11px] text-thofnaa-navy font-medium">
                Active Sinhala Roster
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-thofnaa-navy/10 text-thofnaa-navy flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Pending Submissions Preview & Roster Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Recent Payment Submissions */}
        <div className="lg:col-span-8 space-y-6">
          <Card goldHeaderBorder className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Payment Submissions</CardTitle>
                <CardDescription>Review and verify incoming bank transfer receipts.</CardDescription>
              </div>
              <Link href="/admin/payments">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  View All Submissions
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-thofnaa-navy-50 text-thofnaa-navy uppercase font-mono text-[10px] tracking-wider border-b border-gray-200">
                      <th className="py-3 px-4">Ref Code</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Month</th>
                      <th className="py-3 px-4">Bank Ref</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {INITIAL_SUBMISSIONS.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-thofnaa-navy">
                          {sub.paymentRef}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-thofnaa-charcoal">{sub.studentName}</p>
                          <span className="text-[10px] text-gray-500 font-mono">{sub.studentRegNo}</span>
                        </td>
                        <td className="py-3.5 px-4 font-medium">
                          {sub.paymentMonth}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-600">
                          {sub.depositReferenceNo}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={sub.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link href={`/admin/payments/${sub.id}`}>
                            <Button variant="outline" size="sm" className="px-2.5 py-1 text-[11px]">
                              Review
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols): Quick Student Roster & Bank Summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm">Enrolled Students</CardTitle>
              <Link href="/admin/students" className="text-xs text-thofnaa-emerald font-bold hover:underline">
                Roster →
              </Link>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {INITIAL_STUDENTS.map((std) => (
                <div key={std.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50/60 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-thofnaa-navy block">{std.fullName}</strong>
                    <span className="text-[10px] font-mono text-gray-500">{std.studentRegNo} • {std.gradeLevel}</span>
                  </div>
                  <Link href={`/admin/students/${std.id}`}>
                    <Button variant="ghost" size="sm" className="text-[10px] px-2 py-0.5">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
              <div className="pt-2">
                <Link href="/admin/students">
                  <Button variant="secondary" size="sm" leftIcon={<UserPlus className="w-3.5 h-3.5" />} className="w-full font-bold">
                    Add or Import Students
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
