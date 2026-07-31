"use client";

import React, { use } from "react";
import Link from "next/link";
import { ArrowLeft, GraduationCap, Mail, Phone, Calendar, CreditCard, CheckCircle2, Clock, Plus } from "lucide-react";
import { INITIAL_STUDENTS, INITIAL_SUBMISSIONS, Student, PaymentSubmission } from "@/lib/mockData";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { THOFNAA_CONFIG } from "@/lib/constants";

export default function AdminStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  const student: Student =
    INITIAL_STUDENTS.find((s) => s.id === resolvedParams.id) || INITIAL_STUDENTS[0];

  const studentPayments: PaymentSubmission[] = INITIAL_SUBMISSIONS.filter(
    (sub) => sub.studentId === student.id || sub.studentRegNo === student.studentRegNo
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title={student.fullName}
        subtitle={`Student Reg: ${student.studentRegNo} • ${student.gradeLevel}`}
        badgeText="Student Record Profile"
        action={
          <Link href="/admin/students">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Roster
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 cols): Student Profile Details */}
        <div className="lg:col-span-5 space-y-6">
          <Card goldHeaderBorder className="shadow-md">
            <CardHeader className="bg-thofnaa-navy text-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-thofnaa-gold text-thofnaa-navy flex items-center justify-center font-bold shadow-gold">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <CardTitle className="text-white text-lg">{student.fullName}</CardTitle>
                  <CardDescription className="text-thofnaa-gold font-mono text-xs">
                    {student.studentRegNo}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-6 text-xs">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex justify-between items-center">
                <span className="text-thofnaa-charcoal-muted">Grade / Class:</span>
                <strong className="text-thofnaa-navy text-sm font-serif">{student.gradeLevel}</strong>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                <h5 className="font-bold text-thofnaa-navy uppercase tracking-wider text-[10px]">
                  Guardian Contact Info
                </h5>
                <div className="flex items-center gap-2 text-thofnaa-charcoal">
                  <span className="text-gray-400">Guardian Name:</span>
                  <strong>{student.guardianName}</strong>
                </div>
                <div className="flex items-center gap-2 text-thofnaa-charcoal">
                  <Mail className="w-3.5 h-3.5 text-thofnaa-emerald" />
                  <a href={`mailto:${student.guardianEmail}`} className="text-thofnaa-navy font-mono hover:underline">
                    {student.guardianEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-thofnaa-charcoal">
                  <Phone className="w-3.5 h-3.5 text-thofnaa-emerald" />
                  <span className="font-mono">{student.guardianPhone}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <Link
                  href={{
                    pathname: "/payment",
                    query: { regNo: student.studentRegNo },
                  }}
                >
                  <Button variant="secondary" size="md" leftIcon={<Plus className="w-4 h-4" />} className="w-full font-bold">
                    Submit Payment for {student.fullName}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (7 cols): Payment History Table */}
        <div className="lg:col-span-7 space-y-6">
          <Card goldHeaderBorder className="shadow-md">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-thofnaa-gold" />
                Tuition Payment History
              </CardTitle>
              <CardDescription>
                Logged payment submissions and verification records.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              {studentPayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-thofnaa-navy-50 text-thofnaa-navy uppercase font-mono text-[10px] tracking-wider border-b border-gray-200">
                        <th className="py-3.5 px-4">Ref Code</th>
                        <th className="py-3.5 px-4">Month</th>
                        <th className="py-3.5 px-4">Bank Ref</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Review</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {studentPayments.map((sub) => (
                        <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-thofnaa-navy">
                            {sub.paymentRef}
                          </td>
                          <td className="py-3.5 px-4 font-semibold">
                            {sub.paymentMonth} {sub.academicYear}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-gray-600">
                            {sub.depositReferenceNo}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={sub.status} size="sm" />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link href={`/admin/payments/${sub.id}`}>
                              <Button variant="outline" size="sm" className="text-[10px] px-2.5 py-0.5">
                                Review
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-gray-500">
                  No payment submissions logged yet for this student.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
