"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  ZoomIn, 
  ExternalLink, 
  Mail, 
  ShieldCheck, 
  Clock, 
  User, 
  Calendar,
  Send
} from "lucide-react";
import { INITIAL_SUBMISSIONS, PaymentSubmission } from "@/lib/mockData";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";

export default function AdminPaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [submission, setSubmission] = useState<PaymentSubmission>(() => {
    return (
      INITIAL_SUBMISSIONS.find((s) => s.id === resolvedParams.id) || INITIAL_SUBMISSIONS[1]
    );
  });

  const [actionType, setActionType] = useState<"VERIFY" | "CLARIFICATION" | "REJECT">("VERIFY");
  const [adminNote, setAdminNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      let updatedStatus: PaymentSubmission["status"] = "VERIFIED";

      if (actionType === "VERIFY") {
        updatedStatus = "VERIFIED";
        setToastMessage(`Payment ${submission.paymentRef} verified successfully! Email receipt triggered to ${submission.guardianEmail}.`);
      } else if (actionType === "CLARIFICATION") {
        updatedStatus = "CLARIFICATION_NEEDED";
        setToastMessage(`Clarification requested. Email sent to ${submission.guardianEmail}.`);
      } else {
        updatedStatus = "REJECTED";
        setToastMessage(`Submission rejected. Notice emailed to ${submission.guardianEmail}.`);
      }

      setSubmission((prev) => ({
        ...prev,
        status: updatedStatus,
        adminNotes: adminNote || prev.adminNotes,
        rejectionReason: rejectionReason || prev.rejectionReason,
        verifiedAt: new Date().toISOString(),
      }));
    }, 800);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Verification Review: ${submission.paymentRef}`}
        subtitle={`Submitted by ${submission.studentName} (${submission.studentRegNo}) for ${submission.paymentMonth} ${submission.academicYear}`}
        badgeText="Verification Studio"
        action={
          <Link href="/admin/payments">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back to Verification Queue
            </Button>
          </Link>
        }
      />

      {toastMessage && (
        <div className="p-4 rounded-xl bg-thofnaa-navy text-white border-2 border-thofnaa-gold flex items-center justify-between shadow-md animate-in fade-in duration-300">
          <div className="flex items-center gap-3 text-xs">
            <CheckCircle2 className="w-5 h-5 text-thofnaa-gold shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-thofnaa-gold text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (6 cols): Payment Proof Viewer */}
        <div className="lg:col-span-6 space-y-6">
          <Card goldHeaderBorder className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-thofnaa-navy" />
                  Uploaded Receipt Proof
                </CardTitle>
                <CardDescription>{submission.proofFileName}</CardDescription>
              </div>
              <a
                href={submission.proofUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-thofnaa-navy hover:text-thofnaa-emerald"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Full Size
              </a>
            </CardHeader>

            <CardContent className="p-4 bg-gray-900 rounded-b-xl text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={submission.proofUrl}
                alt="Payment Proof Receipt"
                className="max-h-[500px] w-auto mx-auto rounded-lg shadow-lg border border-gray-700 object-contain"
              />
              <p className="text-[11px] text-gray-400 mt-2">
                Verify receipt reference code against People&apos;s Bank account <strong className="font-mono text-white">167200230025623</strong>.
              </p>
            </CardContent>
          </Card>

          {/* Deposit Comparison Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-serif">Bank Statement Cross-Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-thofnaa-charcoal-muted">Bank Name:</span>
                <strong className="text-thofnaa-navy">{submission.bankName}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-thofnaa-charcoal-muted">Claimed Deposit Ref:</span>
                <strong className="text-thofnaa-navy font-mono font-bold">{submission.depositReferenceNo}</strong>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-thofnaa-charcoal-muted">Deposit Date:</span>
                <strong className="text-thofnaa-navy">{submission.transactionDate}</strong>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-thofnaa-charcoal-muted">Claimed Amount:</span>
                <strong className="text-thofnaa-emerald font-mono font-bold">LKR {submission.feeAmount.toLocaleString()}.00</strong>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (6 cols): Action Panel & Status */}
        <div className="lg:col-span-6 space-y-6">
          {/* Current Status Banner */}
          <Card className="bg-white shadow-xs">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-thofnaa-charcoal-muted block">
                  Current Status
                </span>
                <StatusBadge status={submission.status} size="lg" />
              </div>

              <div className="text-right text-xs text-thofnaa-charcoal-muted space-y-0.5">
                <span>Guardian Email:</span>
                <p className="font-mono text-thofnaa-navy font-bold">{submission.guardianEmail}</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Form Card */}
          <Card goldHeaderBorder className="shadow-md">
            <CardHeader className="bg-thofnaa-navy-50/60">
              <CardTitle className="text-base">Administrative Action & Email Trigger</CardTitle>
              <CardDescription>
                Select action below. Updating status automatically triggers Resend email to guardian.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Action Mode Toggle Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActionType("VERIFY")}
                  className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    actionType === "VERIFY"
                      ? "bg-thofnaa-emerald text-white border-thofnaa-emerald shadow-md"
                      : "bg-white text-thofnaa-charcoal border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Approve & Verify</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActionType("CLARIFICATION")}
                  className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    actionType === "CLARIFICATION"
                      ? "bg-orange-500 text-white border-orange-500 shadow-md"
                      : "bg-white text-thofnaa-charcoal border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>Need Clarification</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActionType("REJECT")}
                  className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                    actionType === "REJECT"
                      ? "bg-red-600 text-white border-red-600 shadow-md"
                      : "bg-white text-thofnaa-charcoal border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <XCircle className="w-5 h-5" />
                  <span>Reject Payment</span>
                </button>
              </div>

              <form onSubmit={handleAction} className="space-y-4">
                {actionType === "VERIFY" && (
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <p className="font-bold">✔ Approving Submission:</p>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Status will change to <strong className="font-mono">VERIFIED</strong>. Resend will send an official tuition confirmation receipt to <strong>{submission.guardianEmail}</strong> with PDF download link.
                    </p>
                  </div>
                )}

                {actionType === "CLARIFICATION" && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-thofnaa-charcoal">
                      Reason for Clarification Request <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Receipt image is blurry. Please re-upload a clear deposit slip."
                      className="w-full rounded-lg border border-gray-300 p-3 text-xs focus:border-thofnaa-navy focus:outline-none"
                      required
                    />
                  </div>
                )}

                {actionType === "REJECT" && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-thofnaa-charcoal">
                      Reason for Rejection <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Transaction ID does not match any deposit on People's Bank statement."
                      className="w-full rounded-lg border border-gray-300 p-3 text-xs focus:border-thofnaa-navy focus:outline-none"
                      required
                    />
                  </div>
                )}

                <Input
                  label="Internal Admin Note (Optional)"
                  placeholder="Private note for institute audit records..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />

                <Button
                  type="submit"
                  variant={actionType === "VERIFY" ? "success" : actionType === "CLARIFICATION" ? "secondary" : "danger"}
                  size="lg"
                  isLoading={isProcessing}
                  rightIcon={<Send className="w-4 h-4" />}
                  className="w-full font-bold shadow-md"
                >
                  {actionType === "VERIFY"
                    ? "Approve & Send Confirmation Email"
                    : actionType === "CLARIFICATION"
                    ? "Send Clarification Email"
                    : "Confirm Rejection & Send Email"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
