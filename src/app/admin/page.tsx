"use client";

import React, { useState, useMemo } from "react";
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
  Download, 
  Calendar, 
  ShieldCheck, 
  GraduationCap 
} from "lucide-react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { MetricsCard } from "@/components/ui/MetricsCard";
import { StatusBadge, PaymentStatus } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatLKR } from "@/lib/utils";
import { INITIAL_SUBMISSIONS, INITIAL_STUDENTS } from "@/lib/mockData";
import { THOFNAA_CONFIG } from "@/lib/constants";

export default function AdminDashboardPage() {
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Compute KPI Metrics from Data
  const pendingCount = INITIAL_SUBMISSIONS.filter((s) => s.status === "PENDING").length;
  const verifiedMonthCount = INITIAL_SUBMISSIONS.filter((s) => s.status === "VERIFIED" && s.paymentMonth === "February").length;
  const clarificationCount = INITIAL_SUBMISSIONS.filter((s) => s.status === "CLARIFICATION_NEEDED").length;
  const rejectedCount = INITIAL_SUBMISSIONS.filter((s) => s.status === "REJECTED").length;
  const totalCollectedLKR = INITIAL_SUBMISSIONS
    .filter((s) => s.status === "VERIFIED")
    .reduce((sum, s) => sum + s.feeAmount, 0);
  const totalActiveStudents = INITIAL_STUDENTS.length;

  // Filter Submissions Dataset
  const filteredSubmissions = useMemo(() => {
    return INITIAL_SUBMISSIONS.filter((item) => {
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
  }, [searchQuery, selectedMonth, selectedYear, selectedStatus]);

  // Paginated Results
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage) || 1;
  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSubmissions.slice(start, start + itemsPerPage);
  }, [filteredSubmissions, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedMonth("All");
    setSelectedYear("All");
    setSelectedGrade("All");
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
          subtitle="Real-time tuition payment verification queue, student roster statistics, and revenue tracking."
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

        {/* 6 KPI DASHBOARD CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricsCard
            title="Pending Payments"
            value={pendingCount}
            changeText="Requires Admin Action"
            changeType="warning"
            icon={<Clock className="w-6 h-6 text-amber-600" />}
          />

          <MetricsCard
            title="Verified This Month"
            value={verifiedMonthCount}
            changeText="February 2026 Approved"
            changeType="positive"
            icon={<CheckCircle2 className="w-6 h-6 text-thofnaa-emerald" />}
          />

          <MetricsCard
            title="Needs Clarification"
            value={clarificationCount}
            changeText="Waiting Parent Re-upload"
            changeType="warning"
            icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
          />

          <MetricsCard
            title="Rejected Submissions"
            value={rejectedCount}
            changeText="Invalid Bank Receipts"
            changeType="negative"
            icon={<XCircle className="w-6 h-6 text-red-600" />}
          />

          <MetricsCard
            title="Total Revenue Collected"
            value={formatLKR(totalCollectedLKR)}
            changeText="Verified Bank Deposits"
            changeType="positive"
            icon={<Wallet className="w-6 h-6 text-thofnaa-gold" />}
          />

          <MetricsCard
            title="Enrolled Active Students"
            value={`${totalActiveStudents} Active`}
            changeText="Grades 6 – 11 Roster"
            changeType="neutral"
            icon={<Users className="w-6 h-6 text-thofnaa-navy" />}
          />
        </div>

        {/* SEARCH & FILTERS PANEL CARD */}
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

              {(searchQuery || selectedMonth !== "All" || selectedYear !== "All" || selectedGrade !== "All" || selectedStatus !== "All") && (
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Registration No</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Grade & Batch</TableHead>
                      <TableHead>Payment Month</TableHead>
                      <TableHead>Amount (LKR)</TableHead>
                      <TableHead>Submitted At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSubmissions.map((sub) => {
                      const studentRecord = INITIAL_STUDENTS.find(
                        (s) => s.studentRegNo.toUpperCase() === sub.studentRegNo.toUpperCase()
                      );

                      return (
                        <TableRow key={sub.id} className="hover:bg-thofnaa-ivory/50 transition-colors">
                          <TableCell className="font-mono font-bold text-thofnaa-navy text-xs">
                            {sub.studentRegNo}
                          </TableCell>

                          <TableCell className="font-serif font-semibold text-thofnaa-navy text-xs">
                            {sub.studentName}
                          </TableCell>

                          <TableCell className="text-xs">
                            <span className="font-medium text-thofnaa-charcoal">
                              {studentRecord?.gradeLevel || "Grade 6 – 11"}
                            </span>
                            <span className="block text-[10px] text-thofnaa-charcoal-muted font-mono">
                              {studentRecord?.batch || "Second Language Sinhala"}
                            </span>
                          </TableCell>

                          <TableCell className="text-xs">
                            <span className="font-medium">{sub.paymentMonth} {sub.academicYear}</span>
                          </TableCell>

                          <TableCell className="font-mono text-xs font-bold text-thofnaa-emerald">
                            {formatLKR(sub.feeAmount)}
                          </TableCell>

                          <TableCell className="text-[11px] text-thofnaa-charcoal-muted font-mono">
                            {new Date(sub.createdAt).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>

                          <TableCell>
                            <StatusBadge status={sub.status as PaymentStatus} size="sm" />
                          </TableCell>

                          <TableCell className="text-right">
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
            )}
          </CardContent>

          {/* SERVER-SIDE / PAGINATION FOOTER */}
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
