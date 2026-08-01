"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  MessageSquareText
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
import { INITIAL_SUBMISSIONS, INITIAL_STUDENTS, PaymentSubmission } from "@/lib/mockData";
import { updatePaymentStatusAction } from "@/app/actions/updatePaymentStatusAction";

export default function AdminPaymentDetailStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const paymentId = resolvedParams.id;
  const router = useRouter();

  // Find payment submission record
  const submission = INITIAL_SUBMISSIONS.find((s) => s.id === paymentId) || INITIAL_SUBMISSIONS[0];
  const studentRecord = INITIAL_STUDENTS.find(
    (s) => s.studentRegNo.toUpperCase() === submission.studentRegNo.toUpperCase()
  ) || INITIAL_STUDENTS[0];

  // Local Component States
  const [currentStatus, setCurrentStatus] = useState<PaymentStatus>(submission.status as PaymentStatus);
  const [paymentRef, setPaymentRef] = useState<string | null>(submission.paymentRef);
  const [adminNote, setAdminNote] = useState<string>(submission.rejectionReason || "");
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal Confirmation State
  const [pendingDecision, setPendingDecision] = useState<"VERIFIED" | "NEEDS_CLARIFICATION" | "REJECTED" | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // File Proof Signed URL Simulation
  const isPdfFile = submission.proofFileName?.toLowerCase().endsWith(".pdf") || false;
  const proofPreviewUrl = submission.proofUrl;

  const handleInitiateDecision = (decision: "VERIFIED" | "NEEDS_CLARIFICATION" | "REJECTED") => {
    setActionError(null);
    setActionSuccess(null);

    // Validate required admin note for Reject or Needs Clarification
    if ((decision === "REJECTED" || decision === "NEEDS_CLARIFICATION") && !adminNote.trim()) {
      setActionError(`An administrator note/reason is strictly required when marking a payment as "${decision.replace("_", " ")}".`);
      return;
    }

    setPendingDecision(decision);
    setIsConfirmModalOpen(true);
  };

  const handleExecuteConfirmedDecision = async () => {
    if (!pendingDecision) return;

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
      setActionSuccess(result.message || `Payment status updated to ${pendingDecision}.`);
    } else {
      setActionError(result.error || "Failed to update payment status.");
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
            <Link href="/admin/payments">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Queue
              </Button>
            </Link>
          }
        />

        {/* DOUBLE VERIFICATION LOCK BANNER */}
        {currentStatus === "VERIFIED" && (
          <Alert variant="success" title="Payment Verified & Approved">
            This payment record has been officially verified. Payment Reference Code{" "}
            <strong className="font-mono text-thofnaa-navy">{paymentRef}</strong> is assigned and email receipt dispatched to parent.
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (7 cols): Details & Proof Viewer */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* STUDENT & PAYMENT DETAILS CARD */}
            <Card goldHeaderBorder className="shadow-md">
              <CardHeader className="bg-white border-b border-gray-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base text-thofnaa-navy">Student & Payment Profile</CardTitle>
                  <CardDescription>Official THOFNAA registration and tuition deposit details.</CardDescription>
                </div>
                <StatusBadge status={currentStatus} size="md" />
              </CardHeader>

              <CardContent className="space-y-6 pt-5">
                
                {/* 1. STUDENT REGISTRATION DETAILS */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-thofnaa-navy uppercase tracking-wider font-mono border-b border-gray-100 pb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-thofnaa-gold" />
                    1. Student Registration Profile
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-thofnaa-ivory p-4 rounded-xl border border-thofnaa-gold/30">
                    <div>
                      <span className="text-thofnaa-charcoal-muted block font-mono text-[10px] uppercase">Registration No</span>
                      <strong className="text-thofnaa-navy font-mono text-sm">{submission.studentRegNo}</strong>
                    </div>

                    <div>
                      <span className="text-thofnaa-charcoal-muted block font-mono text-[10px] uppercase">Student Name</span>
                      <strong className="text-thofnaa-navy font-serif text-sm">{submission.studentName}</strong>
                    </div>

                    <div>
                      <span className="text-thofnaa-charcoal-muted block font-mono text-[10px] uppercase">Grade Level</span>
                      <strong className="text-thofnaa-navy">{studentRecord.gradeLevel}</strong>
                    </div>

                    <div>
                      <span className="text-thofnaa-charcoal-muted block font-mono text-[10px] uppercase">Batch / Module</span>
                      <strong className="text-thofnaa-navy">{studentRecord.batch || "Foundation Sinhala"}</strong>
                    </div>

                    <div className="col-span-2">
                      <span className="text-thofnaa-charcoal-muted block font-mono text-[10px] uppercase">Programme</span>
                      <strong className="text-thofnaa-navy">{studentRecord.programme || "Second Language Sinhala"}</strong>
                    </div>
                  </div>
                </div>

                {/* 2. PAYMENT DEPOSIT DETAILS */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-thofnaa-navy uppercase tracking-wider font-mono border-b border-gray-100 pb-1 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-thofnaa-gold" />
                    2. Payment Deposit Information
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-white p-4 rounded-xl border border-gray-200">
                    <div>
                      <span className="text-thofnaa-charcoal-muted block font-mono text-[10px] uppercase">Tuition Month</span>
                      <strong className="text-thofnaa-navy text-sm font-semibold">{submission.paymentMonth} {submission.academicYear}</strong>
                    </div>

                    <div>
                      <span className="text-thofnaa-charcoal-muted block font-mono text-[10px] uppercase">Amount Paid</span>
                      <strong className="text-thofnaa-emerald font-mono text-sm font-extrabold">{formatLKR(submission.feeAmount)}</strong>
                    </div>

                    <div>
                      <span className="text-thofnaa-charcoal-muted block font-mono text-[10px] uppercase">Transfer Date</span>
                      <strong className="text-thofnaa-navy font-mono">{submission.transactionDate}</strong>
                    </div>

                    <div>
                      <span className="text-thofnaa-charcoal-muted block font-mono text-[10px] uppercase">Payment Method</span>
                      <strong className="text-thofnaa-navy">{submission.paymentMethod}</strong>
                    </div>

                    <div>
                      <span className="text-thofnaa-charcoal-muted block font-mono text-[10px] uppercase">Bank Reference</span>
                      <strong className="text-thofnaa-navy font-mono">{submission.depositReferenceNo || "N/A"}</strong>
                    </div>

                    <div>
                      <span className="text-thofnaa-charcoal-muted block font-mono text-[10px] uppercase">Submitted At</span>
                      <strong className="text-thofnaa-charcoal font-mono text-[11px]">
                        {new Date(submission.createdAt).toLocaleString("en-GB", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 3. PARENT CONTACT CHANNELS */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-thofnaa-navy uppercase tracking-wider font-mono border-b border-gray-100 pb-1 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-thofnaa-gold" />
                    3. Parent Contact Channels
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <a
                      href={`mailto:${submission.guardianEmail}`}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-thofnaa-navy flex items-center gap-2 transition-colors group"
                    >
                      <Mail className="w-4 h-4 text-thofnaa-navy group-hover:scale-110 transition-transform" />
                      <div>
                        <span className="text-thofnaa-charcoal-muted block text-[10px] uppercase font-mono">Parent Email</span>
                        <span className="font-semibold text-thofnaa-navy">{submission.guardianEmail}</span>
                      </div>
                    </a>

                    <a
                      href={`https://wa.me/${submission.guardianPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello, this is THOFNAA INSTITUTE regarding payment submission ${paymentRef || submission.studentRegNo}.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 hover:border-emerald-500 flex items-center gap-2 transition-colors group"
                    >
                      <Phone className="w-4 h-4 text-thofnaa-emerald group-hover:scale-110 transition-transform" />
                      <div>
                        <span className="text-emerald-800 block text-[10px] uppercase font-mono font-bold">WhatsApp Contact</span>
                        <span className="font-semibold text-emerald-950 font-mono">{submission.guardianPhone}</span>
                      </div>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* PAYMENT PROOF RECEIPT VIEWER CARD */}
            <Card goldHeaderBorder className="shadow-md">
              <CardHeader className="bg-thofnaa-navy text-white flex flex-row items-center justify-between py-4">
                <div>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Lock className="w-4 h-4 text-thofnaa-gold" /> Secure Payment Proof Receipt
                  </CardTitle>
                  <CardDescription className="text-thofnaa-gold text-xs">
                    Temporary signed URL generated from private bucket <strong className="font-mono">payment-proofs</strong>.
                  </CardDescription>
                </div>

                <a href={proofPreviewUrl} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-thofnaa-navy text-xs">
                    <ExternalLink className="w-3.5 h-3.5" /> Open Full
                  </Button>
                </a>
              </CardHeader>

              <CardContent className="p-6">
                {!isPdfFile ? (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-900 group max-h-[450px] flex items-center justify-center">
                      <img
                        src={proofPreviewUrl}
                        alt={`Payment proof deposit receipt for ${submission.studentRegNo}`}
                        className="max-h-[450px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <p className="text-[11px] text-center text-thofnaa-charcoal-muted font-mono">
                      File: {submission.proofFileName} • High-Resolution Bank Deposit Receipt
                    </p>
                  </div>
                ) : (
                  <div className="p-8 rounded-2xl bg-thofnaa-ivory border-2 border-dashed border-thofnaa-navy/30 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-thofnaa-navy/10 text-thofnaa-navy flex items-center justify-center mx-auto">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-thofnaa-navy text-base">PDF Document Receipt</h4>
                      <p className="text-xs text-thofnaa-charcoal-muted font-mono mt-1">{submission.proofFileName}</p>
                    </div>
                    <a href={proofPreviewUrl} target="_blank" rel="noreferrer" className="inline-block">
                      <Button variant="primary" size="md" leftIcon={<Eye className="w-4 h-4" />}>
                        View Secure PDF Document
                      </Button>
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column (5 cols): Admin Decision Studio */}
          <div className="lg:col-span-5 space-y-6">
            
            <Card goldHeaderBorder className="shadow-lg border-2 border-thofnaa-navy/20">
              <CardHeader className="bg-thofnaa-navy text-white">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-thofnaa-gold" /> Admin Verification Decision
                </CardTitle>
                <CardDescription className="text-thofnaa-gold text-xs">
                  Review receipt details and execute status update.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 pt-6">
                
                {/* Admin Note Textarea */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-thofnaa-navy flex items-center justify-between">
                    <span>Admin Review Note / Reason</span>
                    <span className="text-[10px] text-gray-400 font-normal">Required for Reject / Clarification</span>
                  </label>
                  <textarea
                    rows={4}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Enter reason or note for parent (e.g. Deposit slip reference PB-998231 matched on People's Bank statement, or Please re-upload clear un-cropped receipt)."
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl text-xs text-thofnaa-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-thofnaa-navy focus:border-transparent transition-all"
                  />
                </div>

                <FormError message={actionError} />
                {actionSuccess && (
                  <Alert variant="success" title="Success">
                    {actionSuccess}
                  </Alert>
                )}

                {/* STATUS DECISION ACTION BUTTONS */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-thofnaa-charcoal-muted block">
                    Select Verification Decision:
                  </span>

                  <Button
                    type="button"
                    variant="success"
                    size="lg"
                    isLoading={isUpdating}
                    disabled={currentStatus === "VERIFIED"}
                    onClick={() => handleInitiateDecision("VERIFIED")}
                    leftIcon={<CheckCircle2 className="w-5 h-5" />}
                    className="w-full font-bold shadow-md text-xs py-3"
                  >
                    {currentStatus === "VERIFIED" ? "✓ Already Verified" : "VERIFY PAYMENT & ASSIGN REF"}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    isLoading={isUpdating}
                    onClick={() => handleInitiateDecision("NEEDS_CLARIFICATION")}
                    leftIcon={<AlertTriangle className="w-4 h-4 text-thofnaa-navy" />}
                    className="w-full font-bold text-xs bg-orange-100 hover:bg-orange-200 text-orange-950 border-orange-300"
                  >
                    NEEDS CLARIFICATION
                  </Button>

                  <Button
                    type="button"
                    variant="danger"
                    size="md"
                    isLoading={isUpdating}
                    onClick={() => handleInitiateDecision("REJECTED")}
                    leftIcon={<XCircle className="w-4 h-4" />}
                    className="w-full font-bold text-xs"
                  >
                    REJECT PAYMENT
                  </Button>
                </div>
              </CardContent>

              <CardFooter className="bg-gray-50 text-[11px] text-thofnaa-charcoal-muted leading-relaxed">
                🔒 Every decision records an audit log entry (<code className="font-mono text-[10px]">VERIFY_PAYMENT</code>) with admin user ID and timestamp.
              </CardFooter>
            </Card>

            {/* QUICK VERIFICATION CHECKLIST CARD */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-academic-subtle space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-thofnaa-navy flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-thofnaa-gold" />
                Admin Verification Checklist
              </h4>
              <ul className="text-xs text-thofnaa-charcoal-muted space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-thofnaa-emerald font-bold">✓</span>
                  <span>Confirm deposit amount matches tuition fee (LKR 1,000.00).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-thofnaa-emerald font-bold">✓</span>
                  <span>Verify People&apos;s Bank account number <strong className="font-mono text-thofnaa-navy">167200230025623</strong>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-thofnaa-emerald font-bold">✓</span>
                  <span>Check transaction date matches intended tuition month ({submission.paymentMonth}).</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={`Confirm Decision: ${pendingDecision?.replace("_", " ")}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-thofnaa-charcoal leading-relaxed">
            Are you sure you want to mark payment submission <strong className="font-mono text-thofnaa-navy">{submission.studentRegNo}</strong> ({submission.studentName}) for <strong className="font-semibold">{submission.paymentMonth} {submission.academicYear}</strong> as:
          </p>

          <div className="p-3 rounded-xl bg-thofnaa-ivory border border-thofnaa-navy/20 font-bold text-center text-sm font-serif">
            {pendingDecision === "VERIFIED" && <span className="text-thofnaa-emerald">✓ VERIFIED & APPROVED</span>}
            {pendingDecision === "NEEDS_CLARIFICATION" && <span className="text-orange-700">⚠️ NEEDS CLARIFICATION</span>}
            {pendingDecision === "REJECTED" && <span className="text-red-700">🛑 REJECTED</span>}
          </div>

          {adminNote && (
            <div className="text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
              <span className="text-gray-400 block font-mono text-[10px] uppercase">Admin Note:</span>
              <p className="italic text-thofnaa-navy">{adminNote}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" size="sm" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={pendingDecision === "VERIFIED" ? "success" : pendingDecision === "REJECTED" ? "danger" : "secondary"}
              size="sm"
              onClick={handleExecuteConfirmedDecision}
              className="font-bold"
            >
              Confirm & Execute Update
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
