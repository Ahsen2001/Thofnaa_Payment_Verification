"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Plus,
  Upload,
  Edit3,
  Trash2,
  AlertTriangle,
  FileSpreadsheet,
  Check
} from "lucide-react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { formatLKR } from "@/lib/utils";
import { Student } from "@/lib/mockData";
import { bulkImportStudentsAction, bulkEditStudentsAction, BulkStudentRowInput } from "@/app/actions/bulkStudentActions";
import { deleteStudentAction } from "@/app/actions/updateStudentAction";
import { getStoredStudents, deleteStoredStudent, addStoredStudents, saveStoredStudents } from "@/lib/studentStore";

export default function AdminStudentsPage() {
  // Persistent Student Roster State
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    setStudents(getStoredStudents());

    const handleUpdate = () => {
      setStudents(getStoredStudents());
    };

    window.addEventListener("thofnaa_students_updated", handleUpdate);
    return () => window.removeEventListener("thofnaa_students_updated", handleUpdate);
  }, []);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Selection State for Bulk Editing
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Modal States
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Bulk Import Form State
  const [csvText, setCsvText] = useState("");
  const [isSubmittingImport, setIsSubmittingImport] = useState(false);
  const [importResult, setImportResult] = useState<{ count?: number; errors?: string[] } | null>(null);

  // Bulk Edit Form State
  const [bulkEditGrade, setBulkEditGrade] = useState("Keep Same");
  const [bulkEditBatch, setBulkEditBatch] = useState("Keep Same");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editSuccessMessage, setEditSuccessMessage] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter Roster Dataset
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
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
      if (selectedStatus === "Active") return true;
      if (selectedStatus === "Inactive") return false;

      return true;
    });
  }, [students, searchQuery, selectedGrade, selectedBatch, selectedStatus]);

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

  // Toggle selection for individual student
  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle select all on current page
  const toggleSelectAllPage = () => {
    const pageIds = paginatedStudents.map((s) => s.id);
    const allSelected = pageIds.every((id) => selectedStudentIds.includes(id));

    if (allSelected) {
      setSelectedStudentIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  // Handle Delete Single Student Execution
  const handleExecuteDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    const targetId = studentToDelete.id;

    // 1. Delete persistently from localStorage
    deleteStoredStudent(targetId);

    // 2. Trigger server action for Audit Logging & DB cleanup
    await deleteStudentAction(targetId);

    // 3. Update component state
    setStudents(getStoredStudents());
    setSelectedStudentIds((prev) => prev.filter((id) => id !== targetId));
    setIsDeleting(false);
    setStudentToDelete(null);
  };

  // Handle CSV Parsing and Bulk Import
  const handleProcessCsvImport = async () => {
    if (!csvText.trim()) return;

    setIsSubmittingImport(true);
    setImportResult(null);

    const lines = csvText.trim().split("\n");
    const parsedRows: BulkStudentRowInput[] = [];

    lines.forEach((line) => {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 3 && !line.toLowerCase().includes("full name")) {
        parsedRows.push({
          fullName: parts[0] || "New Student",
          gradeLevel: parts[1] || "Grade 6",
          guardianEmail: parts[2] || "parent@example.com",
          whatsappNumber: parts[3] || "+94 77 000 0000",
          guardianName: parts[4] || "Parent",
          studentRegNo: parts[5] || undefined,
        });
      }
    });

    if (parsedRows.length === 0) {
      setImportResult({ errors: ["No valid student lines detected. Format: Full Name, Grade, Email, WhatsApp."] });
      setIsSubmittingImport(false);
      return;
    }

    const res = await bulkImportStudentsAction(parsedRows);
    setIsSubmittingImport(false);

    if (res.success) {
      setImportResult({ count: res.importedCount, errors: res.errors });
      setCsvText("");
      setStudents(getStoredStudents());
    } else {
      setImportResult({ errors: res.errors });
    }
  };

  // Handle Bulk Edit Execution
  const handleExecuteBulkEdit = async () => {
    if (selectedStudentIds.length === 0) return;

    setIsSubmittingEdit(true);
    const res = await bulkEditStudentsAction({
      studentIds: selectedStudentIds,
      gradeLevel: bulkEditGrade,
      batch: bulkEditBatch,
    });
    setIsSubmittingEdit(false);

    if (res.success) {
      setEditSuccessMessage(res.message || "Students updated successfully.");
      setStudents(getStoredStudents());

      setTimeout(() => {
        setIsBulkEditModalOpen(false);
        setEditSuccessMessage(null);
        setSelectedStudentIds([]);
      }, 1000);
    }
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
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsImportModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                className="font-bold shadow-sm text-xs"
              >
                Bulk Import Students
              </Button>

              {selectedStudentIds.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBulkEditModalOpen(true)}
                  leftIcon={<Edit3 className="w-4 h-4 text-thofnaa-navy" />}
                  className="font-bold text-xs bg-white text-thofnaa-navy border-thofnaa-gold"
                >
                  Edit Selected ({selectedStudentIds.length})
                </Button>
              )}

              <span className="text-xs font-mono font-bold bg-thofnaa-navy text-white px-3 py-1.5 rounded-xl border border-thofnaa-gold/30">
                Total Enrolled: {students.length}
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
        <Card goldHeaderBorder className="shadow-md overflow-hidden">
          <CardHeader className="bg-thofnaa-navy text-white flex flex-row items-center justify-between py-4">
            <div>
              <CardTitle className="text-white text-base">Enrolled Students List</CardTitle>
              <CardDescription className="text-thofnaa-gold text-xs">
                Showing {filteredStudents.length} student profiles {selectedStudentIds.length > 0 && `• (${selectedStudentIds.length} selected)`}
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
              <div className="overflow-x-auto w-full">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={
                            paginatedStudents.length > 0 &&
                            paginatedStudents.every((s) => selectedStudentIds.includes(s.id))
                          }
                          onChange={toggleSelectAllPage}
                          className="rounded border-gray-300 text-thofnaa-navy focus:ring-thofnaa-gold cursor-pointer"
                          aria-label="Select all on page"
                        />
                      </TableHead>
                      <TableHead className="whitespace-nowrap">Registration No</TableHead>
                      <TableHead className="whitespace-nowrap">Student Name</TableHead>
                      <TableHead className="whitespace-nowrap">Grade</TableHead>
                      <TableHead className="whitespace-nowrap">Batch</TableHead>
                      <TableHead className="whitespace-nowrap">Programme</TableHead>
                      <TableHead className="whitespace-nowrap">Parent Name</TableHead>
                      <TableHead className="whitespace-nowrap">WhatsApp</TableHead>
                      <TableHead className="whitespace-nowrap">Email</TableHead>
                      <TableHead className="whitespace-nowrap">Fee (LKR)</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedStudents.map((st) => (
                      <TableRow 
                        key={st.id} 
                        className={`hover:bg-thofnaa-ivory/50 transition-colors ${selectedStudentIds.includes(st.id) ? "bg-amber-50/60" : ""}`}
                      >
                        <TableCell className="whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.includes(st.id)}
                            onChange={() => toggleSelectStudent(st.id)}
                            className="rounded border-gray-300 text-thofnaa-navy focus:ring-thofnaa-gold cursor-pointer"
                            aria-label={`Select student ${st.studentRegNo}`}
                          />
                        </TableCell>

                        <TableCell className="font-mono font-bold text-thofnaa-navy text-xs whitespace-nowrap">
                          {st.studentRegNo}
                        </TableCell>

                        <TableCell className="font-serif font-semibold text-thofnaa-navy text-xs whitespace-nowrap">
                          {st.fullName}
                        </TableCell>

                        <TableCell className="text-xs font-medium whitespace-nowrap">
                          {st.gradeLevel}
                        </TableCell>

                        <TableCell className="text-xs text-thofnaa-charcoal whitespace-nowrap">
                          {st.batch}
                        </TableCell>

                        <TableCell className="text-[11px] text-thofnaa-charcoal-muted whitespace-nowrap">
                          {st.programme}
                        </TableCell>

                        <TableCell className="text-xs text-thofnaa-charcoal whitespace-nowrap">
                          {st.guardianName}
                        </TableCell>

                        <TableCell className="text-xs whitespace-nowrap">
                          <a
                            href={`https://wa.me/${st.whatsappNumber.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-emerald-800 hover:underline inline-flex items-center gap-1 font-semibold whitespace-nowrap"
                          >
                            <Phone className="w-3 h-3 text-thofnaa-emerald shrink-0" />
                            <span>{st.whatsappNumber}</span>
                          </a>
                        </TableCell>

                        <TableCell className="text-xs font-mono text-thofnaa-charcoal-muted whitespace-nowrap">
                          {st.guardianEmail}
                        </TableCell>

                        <TableCell className="font-mono text-xs font-bold text-thofnaa-emerald whitespace-nowrap">
                          {formatLKR(1000)}
                        </TableCell>

                        <TableCell className="whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono whitespace-nowrap">
                            <CheckCircle2 className="w-3 h-3 text-thofnaa-emerald" /> ACTIVE
                          </span>
                        </TableCell>

                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link href={`/admin/students/${st.id}`}>
                              <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5 text-thofnaa-navy" />}>
                                Edit
                              </Button>
                            </Link>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setStudentToDelete(st)}
                              aria-label={`Delete student ${st.studentRegNo}`}
                              className="text-red-600 border-red-200 hover:bg-red-50 p-2"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            </Button>
                          </div>
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

      {/* MODAL 1: BULK IMPORT STUDENTS */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false);
          setImportResult(null);
        }}
        title="Bulk Import Students"
        description="Add multiple student profiles by pasting CSV data or typing student records."
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmittingImport}
              onClick={handleProcessCsvImport}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Process Import
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-thofnaa-navy">
              <FileSpreadsheet className="w-4 h-4 text-thofnaa-navy" /> Format Instructions (CSV):
            </div>
            <p className="font-mono text-[11px] bg-white p-2 rounded border border-blue-200 text-thofnaa-charcoal">
              Full Name, Grade Level, Parent Email, WhatsApp Number, [Parent Name], [Reg No]
            </p>
            <p className="text-[11px] text-gray-600">
              * Registration numbers will be auto-generated (e.g. THF-26-0007) if left empty.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-thofnaa-navy uppercase tracking-wider">
              Paste Student CSV Records:
            </label>
            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`Kasun Perera, Grade 6, parent.kasun@example.com, +94 77 111 0001\nDilini Fernando, Grade 8, parent.dilini@example.com, +94 71 222 0002`}
              className="w-full p-3 font-mono text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-thofnaa-navy focus:outline-none"
            />
          </div>

          {importResult && (
            <div className={`p-3.5 rounded-xl border text-xs ${importResult.errors && importResult.errors.length > 0 ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-emerald-50 border-emerald-200 text-emerald-900"}`}>
              {importResult.count !== undefined && (
                <div className="font-bold flex items-center gap-1.5 text-emerald-800 mb-1">
                  <Check className="w-4 h-4 text-thofnaa-emerald" /> Successfully imported {importResult.count} student(s)!
                </div>
              )}
              {importResult.errors && importResult.errors.length > 0 && (
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-800 font-mono">
                  {importResult.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL 2: BULK EDIT SELECTED STUDENTS */}
      <Modal
        isOpen={isBulkEditModalOpen}
        onClose={() => {
          setIsBulkEditModalOpen(false);
          setEditSuccessMessage(null);
        }}
        title={`Bulk Edit ${selectedStudentIds.length} Selected Student(s)`}
        description="Mass update grade levels or batch allocations for all selected student records at once."
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsBulkEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmittingEdit}
              onClick={handleExecuteBulkEdit}
              leftIcon={<Edit3 className="w-4 h-4" />}
            >
              Apply Bulk Updates
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            Updating <strong>{selectedStudentIds.length}</strong> selected student record(s). Leave fields as "Keep Same" to retain existing values.
          </div>

          <Select
            label="Mass Change Grade Level"
            value={bulkEditGrade}
            onChange={(e) => setBulkEditGrade(e.target.value)}
            options={["Keep Same", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"]}
          />

          <Select
            label="Mass Change Batch Module"
            value={bulkEditBatch}
            onChange={(e) => setBulkEditBatch(e.target.value)}
            options={["Keep Same", "Foundation Sinhala", "Intermediate Sinhala", "Senior / O/L Sinhala"]}
          />

          {editSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-thofnaa-emerald" /> {editSuccessMessage}
            </div>
          )}
        </div>
      </Modal>

      {/* MODAL 3: DELETE SINGLE STUDENT */}
      <Modal
        isOpen={!!studentToDelete}
        onClose={() => setStudentToDelete(null)}
        title="Delete Student Record"
        description="Permanently remove student registration from the institute database."
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Warning: Permanent Deletion</strong>
              Are you sure you want to delete student profile <strong className="font-serif text-thofnaa-navy">{studentToDelete?.fullName}</strong> (<code className="font-mono">{studentToDelete?.studentRegNo}</code>)?
            </div>
          </div>

          <p className="text-thofnaa-charcoal-muted">
            This action will remove the student record. An immutable audit log entry (<code className="font-mono">DELETE_STUDENT_RECORD</code>) will be recorded.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" size="sm" onClick={() => setStudentToDelete(null)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              isLoading={isDeleting}
              onClick={handleExecuteDeleteStudent} 
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Permanently Delete Student
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
