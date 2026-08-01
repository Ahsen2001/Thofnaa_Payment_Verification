"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Users, 
  Search, 
  Filter, 
  RotateCcw, 
  Eye, 
  Phone, 
  Mail, 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  Plus
} from "lucide-react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatLKR } from "@/lib/utils";
import { INITIAL_STUDENTS } from "@/lib/mockData";
import { THOFNAA_CONFIG } from "@/lib/constants";

export default function AdminStudentsPage() {
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter Roster Dataset
  const filteredStudents = useMemo(() => {
    return INITIAL_STUDENTS.filter((student) => {
      // 1. Search Query Filter (Reg No or Name)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesRegNo = student.studentRegNo.toLowerCase().includes(query);
        const matchesName = student.fullName.toLowerCase().includes(query);
        const matchesParent = student.guardianName.toLowerCase().includes(query);
        if (!matchesRegNo && !matchesName && !matchesParent) return false;
      }

      // 2. Grade Filter
      if (selectedGrade !== "All" && student.gradeLevel.toLowerCase() !== selectedGrade.toLowerCase()) {
        return false;
      }

      // 3. Batch Filter
      if (selectedBatch !== "All" && !student.batch?.toLowerCase().includes(selectedBatch.toLowerCase())) {
        return false;
      }

      // 4. Active/Inactive Status Filter
      if (selectedStatus === "Active") return true; // Mock students are all active
      if (selectedStatus === "Inactive") return false;

      return true;
    });
  }, [searchQuery, selectedGrade, selectedBatch, selectedStatus]);

  // Paginated Roster
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStudents.slice(start, start + itemsPerPage);
  }, [filteredStudents, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedGrade("All");
    setSelectedBatch("All");
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
          title="Student Roster & Profiles"
          subtitle="Manage student registrations, grade allocations, parent contact details, and tuition fees."
          badgeText="Student Directory"
          action={
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-thofnaa-navy text-white px-3 py-1.5 rounded-xl border border-thofnaa-gold/30">
                Total Enrolled: {INITIAL_STUDENTS.length}
              </span>
            </div>
          }
        />

        {/* SEARCH & FILTERS BAR CARD */}
        <Card goldHeaderBorder className="shadow-md">
          <CardHeader className="bg-white border-b border-gray-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="w-4 h-4 text-thofnaa-navy" /> Search & Filter Roster
                </CardTitle>
                <CardDescription>
                  Filter enrolled students by registration number, name, grade level, batch, or active status.
                </CardDescription>
              </div>

              {(searchQuery || selectedGrade !== "All" || selectedBatch !== "All" || selectedStatus !== "All") && (
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Search Bar */}
              <div className="lg:col-span-5">
                <Input
                  label="Search Student / Reg No / Parent"
                  placeholder="e.g. THF-26-0001 or Kasun"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>

              {/* Filters */}
              <div className="lg:col-span-7 grid grid-cols-3 gap-3">
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
                  label="Batch Module"
                  value={selectedBatch}
                  onChange={(e) => {
                    setSelectedBatch(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={["All", "Foundation", "Intermediate", "Senior"]}
                />

                <Select
                  label="Status"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={["All", "Active", "Inactive"]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* STUDENT ROSTER TABLE CARD */}
        <Card goldHeaderBorder className="shadow-md">
          <CardHeader className="bg-thofnaa-navy text-white flex flex-row items-center justify-between py-4">
            <div>
              <CardTitle className="text-white text-base">Enrolled Students List</CardTitle>
              <CardDescription className="text-thofnaa-gold text-xs">
                Showing {filteredStudents.length} student profiles
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {paginatedStudents.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title="No students match your criteria"
                  description="Try clearing your search query or grade/batch filters."
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
                      <TableHead>Grade</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Programme</TableHead>
                      <TableHead>Parent Name</TableHead>
                      <TableHead>WhatsApp</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Fee (LKR)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStudents.map((st) => (
                      <TableRow key={st.id} className="hover:bg-thofnaa-ivory/50 transition-colors">
                        <TableCell className="font-mono font-bold text-thofnaa-navy text-xs">
                          {st.studentRegNo}
                        </TableCell>

                        <TableCell className="font-serif font-semibold text-thofnaa-navy text-xs">
                          {st.fullName}
                        </TableCell>

                        <TableCell className="text-xs font-medium">
                          {st.gradeLevel}
                        </TableCell>

                        <TableCell className="text-xs text-thofnaa-charcoal">
                          {st.batch}
                        </TableCell>

                        <TableCell className="text-[11px] text-thofnaa-charcoal-muted truncate max-w-[140px]">
                          {st.programme}
                        </TableCell>

                        <TableCell className="text-xs text-thofnaa-charcoal">
                          {st.guardianName}
                        </TableCell>

                        <TableCell className="text-xs">
                          <a
                            href={`https://wa.me/${st.whatsappNumber.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-emerald-800 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Phone className="w-3 h-3 text-thofnaa-emerald" />
                            {st.whatsappNumber}
                          </a>
                        </TableCell>

                        <TableCell className="text-xs font-mono text-thofnaa-charcoal-muted truncate max-w-[150px]">
                          {st.guardianEmail}
                        </TableCell>

                        <TableCell className="font-mono text-xs font-bold text-thofnaa-emerald">
                          {formatLKR(1000)}
                        </TableCell>

                        <TableCell>
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                            <CheckCircle2 className="w-3 h-3 text-thofnaa-emerald" /> ACTIVE
                          </span>
                        </TableCell>

                        <TableCell className="text-right">
                          <Link href={`/admin/students/${st.id}`}>
                            <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5 text-thofnaa-navy" />}>
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          {/* PAGINATION FOOTER */}
          {filteredStudents.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-thofnaa-charcoal-muted">
              <div>
                Showing <strong className="text-thofnaa-navy font-mono">{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
                <strong className="text-thofnaa-navy font-mono">
                  {Math.min(currentPage * itemsPerPage, filteredStudents.length)}
                </strong>{" "}
                of <strong className="text-thofnaa-navy font-mono">{filteredStudents.length}</strong> total students
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
