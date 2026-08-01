"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  Eye, 
  Download, 
  Mail, 
  Phone, 
  GraduationCap, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Lock,
  ExternalLink,
  MessageSquareText,
  Loader2
} from "lucide-react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge, PaymentStatus } from "@/components/ui/StatusBadge";
import { FormError } from "@/components/ui/FormError";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { formatLKR } from "@/lib/utils";
import { INITIAL_SUBMISSIONS, INITIAL_STUDENTS, PaymentSubmission, Student } from "@/lib/mockData";
import { updatePaymentStatusAction } from "@/app/actions/updatePaymentStatusAction";
import { resendPaymentConfirmationEmailAction } from "@/app/actions/verifyPaymentWorkflowAction";
import { getStoredSubmissions, getStoredStudents, updateStoredSubmission } from "@/lib/studentStore";

export default function AdminPaymentDetailStudioPage() {
  const router = useRouter();
  const routeParams = useParams();
  const paymentId = (routeParams?.id as string) || "";

  // Submission and student loaded asynchronously on mount
  const [submission, setSubmission] = useState<PaymentSubmission | null>(null);
  const [studentRecord, setStudentRecord] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Local Component States
  const [currentStatus, setCurrentStatus] = useState<PaymentStatus>("PENDING");
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState<string>("");
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal Confirmation State
  const [pendingDecision, setPendingDecision] = useState<"VERIFIED" | "NEEDS_CLARIFICATION" | "REJECTED" | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    const subs = getStoredSubmissions();
    const foundSub = subs.find((s) => s.id === paymentId) || INITIAL_SUBMISSIONS.find((s) => s.id === paymentId) || null;
    
    if (foundSub) {
      setSubmission(foundSub);
      setCurrentStatus(foundSub.status as PaymentStatus);
      setPaymentRef(foundSub.paymentRef || null);
      setAdminNote(foundSub.rejectionReason || foundSub.adminNotes || "");

      const students = getStoredStudents();
      const foundStudent = students.find(
        (s) => s.studentRegNo.toUpperCase() === foundSub.studentRegNo.toUpperCase()
      ) || INITIAL_STUDENTS.find(
        (s) => s.studentRegNo.toUpperCase() === foundSub.studentRegNo.toUpperCase()
      ) || null;

      setStudentRecord(foundStudent);
    }
    setIsLoading(false);
  }, [paymentId]);

  if (isLoading) {
    return (
      <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3 text-thofnaa-charcoal-muted">
            <Loader2 className="w-8 h-8 animate-spin text-thofnaa-navy" />
            <span className="text-sm font-mono">Loading payment details…</span>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4 max-w-sm">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-thofnaa-navy font-serif">Submission Not Found</h2>
              <p className="text-xs text-thofnaa-charcoal-muted mt-1">
                No payment submission record exists for ID <code className="font-mono bg-gray-100 px-1 rounded">{paymentId}</code>.
              </p>
            </div>
            <Link href="/admin/payments">
              <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} className="mt-2">
                Back to Payment Verification Roster
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPdfFile = submission.proofFileName?.toLowerCase().endsWith(".pdf") || false;
  const proofPreviewUrl = submission.proofUrl;

  const handleInitiateDecision = (decision: "VERIFIED" | "NEEDS_CLARIFICATION" | "REJECTED") => {
    setActionError(null);
    setActionSuccess(null);

    if ((decision === "REJECTED" || decision === "NEEDS_CLARIFICATION") && !adminNote.trim()) {
      setActionError(`An administrator note/reason is strictly required when marking a payment as "${decision.replace("_", " ")}".`);
      return;
    }

    setPendingDecision(decision);
    setIsConfirmModalOpen(true);
  };

  const handleExecuteConfirmedDecision = async () => {
    if (!pendingDecision || !submission) return;

    setIsConfirmModalOpen(false);
    setIsUpdating(true);
    setActionError(null);

    const result = await updatePaymentStatusAction({
      paymentId: submission.id,
      status: pendingDecision,
      adminNote,
    });

    setIsUpdating(false);

    if (result.success) {
      setCurrentStatus(pendingDecision as PaymentStatus);
      if (result.paymentRef) {
        setPaymentRef(result.paymentRef);
      }
      updateStoredSubmission(
        submission.id,
        pendingDecision as "VERIFIED" | "REJECTED" | "CLARIFICATION_NEEDED",
        result.paymentRef || paymentRef || undefined,
        adminNote,
        adminNote
      );
      setActionSuccess(result.message || `Payment status updated to ${pendingDecision}.`);
    } else {
      setActionError(result.error || "Failed to update payment status.");
    }
  };

  const handleResendEmail = async () => {
    if (!submission) return;
    setIsResendingEmail(true);
    setActionError(null);
    setActionSuccess(null);

    const result = await resendPaymentConfirmationEmailAction({ paymentId: submission.id });
    setIsResendingEmail(false);

    if (result.success) {
      setActionSuccess(result.message || "Confirmation email successfully resent to parent.");
    } else {
      setActionError(result.error || "Failed to resend confirmation email.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
      {/* Admin Navigation Sidebar */}
      <AdminSidebar />

      {/* Main Payment Studio Content */}
      <div className="flex-1 space-y-8 min-w-0">
        <PageHeader
          title={`Review Submission: ${submission.studentRegNo}`}
          subtitle="Detailed student registration profile, payment proof receipt inspection, and decision workflow."
          badgeText="Verification Studio"
          action={
            <div className="flex items-center gap-2">
              {currentStatus === "VERIFIED" && (
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isResendingEmail}
                  onClick={handleResendEmail}
                  leftIcon={<Mail className="w-4 h-4 text-thofnaa-emerald" />}
                  className="text-xs border-emerald-200 text-thofnaa-emerald hover:bg-emerald-50 font-bold"
                >
                  Resend Confirmation Email
                </Button>
              )}

              <Link href="/admin/payments">
                <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back to Queue
                </Button>
              </Link>
            </div>
          }
        />

        {/* TOP SUMMARY BAR */}
        <div className="p-6 rounded-2xl bg-thofnaa-navy text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-2 border-thofnaa-gold shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase text-thofnaa-gold tracking-wider">
                Submission ID: {submission.id}
              </span>
              {paymentRef && (
                <span className="px-2 py-0.5 rounded bg-thofnaa-gold text-thofnaa-navy text-[10px] font-mono font-bold">
                  Ref: {paymentRef}
                </span>
              )}
            </div>
            <h2 className="text-xl font-serif font-bold text-white">
              {submission.studentName}
            </h2>
            <p className="text-xs text-thofnaa-ivory/80 font-mono">
              Reg No: <strong className="text-white">{submission.studentRegNo}</strong> • Tuition Period: <strong>{submission.paymentMonth} {submission.academicYear}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <StatusBadge status={currentStatus} size="lg" />
            <span className="text-[11px] text-thofnaa-gold font-mono font-bold">
              Fee Amount: {formatLKR(submission.feeAmount)}
            </span>
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT: Left (Student & Payment Details) | Right (Proof File & Verification Studio) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (5 cols): Student Profile & Payment Meta */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Student Account Card */}
            <Card goldHeaderBorder className="shadow-md">
              <CardHeader className="bg-white border-b border-gray-100">
                <CardTitle className="text-base text-thofnaa-navy flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-thofnaa-gold" /> Enrolled Student Details
                </CardTitle>
                <CardDescription>
                  Verified registration record from THOFNAA database.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-4 space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-thofnaa-charcoal-muted">Full Name:</span>
                  <strong className="text-thofnaa-navy font-semibold">{submission.studentName}</strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-thofnaa-charcoal-muted">Registration Number:</span>
                  <strong className="font-mono text-thofnaa-navy">{submission.studentRegNo}</strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-thofnaa-charcoal-muted">Grade Level:</span>
                  <strong className="text-thofnaa-navy">{studentRecord?.gradeLevel || "Grade 6"}</strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-thofnaa-charcoal-muted">Batch Module:</span>
                  <strong className="text-thofnaa-navy">{studentRecord?.batch || "Foundation Sinhala"}</strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-thofnaa-charcoal-muted">Guardian Name:</span>
                  <strong className="text-thofnaa-navy">{studentRecord?.guardianName || "Guardian"}</strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-thofnaa-charcoal-muted font-medium flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-thofnaa-navy" /> Parent Email:
                  </span>
                  <strong className="font-mono text-thofnaa-navy">{submission.guardianEmail}</strong>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-thofnaa-charcoal-muted font-medium flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-thofnaa-navy" /> Parent WhatsApp:
                  </span>
                  <strong className="font-mono text-thofnaa-navy">{submission.guardianPhone}</strong>
                </div>

                {studentRecord && (
                  <div className="pt-2">
                    <Link href={`/admin/students/${studentRecord.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold">
                        View Full Student Profile & History
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Transaction Metadata */}
            <Card className="shadow-md">
              <CardHeader className="bg-white border-b border-gray-100">
                <CardTitle className="text-base text-thofnaa-navy flex items-center gap-2">
                  <FileText className="w-4 h-4 text-thofnaa-gold" /> Transfer & Deposit Information
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-4 space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-thofnaa-charcoal-muted">Tuition Month:</span>
                  <strong className="text-thofnaa-navy font-bold">{submission.paymentMonth} {submission.academicYear}</strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-thofnaa-charcoal-muted">Amount Transferred:</span>
                  <strong className="font-mono text-thofnaa-emerald font-bold text-sm">
                    {formatLKR(submission.feeAmount)}
                  </strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-thofnaa-charcoal-muted">Payment Method:</span>
                  <strong className="text-thofnaa-navy">{submission.paymentMethod}</strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-thofnaa-charcoal-muted">Bank Name:</span>
                  <strong className="text-thofnaa-navy">{submission.bankName}</strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-thofnaa-charcoal-muted">Transfer Date:</span>
                  <strong className="font-mono text-thofnaa-navy">{submission.transactionDate}</strong>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-thofnaa-charcoal-muted">Bank Reference / Slip No:</span>
                  <strong className="font-mono text-thofnaa-navy bg-gray-100 px-1.5 py-0.5 rounded font-bold">
                    {submission.depositReferenceNo || "N/A"}
                  </strong>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-thofnaa-charcoal-muted">Submission Timestamp:</span>
                  <span className="font-mono text-gray-500 text-[11px]">
                    {new Date(submission.createdAt).toLocaleString("en-GB")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (7 cols): Document Inspection & Verification Studio */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Payment Proof Receipt Viewer */}
            <Card className="shadow-md overflow-hidden">
              <CardHeader className="bg-thofnaa-navy text-white flex flex-row items-center justify-between py-4">
                <div>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Eye className="w-4 h-4 text-thofnaa-gold" /> Uploaded Payment Proof Document
                  </CardTitle>
                  <CardDescription className="text-thofnaa-gold text-xs">
                    Inspect receipt image or PDF file uploaded by parent.
                  </CardDescription>
                </div>

                <a 
                  href={proofPreviewUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-thofnaa-gold hover:text-white font-mono"
                >
                  <span>Open Fullscreen</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </CardHeader>

              <CardContent className="p-4 bg-gray-900 flex flex-col items-center justify-center min-h-[320px]">
                {isPdfFile ? (
                  <div className="text-center p-8 space-y-4">
                    <FileText className="w-16 h-16 text-thofnaa-gold mx-auto" />
                    <div>
                      <h4 className="text-white font-bold text-sm">{submission.proofFileName}</h4>
                      <p className="text-xs text-gray-400">PDF Document Proof File</p>
                    </div>
                    <a href={proofPreviewUrl} target="_blank" rel="noreferrer">
                      <Button variant="primary" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                        Download / View PDF Proof
                      </Button>
                    </a>
                  </div>
                ) : (
                  <div className="relative group w-full max-h-[420px] overflow-hidden rounded-lg flex items-center justify-center bg-black">
                    <img 
                      src={proofPreviewUrl} 
                      alt="Payment Deposit Slip Proof" 
                      className="max-h-[400px] w-auto object-contain rounded shadow-lg transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
              </CardContent>

              <CardFooter className="bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-mono py-3">
                <span className="text-thofnaa-charcoal-muted">File: {submission.proofFileName}</span>
                <span className="text-thofnaa-emerald font-bold">🔒 Encrypted Transfer Protocol</span>
              </CardFooter>
            </Card>

            {/* Admin Decision & Status Override Actions Studio */}
            <Card goldHeaderBorder className="shadow-md">
              <CardHeader className="bg-white border-b border-gray-100">
                <CardTitle className="text-base text-thofnaa-navy flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-thofnaa-gold" /> Admin Decision & Status Override
                </CardTitle>
                <CardDescription>
                  Approve payment proof to issue automated confirmation, or request clarification/reject.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                
                {/* Admin Reason / Notes Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-thofnaa-navy flex items-center gap-1.5">
                    <MessageSquareText className="w-4 h-4 text-thofnaa-navy" />
                    Administrator Notes / Rejection Reason
                    <span className="text-gray-400 font-normal">(Required for Reject & Needs Clarification)</span>
                  </label>

                  <textarea
                    rows={3}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="e.g. Bank transfer reference matches People's Bank statement OR Receipt image is blurry, please re-upload."
                    className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-thofnaa-gold focus:border-thofnaa-navy font-sans"
                  />
                </div>

                <FormError message={actionError} />
                
                {actionSuccess && (
                  <Alert variant="success" title="Status Updated">
                    {actionSuccess}
                  </Alert>
                )}

                {/* ACTION BUTTONS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    variant="success"
                    size="md"
                    isLoading={isUpdating && pendingDecision === "VERIFIED"}
                    onClick={() => handleInitiateDecision("VERIFIED")}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                    className="w-full font-bold shadow-sm"
                  >
                    Approve Payment
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    isLoading={isUpdating && pendingDecision === "NEEDS_CLARIFICATION"}
                    onClick={() => handleInitiateDecision("NEEDS_CLARIFICATION")}
                    leftIcon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
                    className="w-full text-amber-800 border-amber-300 hover:bg-amber-50 font-bold"
                  >
                    Request Clarification
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    isLoading={isUpdating && pendingDecision === "REJECTED"}
                    onClick={() => handleInitiateDecision("REJECTED")}
                    leftIcon={<XCircle className="w-4 h-4 text-red-600" />}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 font-bold"
                  >
                    Reject Submission
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CONFIRMATION DECISION MODAL */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Verification Decision"
      >
        <div className="space-y-4 text-xs">
          <p className="text-thofnaa-charcoal leading-relaxed">
            Are you sure you want to mark this payment submission for <strong className="font-serif text-thofnaa-navy">{submission.studentName}</strong> (<code className="font-mono">{submission.studentRegNo}</code>) as:
          </p>

          <div className="p-3 rounded-xl bg-thofnaa-ivory border border-thofnaa-navy/20 font-bold text-center uppercase tracking-wider text-sm font-mono text-thofnaa-navy">
            {pendingDecision?.replace("_", " ")}
          </div>

          {adminNote && (
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-xs">
              <strong>Admin Note:</strong> &ldquo;{adminNote}&rdquo;
            </div>
          )}

          <p className="text-gray-400 text-[11px]">
            🔒 Decision will generate an audit log entry and update the parent&apos;s tuition payment record.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" size="sm" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              isLoading={isUpdating}
              onClick={handleExecuteConfirmedDecision} 
              className="font-bold"
            >
              Confirm Decision
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
