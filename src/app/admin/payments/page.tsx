"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Filter, FileCheck, CheckCircle2, XCircle, AlertCircle, Eye, Download } from "lucide-react";
import { INITIAL_SUBMISSIONS, PaymentSubmission } from "@/lib/mockData";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { THOFNAA_CONFIG } from "@/lib/constants";

export default function AdminPaymentsPage() {
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>(INITIAL_SUBMISSIONS);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState("ALL");

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesStatus = statusFilter === "ALL" || sub.status === statusFilter;
    const matchesMonth = monthFilter === "ALL" || sub.paymentMonth === monthFilter;
    const matchesSearch =
      sub.paymentRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.studentRegNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.depositReferenceNo.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesMonth && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tuition Payment Verification Queue"
        subtitle="Review uploaded deposit proofs, verify against People's Bank statements, approve or request clarifications."
        badgeText="Verification Operations"
      />

      <Card goldHeaderBorder className="shadow-md">
        <CardHeader className="bg-white space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Payment Submissions Queue</CardTitle>
              <CardDescription>
                Showing {filteredSubmissions.length} of {submissions.length} total payment submissions.
              </CardDescription>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-gray-100 border border-gray-200">
              {["ALL", "PENDING", "VERIFIED", "CLARIFICATION_NEEDED", "REJECTED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === st
                      ? "bg-thofnaa-navy text-white shadow-xs"
                      : "text-thofnaa-charcoal hover:bg-gray-200"
                  }`}
                >
                  {st === "ALL" ? "All Submissions" : st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Month Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            <div className="sm:col-span-8">
              <Input
                placeholder="Search reference code, student name, reg no, or bank deposit ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="sm:col-span-4">
              <Select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                options={["ALL", ...THOFNAA_CONFIG.months]}
                placeholder="Filter by Month"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredSubmissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-thofnaa-navy-50 text-thofnaa-navy uppercase font-mono text-[10px] tracking-wider border-b border-gray-200">
                    <th className="py-3.5 px-4">Ref Code</th>
                    <th className="py-3.5 px-4">Student Info</th>
                    <th className="py-3.5 px-4">Month / Fee</th>
                    <th className="py-3.5 px-4">Bank & Deposit Ref</th>
                    <th className="py-3.5 px-4">Proof File</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Review Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-4 font-mono font-extrabold text-thofnaa-navy">
                        {sub.paymentRef}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-serif font-bold text-thofnaa-charcoal text-sm">{sub.studentName}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{sub.studentRegNo}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-thofnaa-navy">{sub.paymentMonth} {sub.academicYear}</span>
                        <p className="text-[10px] font-mono text-thofnaa-emerald font-bold">
                          LKR {sub.feeAmount.toLocaleString()}.00
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-thofnaa-charcoal">{sub.bankName}</span>
                        <p className="text-[11px] font-mono text-gray-600">Ref: {sub.depositReferenceNo}</p>
                        <p className="text-[10px] text-gray-400">{sub.transactionDate}</p>
                      </td>
                      <td className="py-4 px-4">
                        <a
                          href={sub.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-thofnaa-navy text-[11px] font-medium"
                        >
                          <Eye className="w-3 h-3 text-thofnaa-gold" />
                          <span>View Proof</span>
                        </a>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={sub.status} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link href={`/admin/payments/${sub.id}`}>
                          <Button variant="primary" size="sm" className="font-bold text-[11px]">
                            Review & Verify
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8">
              <EmptyState
                title="No Payment Submissions Found"
                description="No records match your selected filter options."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setStatusFilter("ALL");
                      setSearchQuery("");
                      setMonthFilter("ALL");
                    }}
                  >
                    Reset Filters
                  </Button>
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
