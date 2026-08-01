"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Lock, 
  Save, 
  GraduationCap, 
  Mail, 
  Phone, 
  CheckCircle2, 
  UserCheck, 
  FileText,
  Trash2,
  AlertTriangle,
  User
} from "lucide-react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormError } from "@/components/ui/FormError";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge, PaymentStatus } from "@/components/ui/StatusBadge";
import { formatLKR } from "@/lib/utils";
import { INITIAL_STUDENTS, INITIAL_SUBMISSIONS } from "@/lib/mockData";
import { updateStudentAction, deleteStudentAction } from "@/app/actions/updateStudentAction";

export default function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;

  // Find Student Record
  const student = INITIAL_STUDENTS.find((s) => s.id === studentId) || INITIAL_STUDENTS[0];

  // Editable Form States
  const [fullName, setFullName] = useState(student.fullName.replace(/\[.*?\]\s*/g, ""));
  const [guardianName, setGuardianName] = useState(student.guardianName.replace(/\[.*?\]\s*/g, ""));
  const [guardianEmail, setGuardianEmail] = useState(student.guardianEmail);
  const [whatsappNumber, setWhatsappNumber] = useState(student.whatsappNumber);
  const [gradeLevel, setGradeLevel] = useState(student.gradeLevel);
  const [batch, setBatch] = useState(student.batch);
  const [programme, setProgramme] = useState(student.programme || "Second Language Sinhala");
  const [monthlyFeeLKR, setMonthlyFeeLKR] = useState(1000);
  const [active, setActive] = useState(true);

  // Status & Feedback States
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Filter Student Payment History Submissions
  const studentSubmissions = INITIAL_SUBMISSIONS.filter(
    (sub) => sub.studentRegNo.toUpperCase() === student.studentRegNo.toUpperCase()
  );

  const handleInitiateUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!fullName.trim() || !guardianEmail.trim() || !whatsappNumber.trim()) {
      setActionError("Student name, parent email address, and WhatsApp number are required.");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleExecuteConfirmedUpdate = async () => {
    setIsConfirmModalOpen(false);
    setIsUpdating(true);
    setActionError(null);

    const result = await updateStudentAction({
      studentId: student.id,
      fullName,
      guardianName,
      guardianEmail,
      whatsappNumber,
      gradeLevel,
      batch,
      programme,
      monthlyFeeLKR,
      active,
    });

    setIsUpdating(false);

    if (result.success) {
      // Sync client-side in-memory mock record so roster page updates immediately
      const clientTarget = INITIAL_STUDENTS.find((s) => s.id === student.id);
      if (clientTarget) {
        clientTarget.fullName = fullName.trim();
        clientTarget.guardianName = guardianName.trim();
        clientTarget.guardianEmail = guardianEmail.trim().toLowerCase();
        clientTarget.whatsappNumber = whatsappNumber.trim();
        clientTarget.guardianPhone = whatsappNumber.trim();
        clientTarget.gradeLevel = gradeLevel;
        clientTarget.batch = batch;
        clientTarget.programme = programme;
      }
      setActionSuccess(result.message || "Student profile updated and audit log recorded.");
    } else {
      setActionError(result.error || "Failed to update student profile.");
    }
  };

  const handleExecuteDelete = async () => {
    setIsDeleteModalOpen(false);
    setIsDeleting(true);

    const result = await deleteStudentAction(student.id);
    setIsDeleting(false);

    if (result.success) {
      router.push("/admin/students");
    } else {
      setActionError(result.error || "Failed to delete student record.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Student Profile & Edit Content */}
      <div className="flex-1 space-y-8 min-w-0">
        <PageHeader
          title={`Student Profile: ${fullName}`}
          subtitle={`Registration Number: ${student.studentRegNo} • Enrolled in ${gradeLevel}`}
          badgeText="Student Management"
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteModalOpen(true)}
                leftIcon={<Trash2 className="w-4 h-4 text-red-600" />}
                className="text-xs text-red-600 border-red-200 hover:bg-red-50 font-bold"
              >
                Delete Student
              </Button>

              <Link href="/admin/students">
                <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Roster
                </Button>
              </Link>
            </div>
          }
        />

        {/* READ-ONLY REGISTRATION NO GUARD BANNER */}
        <div className="p-4 rounded-2xl bg-thofnaa-navy text-white flex items-center justify-between border-2 border-thofnaa-gold shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-thofnaa-gold text-thofnaa-navy flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-thofnaa-gold font-mono uppercase tracking-wider block">
                Immutable Registration Number
              </span>
              <strong className="text-lg font-mono text-white">{student.studentRegNo}</strong>
            </div>
          </div>
          <span className="text-xs text-thofnaa-ivory/80 hidden sm:inline-block font-serif">
            Registration Numbers are permanently locked to preserve audit integrity.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (7 cols): Edit Profile Form */}
          <div className="lg:col-span-7 space-y-6">
            <Card goldHeaderBorder className="shadow-md">
              <CardHeader className="bg-white border-b border-gray-100">
                <CardTitle className="text-base text-thofnaa-navy flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-thofnaa-gold" /> Edit Student Details & Contact Info
                </CardTitle>
                <CardDescription>
                  Modify student name, parent contact channels, grade level, batch module, and active account status.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleInitiateUpdate} className="space-y-4">
                  {/* Editable Student Name & Parent Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Student Full Name *"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      leftIcon={<User className="w-4 h-4 text-thofnaa-navy" />}
                      required
                    />

                    <Input
                      label="Parent / Guardian Name *"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      leftIcon={<User className="w-4 h-4 text-thofnaa-navy" />}
                      required
                    />
                  </div>

                  {/* Contact Channels */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Parent Email Address *"
                      type="email"
                      value={guardianEmail}
                      onChange={(e) => setGuardianEmail(e.target.value)}
                      leftIcon={<Mail className="w-4 h-4" />}
                      required
                    />

                    <Input
                      label="Parent WhatsApp Number *"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      leftIcon={<Phone className="w-4 h-4" />}
                      required
                    />
                  </div>

                  {/* Academic Allocation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Grade Level *"
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      options={["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"]}
                    />

                    <Select
                      label="Batch Module *"
                      value={batch}
                      onChange={(e) => setBatch(e.target.value)}
                      options={["Foundation Sinhala", "Intermediate Sinhala", "Senior / O/L Sinhala"]}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Programme Name *"
                      value={programme}
                      onChange={(e) => setProgramme(e.target.value)}
                      leftIcon={<GraduationCap className="w-4 h-4" />}
                      required
                    />

                    <Input
                      label="Monthly Tuition Fee (LKR) *"
                      type="number"
                      value={monthlyFeeLKR}
                      onChange={(e) => setMonthlyFeeLKR(Number(e.target.value))}
                      required
                    />
                  </div>

                  {/* Active / Inactive Status Toggle */}
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-thofnaa-navy block">Student Account Status</span>
                      <span className="text-[11px] text-thofnaa-charcoal-muted">Active students can submit monthly tuition payments.</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="studentActive"
                          checked={active === true}
                          onChange={() => setActive(true)}
                          className="accent-thofnaa-emerald"
                        />
                        <span className="font-bold text-thofnaa-emerald">Active</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="studentActive"
                          checked={active === false}
                          onChange={() => setActive(false)}
                          className="accent-red-600"
                        />
                        <span className="font-bold text-red-600">Inactive</span>
                      </label>
                    </div>
                  </div>

                  <FormError message={actionError} />
                  {actionSuccess && (
                    <Alert variant="success" title="Profile Saved">
                      {actionSuccess}
                    </Alert>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={isUpdating}
                      leftIcon={<Save className="w-4 h-4" />}
                      className="flex-1 font-bold shadow-md"
                    >
                      Save Profile Changes
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setIsDeleteModalOpen(true)}
                      leftIcon={<Trash2 className="w-4 h-4 text-red-600" />}
                      className="text-red-600 border-red-200 hover:bg-red-50 font-bold"
                    >
                      Delete Student
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (5 cols): Payment History Roster */}
          <div className="lg:col-span-5 space-y-6">
            <Card goldHeaderBorder className="shadow-md">
              <CardHeader className="bg-thofnaa-navy text-white flex flex-row items-center justify-between py-4">
                <div>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-thofnaa-gold" /> Payment Submission History
                  </CardTitle>
                  <CardDescription className="text-thofnaa-gold text-xs">
                    Recorded payment submissions for {student.studentRegNo}.
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-0 divide-y divide-gray-100">
                {studentSubmissions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-thofnaa-charcoal-muted font-mono">
                    No payment submissions recorded for this student yet.
                  </div>
                ) : (
                  studentSubmissions.map((sub) => (
                    <div key={sub.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="font-semibold text-thofnaa-navy block">
                          {sub.paymentMonth} {sub.academicYear}
                        </span>
                        <span className="font-mono text-[11px] text-thofnaa-emerald font-bold">
                          {formatLKR(sub.feeAmount)}
                        </span>
                      </div>

                      <div className="text-right space-y-1">
                        <StatusBadge status={sub.status as PaymentStatus} size="sm" />
                        {sub.paymentRef && (
                          <span className="block font-mono text-[10px] text-thofnaa-navy font-bold">
                            {sub.paymentRef}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* UPDATE CONFIRMATION MODAL */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Student Profile Update"
      >
        <div className="space-y-4 text-xs">
          <p className="text-thofnaa-charcoal leading-relaxed">
            Are you sure you want to save modifications for student <strong className="font-serif text-thofnaa-navy">{fullName}</strong> (<code className="font-mono">{student.studentRegNo}</code>)?
          </p>

          <div className="p-3 rounded-xl bg-thofnaa-ivory border border-thofnaa-navy/20 space-y-1 font-mono">
            <div>Student Name: <strong>{fullName}</strong></div>
            <div>Parent Name: <strong>{guardianName}</strong></div>
            <div>Parent Email: <strong>{guardianEmail}</strong></div>
            <div>WhatsApp: <strong>{whatsappNumber}</strong></div>
            <div>Grade: <strong>{gradeLevel}</strong> ({batch})</div>
            <div>Status: <strong className={active ? "text-thofnaa-emerald" : "text-red-600"}>{active ? "ACTIVE" : "INACTIVE"}</strong></div>
          </div>

          <p className="text-gray-400 text-[11px]">
            🔒 Saving this update will create an immutable record in <code className="font-mono">audit_logs</code>.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" size="sm" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleExecuteConfirmedUpdate} className="font-bold">
              Confirm & Save Profile
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Student Record"
        description="Permanently remove student registration from the institute database."
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Warning: Permanent Deletion</strong>
              Are you sure you want to delete student profile <strong className="font-serif text-thofnaa-navy">{fullName}</strong> (<code className="font-mono">{student.studentRegNo}</code>)?
            </div>
          </div>

          <p className="text-thofnaa-charcoal-muted">
            This action will remove the student record. An immutable audit log entry (<code className="font-mono">DELETE_STUDENT_RECORD</code>) will be recorded.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              isLoading={isDeleting}
              onClick={handleExecuteDelete} 
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
