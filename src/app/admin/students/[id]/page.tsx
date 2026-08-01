"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Lock, 
  Save, 
  GraduationCap, 
  Mail, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  UserCheck, 
  FileText 
} from "lucide-react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormError } from "@/components/ui/FormError";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge, PaymentStatus } from "@/components/ui/StatusBadge";
import { formatLKR } from "@/lib/utils";
import { INITIAL_STUDENTS, INITIAL_SUBMISSIONS } from "@/lib/mockData";
import { updateStudentAction } from "@/app/actions/updateStudentAction";

export default function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const studentId = resolvedParams.id;

  // Find Student Record
  const student = INITIAL_STUDENTS.find((s) => s.id === studentId) || INITIAL_STUDENTS[0];

  // Editable Form States
  const [guardianEmail, setGuardianEmail] = useState(student.guardianEmail);
  const [whatsappNumber, setWhatsappNumber] = useState(student.whatsappNumber);
  const [gradeLevel, setGradeLevel] = useState(student.gradeLevel);
  const [batch, setBatch] = useState(student.batch);
  const [programme, setProgramme] = useState(student.programme || "Second Language Sinhala");
  const [monthlyFeeLKR, setMonthlyFeeLKR] = useState(1000);
  const [active, setActive] = useState(true);

  // Status & Feedback States
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Filter Student Payment History Submissions
  const studentSubmissions = INITIAL_SUBMISSIONS.filter(
    (sub) => sub.studentRegNo.toUpperCase() === student.studentRegNo.toUpperCase()
  );

  const handleInitiateUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!guardianEmail.trim() || !whatsappNumber.trim()) {
      setActionError("Parent email address and WhatsApp number are required.");
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
      setActionSuccess(result.message || "Student profile updated and audit log recorded.");
    } else {
      setActionError(result.error || "Failed to update student profile.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Student Profile & Edit Content */}
      <div className="flex-1 space-y-8 min-w-0">
        <PageHeader
          title={`Student Profile: ${student.fullName}`}
          subtitle={`Registration Number: ${student.studentRegNo} • Enrolled in ${gradeLevel}`}
          badgeText="Student Management"
          action={
            <Link href="/admin/students">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Roster
              </Button>
            </Link>
          }
        />

        {/* READ-ONLY REGISTRATION NO GUARD BANNER */}
        <div className="p-4 rounded-2xl bg-thofnaa-navy text-white flex items-center justify-between border-2 border-thofnaa-gold">
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
            Student Registration Numbers are permanently locked to preserve audit integrity.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (7 cols): Edit Profile Form */}
          <div className="lg:col-span-7 space-y-6">
            <Card goldHeaderBorder className="shadow-md">
              <CardHeader className="bg-white border-b border-gray-100">
                <CardTitle className="text-base text-thofnaa-navy flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-thofnaa-gold" /> Update Student Details & Contact Info
                </CardTitle>
                <CardDescription>
                  Modify parent contact channels, grade level, batch module, and active account status.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleInitiateUpdate} className="space-y-4">
                  {/* Read-Only Student Name & Reg No Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-thofnaa-ivory p-4 rounded-xl border border-thofnaa-gold/30">
                    <div>
                      <label className="text-[10px] text-thofnaa-charcoal-muted font-mono uppercase block">Student Full Name</label>
                      <strong className="text-sm font-serif text-thofnaa-navy">{student.fullName}</strong>
                    </div>

                    <div>
                      <label className="text-[10px] text-thofnaa-charcoal-muted font-mono uppercase block">Parent / Guardian Name</label>
                      <strong className="text-sm text-thofnaa-navy">{student.guardianName}</strong>
                    </div>
                  </div>

                  {/* Contact Channels */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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
                      <span className="font-bold text-xs text-thofnaa-navy block">Student Status</span>
                      <span className="text-[11px] text-thofnaa-charcoal-muted">Active students are eligible for monthly payment submissions.</span>
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

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isUpdating}
                    leftIcon={<Save className="w-4 h-4" />}
                    className="w-full font-bold shadow-md mt-2"
                  >
                    Save Student Profile Changes
                  </Button>
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
            Are you sure you want to save modifications for student <strong className="font-serif text-thofnaa-navy">{student.fullName}</strong> (<code className="font-mono">{student.studentRegNo}</code>)?
          </p>

          <div className="p-3 rounded-xl bg-thofnaa-ivory border border-thofnaa-navy/20 space-y-1 font-mono">
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
    </div>
  );
}
