"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Wallet, 
  Users, 
  Search, 
  Filter, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  GraduationCap 
} from "lucide-react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { StatusBadge, PaymentStatus } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatLKR } from "@/lib/utils";
import { Student, PaymentSubmission } from "@/lib/mockData";
import { THOFNAA_CONFIG } from "@/lib/constants";
import { calculateFinancialReport } from "@/lib/financialReporting";
import { getStoredStudents, getStoredSubmissions } from "@/lib/studentStore";

export default function AdminDashboardPage() {
  // Persistent Storage States
  const [students, setStudents] = useState<Student[]>([]);
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);

  useEffect(() => {
    setStudents(getStoredStudents());
    setSubmissions(getStoredSubmissions());

    const handleUpdate = () => {
      setStudents(getStoredStudents());
      setSubmissions(getStoredSubmissions());
    };

    window.addEventListener("thofnaa_students_updated", handleUpdate);
    window.addEventListener("thofnaa_submissions_updated", handleUpdate);
    return () => {
      window.removeEventListener("thofnaa_students_updated", handleUpdate);
      window.removeEventListener("thofnaa_submissions_updated", handleUpdate);
    };
  }, []);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("February");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [selectedProgramme, setSelectedProgramme] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Compute Live Financial Report using persistent student & submission state
  const financialReport = useMemo(() => {
    return calculateFinancialReport(
      {
        month: selectedMonth,
        year: selectedYear,
        grade: selectedGrade,
        batch: selectedBatch,
        programme: selectedProgramme,
      },
      students,
      submissions
    );
  }, [selectedMonth, selectedYear, selectedGrade, selectedBatch, selectedProgramme, students, submissions]);

  // Compute KPI Metrics from Data
  const pendingCount = submissions.filter((s) => s.status === "PENDING").length;

  // Filter Submissions Dataset
  const activeStudentRegNos = useMemo(() => new Set(students.map((s) => s.studentRegNo.toUpperCase())), [students]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      if (!activeStudentRegNos.has(item.studentRegNo.toUpperCase())) return false;
      // 1. Search Query Filter (Reg No or Student Name)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesRegNo = item.studentRegNo.toLowerCase().includes(query);
        const matchesName = item.studentName.toLowerCase().includes(query);
        const matchesRef = item.paymentRef.toLowerCase().includes(query);
        if (!matchesRegNo && !matchesName && !matchesRef) return false;
      }

      // 2. Month Filter
      if (selectedMonth !== "All" && item.paymentMonth.toLowerCase() !== selectedMonth.toLowerCase()) {
        return false;
      }

      // 3. Year Filter
      if (selectedYear !== "All" && item.academicYear.toString() !== selectedYear) {
        return false;
      }

      // 4. Status Filter
      if (selectedStatus !== "All" && item.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedMonth, selectedYear, selectedStatus, submissions]);

  // Paginated Results
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage) || 1;
  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSubmissions.slice(start, start + itemsPerPage);
  }, [filteredSubmissions, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedMonth("February");
    setSelectedYear("2026");
    setSelectedGrade("All");
    setSelectedBatch("All");
    setSelectedProgramme("All");
    setSelectedStatus("All");
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 space-y-8 min-w-0">
        <PageHeader
          title="THOFNAA Admin Verification Dashboard"
          subtitle="Real-time tuition payment verification queue, financial revenue collection metrics, and student roster statistics."
          badgeText="System Overview"
          action={
            <div className="flex items-center gap-2">
              <Link href="/admin/payments">
                <Button variant="primary" size="sm" leftIcon={<Clock className="w-4 h-4" />}>
                  Verification Queue ({pendingCount})
                </Button>
              </Link>
            </div>
          }
        />

        {/* 💳 FINANCIAL REVENUE & TUITION COLLECTION REPORT CARD */}
        <Card goldHeaderBorder className="shadow-lg border-2 border-thofnaa-gold/30">
          <CardHeader className="bg-thofnaa-navy text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5">
            <div>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-thofnaa-gold" /> Financial Revenue & Tuition Collection Report
              </CardTitle>
              <CardDescription className="text-thofnaa-gold text-xs">
                Monthly breakdown for <strong className="text-white">{financialReport.filterSummary.month} {financialReport.filterSummary.year}</strong> (LKR 1,000 / active student). Only VERIFIED payments count as collected revenue.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 bg-thofnaa-navy-900 p-2.5 rounded-xl border border-thofnaa-gold/30 font-mono text-xs text-thofnaa-gold">
              <TrendingUp className="w-4 h-4 text-thofnaa-emerald" />
              <span>Collection Rate: <strong>{financialReport.collectionPercentage}%</strong></span>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Financial Filter Toolbar */}
            <div className="p-4 rounded-xl bg-thofnaa-ivory border border-thofnaa-gold/30 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <Select
                label="Tuition Month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                options={THOFNAA_CONFIG.months}
              />

              <Select
                label="Academic Year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                options={["2026", "2025", "2024"]}
              />

              <Select
                label="Grade Level"
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                options={["All", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"]}
              />

              <Select
                label="Batch Module"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                options={["All", "Foundation", "Intermediate", "Senior"]}
              />

              <Select
                label="Programme"
                value={selectedProgramme}
                onChange={(e) => setSelectedProgramme(e.target.value)}
                options={["All", "Second Language Sinhala"]}
              />
            </div>

            {/* Financial Revenue Metrics Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Expected Revenue */}
              <div className="p-4 rounded-2xl bg-white border border-gray-200 border-l-4 border-l-thofnaa-navy shadow-xs space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-thofnaa-charcoal-muted block">
                  Total Expected Fees
                </span>
                <div className="text-xl font-extrabold font-mono text-thofnaa-navy">
                  {formatLKR(financialReport.totalExpectedLKR)}
                </div>
                <p className="text-[11px] text-thofnaa-charcoal-muted">
                  {financialReport.activeStudents} Active Students × LKR 1,000
                </p>
              </div>

              {/* Verified Revenue (Collected) */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 border-l-4 border-l-thofnaa-emerald shadow-xs space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-800 block">
                  Total Collected (Verified)
                </span>
                <div className="text-xl font-extrabold font-mono text-thofnaa-emerald">
                  {formatLKR(financialReport.totalCollectedLKR)}
                </div>
                <p className="text-[11px] text-emerald-800 font-semibold">
                  {financialReport.verifiedCount} Approved Payments ({financialReport.collectionPercentage}%)
                </p>
              </div>

              {/* Pending Revenue */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 border-l-4 border-l-amber-500 shadow-xs space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-800 block">
                  Pending Verification
                </span>
                <div className="text-xl font-extrabold font-mono text-amber-700">
                  {formatLKR(financialReport.totalPendingLKR)}
                </div>
                <p className="text-[11px] text-amber-800 font-semibold">
                  {financialReport.pendingCount} Receipts Awaiting Review
                </p>
              </div>

              {/* Unpaid / Not Submitted */}
              <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200 border-l-4 border-l-red-500 shadow-xs space-y-1">
                <span className="text-[10px] font-mono uppercase font-bold text-red-800 block">
                  Unpaid / Not Submitted
                </span>
                <div className="text-xl font-extrabold font-mono text-red-700">
                  {formatLKR(financialReport.totalUnpaidLKR)}
                </div>
                <p className="text-[11px] text-red-800 font-semibold">
                  {financialReport.unpaidCount} Active Students Outstanding
                </p>
              </div>
            </div>

            {/* Visual Collection Rate Progress Bar */}
            <div className="space-y-2 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-thofnaa-navy flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-thofnaa-emerald" /> Tuition Fee Collection Progress ({selectedMonth} {selectedYear})
                </span>
                <span className="font-mono font-bold text-thofnaa-emerald">
                  {financialReport.collectionPercentage}% Collected ({formatLKR(financialReport.totalCollectedLKR)} / {formatLKR(financialReport.totalExpectedLKR)})
                </span>
              </div>

              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden flex">
                <div
                  className="bg-thofnaa-emerald transition-all duration-500 h-full"
                  style={{ width: `${financialReport.collectionPercentage}%` }}
                  title={`Verified: ${financialReport.collectionPercentage}%`}
                />
                <div
                  className="bg-amber-400 transition-all duration-500 h-full"
                  style={{ width: `${financialReport.totalExpectedLKR > 0 ? (financialReport.totalPendingLKR / financialReport.totalExpectedLKR) * 100 : 0}%` }}
                  title="Pending Verification"
                />
                <div
                  className="bg-red-400 transition-all duration-500 h-full"
                  style={{ width: `${financialReport.totalExpectedLKR > 0 ? (financialReport.totalUnpaidLKR / financialReport.totalExpectedLKR) * 100 : 0}%` }}
                  title="Unpaid / Outstanding"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-thofnaa-charcoal-muted pt-1">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-thofnaa-emerald inline-block"></span> Verified: {financialReport.verifiedCount}</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Pending: {financialReport.pendingCount}</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span> Unpaid: {financialReport.unpaidCount}</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> Rejected: {financialReport.rejectedCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEARCH & FILTERS PANEL CARD FOR SUBMISSIONS TABLE */}
        <Card goldHeaderBorder className="shadow-md">
          <CardHeader className="bg-white border-b border-gray-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="w-4 h-4 text-thofnaa-navy" /> Search & Filter Submissions
                </CardTitle>
                <CardDescription>
                  Filter payment verification queue by registration number, month, year, grade, or verification status.
                </CardDescription>
              </div>

              {(searchQuery || selectedMonth !== "February" || selectedYear !== "2026" || selectedGrade !== "All" || selectedStatus !== "All") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="text-xs text-thofnaa-navy hover:bg-gray-100 self-start sm:self-auto"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            {/* Search Input Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4">
                <Input
                  label="Search Student / Reg No / Ref"
                  placeholder="e.g. THF-26-0001 or Kasun"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>

              <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Select
                  label="Payment Month"
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={["All", ...THOFNAA_CONFIG.months]}
                />

                <Select
                  label="Academic Year"
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={["All", "2026", "2025", "2024"]}
                />

                <Select
                  label="Grade Level"
                  value={selectedGrade}
                  onChange={(e) => {
                    setSelectedGrade(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={["All", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"]}
                />

                <Select
                  label="Verification Status"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={["All", "PENDING", "VERIFIED", "CLARIFICATION_NEEDED", "REJECTED"]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RECENT SUBMISSIONS TABLE CARD */}
        <Card goldHeaderBorder className="shadow-md">
          <CardHeader className="bg-thofnaa-navy text-white flex flex-row items-center justify-between py-4">
            <div>
              <CardTitle className="text-white text-base">Payment Verification Roster</CardTitle>
              <CardDescription className="text-thofnaa-gold text-xs">
                Showing {filteredSubmissions.length} recorded submissions
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {paginatedSubmissions.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title="No payment records match your filters"
                  description="Try adjusting your search query, month, grade, or status filter options."
                  action={
                    <Button variant="outline" size="sm" onClick={handleResetFilters}>
                      Clear All Filters
                    </Button>
                  }
                />
              </div>
            ) : (
              <>
                {/* DESKTOP TABLE VIEW */}
                <div className="overflow-x-auto w-full">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Registration No</TableHead>
                        <TableHead className="whitespace-nowrap">Student Name</TableHead>
                        <TableHead className="whitespace-nowrap">Grade & Batch</TableHead>
                        <TableHead className="whitespace-nowrap">Payment Month</TableHead>
                        <TableHead className="whitespace-nowrap">Amount (LKR)</TableHead>
                        <TableHead className="whitespace-nowrap">Submitted At</TableHead>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="text-right whitespace-nowrap">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSubmissions.map((sub) => {
                        const studentRecord = students.find(
                          (s) => s.studentRegNo.toUpperCase() === sub.studentRegNo.toUpperCase()
                        );

                        return (
                          <TableRow key={sub.id} className="hover:bg-thofnaa-ivory/50 transition-colors">
                            <TableCell className="font-mono font-bold text-thofnaa-navy text-xs whitespace-nowrap">
                              {sub.studentRegNo}
                            </TableCell>

                            <TableCell className="font-serif font-semibold text-thofnaa-navy text-xs whitespace-nowrap">
                              {studentRecord?.fullName || sub.studentName}
                            </TableCell>

                            <TableCell className="text-xs whitespace-nowrap">
                              <span className="font-medium text-thofnaa-charcoal">
                                {studentRecord?.gradeLevel || "Grade 6 – 11"}
                              </span>
                              <span className="block text-[10px] text-thofnaa-charcoal-muted font-mono">
                                {studentRecord?.batch || "Second Language Sinhala"}
                              </span>
                            </TableCell>

                            <TableCell className="text-xs whitespace-nowrap">
                              <span className="font-medium">{sub.paymentMonth} {sub.academicYear}</span>
                            </TableCell>

                            <TableCell className="font-mono text-xs font-bold text-thofnaa-emerald whitespace-nowrap">
                              {formatLKR(sub.feeAmount)}
                            </TableCell>

                            <TableCell className="text-[11px] text-thofnaa-charcoal-muted font-mono whitespace-nowrap">
                              {new Date(sub.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </TableCell>

                            <TableCell className="whitespace-nowrap">
                              <StatusBadge status={sub.status as PaymentStatus} size="sm" />
                            </TableCell>

                            <TableCell className="text-right whitespace-nowrap">
                              <Link href={`/admin/payments/${sub.id}`}>
                                <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5 text-thofnaa-navy" />}>
                                  Review
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>

          {/* PAGINATION FOOTER */}
          {filteredSubmissions.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-thofnaa-charcoal-muted">
              <div>
                Showing <strong className="text-thofnaa-navy font-mono">{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
                <strong className="text-thofnaa-navy font-mono">
                  {Math.min(currentPage * itemsPerPage, filteredSubmissions.length)}
                </strong>{" "}
                of <strong className="text-thofnaa-navy font-mono">{filteredSubmissions.length}</strong> total submissions
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                    className="bg-white text-xs"
                  >
                    Prev
                  </Button>

                  <span className="font-mono text-xs px-2 text-thofnaa-navy font-semibold">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    className="bg-white text-xs"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
