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
  Check,
  UserPlus
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
import { getBatchForGrade } from "@/lib/programmes";
import { bulkImportStudentsAction, bulkEditStudentsAction, BulkStudentRowInput } from "@/app/actions/bulkStudentActions";
import { deleteStudentAction } from "@/app/actions/updateStudentAction";
import { getStoredStudents, deleteStoredStudent, addStoredStudents, saveStoredStudents } from "@/lib/studentStore";
import { clientEnv } from "@/lib/env";

export default function AdminStudentsPage() {
  // Persistent Student Roster State
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const loadData = async () => {
      let local = getStoredStudents();

      if (clientEnv.supabase.url && !clientEnv.supabase.url.includes("demo-thofnaa")) {
        try {
          const { createClient } = await import("@supabase/supabase-js");
          const supabase = createClient(clientEnv.supabase.url, clientEnv.supabase.anonKey);
          const { data, error } = await supabase.from("students").select("*");
          if (data && !error && data.length > 0) {
            const mapped: Student[] = data.map((d: any) => ({
              id: d.id,
              studentRegNo: d.student_reg_no,
              fullName: d.full_name,
              gradeLevel: d.grade_level,
              batch: d.batch,
              programme: d.programme || "Second Language Sinhala",
              guardianName: d.guardian_name,
              guardianEmail: d.guardian_email,
              guardianPhone: d.guardian_phone || d.whatsapp_number,
              whatsappNumber: d.whatsapp_number || d.guardian_phone,
              createdAt: d.created_at,
              active: d.active !== false,
            }));
            saveStoredStudents(mapped);
            local = mapped;
          } else if (data && data.length === 0 && local.length > 0) {
            const toInsert = local.map((s) => ({
              id: s.id,
              student_reg_no: s.studentRegNo,
              full_name: s.fullName,
              grade_level: s.gradeLevel,
              batch: s.batch,
              programme: s.programme || "Second Language Sinhala",
              guardian_name: s.guardianName,
              guardian_email: s.guardianEmail,
              guardian_phone: s.guardianPhone || s.whatsappNumber,
              whatsapp_number: s.whatsappNumber || s.guardianPhone,
              active: s.active !== false,
              created_at: s.createdAt || new Date().toISOString(),
            }));
            await supabase.from("students").insert(toInsert as any);
          }
        } catch (err) {
          console.warn("Supabase load students warning:", err);
        }
      }

      setStudents(local);
    };

    loadData();

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
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Add Single Student Form State
  const [newRegNo, setNewRegNo] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newGradeLevel, setNewGradeLevel] = useState("Grade 6");
  const [newBatch, setNewBatch] = useState("Foundation Sinhala");
  const [newProgramme, setNewProgramme] = useState("Second Language Sinhala");
  const [newGuardianName, setNewGuardianName] = useState("");
  const [newGuardianEmail, setNewGuardianEmail] = useState("");
  const [newWhatsappNumber, setNewWhatsappNumber] = useState("+94 ");
  const [newMonthlyFee, setNewMonthlyFee] = useState("1000");
  const [newStatus, setNewStatus] = useState("Active");

  const [addStudentError, setAddStudentError] = useState<string | null>(null);
  const [addStudentSuccess, setAddStudentSuccess] = useState<string | null>(null);
  const [isAddingStudent, setIsAddingStudent] = useState(false);

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

  // Auto update batch when grade changes in Add Modal
  const handleGradeChangeInAddModal = (grade: string) => {
    setNewGradeLevel(grade);
    const resolvedBatch = getBatchForGrade(grade);
    if (resolvedBatch) {
      setNewBatch(resolvedBatch.name);
    }
  };

  // Open Add Student Modal with auto-suggested Registration Number
  const handleOpenAddStudentModal = () => {
    setAddStudentError(null);
    setAddStudentSuccess(null);

    const currentRegNos = new Set(students.map((s) => s.studentRegNo.toUpperCase()));
    let nextNum = students.length + 1;
    let suggested = `THF-26-${String(nextNum).padStart(4, "0")}`;
    while (currentRegNos.has(suggested)) {
      nextNum++;
      suggested = `THF-26-${String(nextNum).padStart(4, "0")}`;
    }

    setNewRegNo(suggested);
    setNewFullName("");
    setNewGuardianName("");
    setNewGuardianEmail("");
    setNewWhatsappNumber("+94 ");
    setNewGradeLevel("Grade 6");
    setNewBatch("Foundation Sinhala");
    setNewProgramme("Second Language Sinhala");
    setNewMonthlyFee("1000");
    setNewStatus("Active");
    setIsAddStudentModalOpen(true);
  };

  // Execute Adding Single Student
  const handleExecuteAddStudent = () => {
    setAddStudentError(null);
    setAddStudentSuccess(null);

    const regNoFormatted = newRegNo.trim().toUpperCase();
    if (!regNoFormatted) {
      setAddStudentError("Registration number is required.");
      return;
    }

    if (!newFullName.trim()) {
      setAddStudentError("Student full name is required.");
      return;
    }

    if (!newGuardianEmail.trim() || !newGuardianEmail.includes("@")) {
      setAddStudentError("Valid parent email address is required.");
      return;
    }

    if (!newWhatsappNumber.trim() || newWhatsappNumber.trim().length < 8) {
      setAddStudentError("Valid WhatsApp contact number is required.");
      return;
    }

    // Check duplicate Registration Number
    const existing = students.find((s) => s.studentRegNo.toUpperCase() === regNoFormatted);
    if (existing) {
      setAddStudentError(`Registration number "${regNoFormatted}" already exists in the system.`);
      return;
    }

    setIsAddingStudent(true);

    const newStudentObj: Student = {
      id: `std-${Date.now()}`,
      studentRegNo: regNoFormatted,
      fullName: newFullName.trim(),
      gradeLevel: newGradeLevel,
      batch: newBatch,
      programme: newProgramme,
      guardianName: newGuardianName.trim() || "Parent / Guardian",
      guardianEmail: newGuardianEmail.trim().toLowerCase(),
      guardianPhone: newWhatsappNumber.trim(),
      whatsappNumber: newWhatsappNumber.trim(),
      active: newStatus === "Active",
      createdAt: new Date().toISOString(),
    };

    addStoredStudents([newStudentObj]);
    setIsAddingStudent(false);
    setAddStudentSuccess(`Student "${newStudentObj.fullName}" (${newStudentObj.studentRegNo}) added successfully!`);

    setTimeout(() => {
      setIsAddStudentModalOpen(false);
      setStudents(getStoredStudents());
    }, 1000);
  };

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
      if (selectedStatus === "Active" && student.active === false) return false;
      if (selectedStatus === "Inactive" && student.active !== false) return false;

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

    const existingRegNos = getStoredStudents().map((s) => s.studentRegNo.toUpperCase());
    const res = await bulkImportStudentsAction(parsedRows, existingRegNos);
    setIsSubmittingImport(false);

    if (res.success) {
      if (res.importedStudents && res.importedStudents.length > 0) {
        addStoredStudents(res.importedStudents);
      }
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
                onClick={handleOpenAddStudentModal}
                leftIcon={<UserPlus className="w-4 h-4" />}
                className="font-bold shadow-sm text-xs bg-thofnaa-navy hover:bg-thofnaa-navy-900"
              >
                Add New Student
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4 text-thofnaa-navy" />}
                className="font-bold shadow-sm text-xs bg-white text-thofnaa-navy border-thofnaa-gold"
              >
                Bulk CSV Import
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
                  title="No enrolled students in system"
                  description="Use 'Add New Student' to register a student manually, or import students via CSV."
                  action={
                    <Button variant="primary" size="sm" onClick={handleOpenAddStudentModal} leftIcon={<UserPlus className="w-4 h-4" />}>
                      Add First Student
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
                          {st.active !== false ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono whitespace-nowrap">
                              <CheckCircle2 className="w-3 h-3 text-thofnaa-emerald" /> ACTIVE
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-red-50 text-red-800 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono whitespace-nowrap">
                              <XCircle className="w-3 h-3 text-red-600" /> INACTIVE
                            </span>
                          )}
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

      {/* MODAL 0: ADD NEW SINGLE STUDENT */}
      <Modal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        title="Add New Student Record"
        description="Manually enter student details, registration number, parent email, and WhatsApp contact."
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setIsAddStudentModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isAddingStudent}
              onClick={handleExecuteAddStudent}
              leftIcon={<UserPlus className="w-4 h-4" />}
              className="bg-thofnaa-navy hover:bg-thofnaa-navy-900"
            >
              Add Student Record
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Registration Number (Manual Input)"
              placeholder="e.g. THF-26-0001"
              value={newRegNo}
              onChange={(e) => setNewRegNo(e.target.value)}
              helperText="Manually type or edit registration number."
              required
            />

            <Input
              label="Student Full Name"
              placeholder="e.g. Kasun Perera"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Grade Level"
              value={newGradeLevel}
              onChange={(e) => handleGradeChangeInAddModal(e.target.value)}
              options={["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"]}
            />

            <Select
              label="Batch Module"
              value={newBatch}
              onChange={(e) => setNewBatch(e.target.value)}
              options={["Foundation Sinhala", "Intermediate Sinhala", "Senior / O/L Sinhala"]}
            />

            <Select
              label="Programme"
              value={newProgramme}
              onChange={(e) => setNewProgramme(e.target.value)}
              options={["Second Language Sinhala"]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Parent / Guardian Name"
              placeholder="e.g. Sunil Perera"
              value={newGuardianName}
              onChange={(e) => setNewGuardianName(e.target.value)}
            />

            <Input
              label="Parent Email Address"
              type="email"
              placeholder="parent@example.com"
              value={newGuardianEmail}
              onChange={(e) => setNewGuardianEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="WhatsApp Contact Number"
              placeholder="+94 77 000 0001"
              value={newWhatsappNumber}
              onChange={(e) => setNewWhatsappNumber(e.target.value)}
              required
            />

            <Input
              label="Monthly Fee (LKR)"
              value={newMonthlyFee}
              onChange={(e) => setNewMonthlyFee(e.target.value)}
              disabled
            />

            <Select
              label="Account Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={["Active", "Inactive"]}
            />
          </div>

          {addStudentError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" /> {addStudentError}
            </div>
          )}

          {addStudentSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-thofnaa-emerald shrink-0" /> {addStudentSuccess}
            </div>
          )}
        </div>
      </Modal>

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
