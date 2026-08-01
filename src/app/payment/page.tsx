"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  CreditCard, 
  CheckCircle2, 
  Calendar, 
  Landmark, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle,
  Clock,
  UserCheck,
  GraduationCap,
  Mail,
  Phone,
  Lock,
  XCircle,
  FileCheck
} from "lucide-react";
import { THOFNAA_CONFIG } from "@/lib/constants";
import { lookupStudentRegNo, PublicStudentInfo } from "@/app/actions/studentLookupAction";
import { 
  checkPaymentPeriodStatus, 
  submitPaymentForm, 
  CheckPeriodResult 
} from "@/app/actions/paymentSubmissionAction";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { FormError } from "@/components/ui/FormError";
import { Dropzone } from "@/components/ui/Dropzone";
import { BankAccountCard } from "@/components/common/BankAccountCard";

function PaymentFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const regNoQuery = searchParams.get("regNo") || "";

  // Step 1 State: Lookup
  const [regNoInput, setRegNoInput] = useState(regNoQuery);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [confirmedStudent, setConfirmedStudent] = useState<PublicStudentInfo | null>(null);

  // Step 2 State: Payment Form Fields
  const [isConfirmedChild, setIsConfirmedChild] = useState(false);
  const [paymentMonth, setPaymentMonth] = useState("February");
  const [paymentYear, setPaymentYear] = useState<number>(2026);
  const [amountPaid, setAmountPaid] = useState<number>(1000);
  const [paymentDate, setPaymentDate] = useState("2026-01-31");
  const [paymentMethod, setPaymentMethod] = useState<"Bank Transfer" | "Cash Deposit" | "Online Transfer" | "Other">("Online Transfer");
  const [bankReference, setBankReference] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentWhatsapp, setParentWhatsapp] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  // Period Duplicate Check State
  const [periodStatus, setPeriodStatus] = useState<CheckPeriodResult | null>(null);
  const [isCheckingPeriod, setIsCheckingPeriod] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Auto-lookup if regNo query param exists
  useEffect(() => {
    if (regNoQuery) {
      handlePerformLookup(regNoQuery);
    }
  }, [regNoQuery]);

  // Check period status whenever student, month, or year changes
  useEffect(() => {
    if (confirmedStudent && isConfirmedChild) {
      handleCheckPeriod(confirmedStudent.registrationNo, paymentMonth, paymentYear);
    }
  }, [confirmedStudent, isConfirmedChild, paymentMonth, paymentYear]);

  const handlePerformLookup = async (inputRegNo: string) => {
    setLookupError(null);
    setConfirmedStudent(null);
    setIsConfirmedChild(false);

    if (!inputRegNo.trim()) {
      setLookupError("Please enter a Student Registration Number (e.g. THF-26-0001).");
      return;
    }

    setIsLookingUp(true);
    const result = await lookupStudentRegNo(inputRegNo);
    setIsLookingUp(false);

    if (result.success && result.student) {
      setConfirmedStudent(result.student);
    } else {
      setLookupError(result.error || "Lookup failed.");
    }
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handlePerformLookup(regNoInput);
  };

  const handleConfirmChild = () => {
    setIsConfirmedChild(true);
    setTimeout(() => {
      document.getElementById("payment-submission-card")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleCheckPeriod = async (regNo: string, month: string, year: number) => {
    setIsCheckingPeriod(true);
    const result = await checkPaymentPeriodStatus(regNo, month, year);
    setIsCheckingPeriod(false);
    setPeriodStatus(result);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    if (!confirmedStudent) {
      setSubmissionError("Please verify your student registration number first.");
      return;
    }

    if (periodStatus && !periodStatus.allowed) {
      setSubmissionError(periodStatus.message || "Submission not allowed for this period.");
      return;
    }

    if (!parentEmail.trim() || !parentEmail.includes("@")) {
      setSubmissionError("Please enter a valid parent email address for receipt delivery.");
      return;
    }

    if (!parentWhatsapp.trim() || parentWhatsapp.trim().length < 8) {
      setSubmissionError("Please enter a valid parent WhatsApp contact number.");
      return;
    }

    if (!proofFile) {
      setSubmissionError("Please upload a clear JPG, PNG or PDF of your payment proof receipt.");
      return;
    }

    setIsSubmitting(true);

    const result = await submitPaymentForm({
      studentRegNo: confirmedStudent.registrationNo,
      studentName: confirmedStudent.nameWithInitials,
      grade: confirmedStudent.grade,
      programme: confirmedStudent.programme,
      paymentMonth,
      paymentMonthInt: THOFNAA_CONFIG.months.indexOf(paymentMonth) + 1,
      paymentYear,
      amount: Number(amountPaid),
      paymentDate,
      paymentMethod,
      bankReference,
      parentEmail,
      parentWhatsapp,
      proofFileName: proofFile.name,
      proofFileSizeMB: proofFile.size / (1024 * 1024),
      proofFileType: proofFile.type,
    });

    setIsSubmitting(false);

    if (result.success && result.paymentRef) {
      router.push(
        `/payment/success?ref=${result.paymentRef}&student=${encodeURIComponent(confirmedStudent.nameWithInitials)}&month=${paymentMonth}`
      );
    } else {
      setSubmissionError(result.error || "Payment submission failed. Please check details.");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="THOFNAA Tuition Payment Portal"
        subtitle="Verify student registration and submit monthly bank deposit proof."
        badgeText="Official Portal"
        action={
          <Link href="/">
            <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-thofnaa-navy">
              <ArrowLeft className="w-4 h-4" /> Home Page
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Step 1 & Step 2 Forms */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: STUDENT REGISTRATION LOOKUP */}
          <Card goldHeaderBorder className="shadow-md">
            <CardHeader className="bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-thofnaa-navy text-white flex items-center justify-center font-bold font-mono">
                  1
                </div>
                <div>
                  <CardTitle className="text-base">Step 1: Student Lookup</CardTitle>
                  <CardDescription>
                    Enter Student Registration Number (Format: <strong className="font-mono">THF-26-0001</strong>).
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 pt-4">
              <form onSubmit={handleLookupSubmit} className="space-y-4">
                <Input
                  label="Student Registration Number"
                  placeholder="e.g. THF-26-0001"
                  value={regNoInput}
                  onChange={(e) => setRegNoInput(e.target.value.toUpperCase())}
                  leftIcon={<GraduationCap className="w-4 h-4" />}
                  helperText="Format: THF-YY-NNNN (e.g. THF-26-0001)"
                  required
                />

                <FormError message={lookupError} />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isLookingUp}
                  disabled={isLookingUp}
                  leftIcon={<Search className="w-4 h-4" />}
                  className="w-full sm:w-auto font-bold"
                >
                  {isLookingUp ? "Searching student..." : "Verify Registration"}
                </Button>
              </form>

              {/* LIMITED STUDENT DATA CONFIRMATION BOX */}
              {confirmedStudent && (
                <div className="p-5 rounded-2xl bg-thofnaa-ivory border-2 border-thofnaa-navy/30 space-y-4 animate-in fade-in duration-300 shadow-xs">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-thofnaa-emerald" /> Record Confirmed
                    </span>
                    <span className="text-[11px] font-mono text-thofnaa-charcoal-muted uppercase">
                      Status: <strong className="text-thofnaa-emerald">{confirmedStudent.status}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-thofnaa-charcoal-muted block font-mono text-[10px] uppercase">Student Name</span>
                      <strong className="text-thofnaa-navy font-serif text-sm">{confirmedStudent.nameWithInitials}</strong>
                    </div>

                    <div>
                      <span className="text-thofnaa-charcoal-muted block font-mono text-[10px] uppercase">Registration No</span>
                      <strong className="text-thofnaa-navy font-mono">{confirmedStudent.registrationNo}</strong>
                    </div>

                    <div>
                      <span className="text-thofnaa-charcoal-muted block font-mono text-[10px] uppercase">Grade</span>
                      <strong className="text-thofnaa-navy">{confirmedStudent.grade}</strong>
                    </div>

                    <div>
                      <span className="text-thofnaa-charcoal-muted block font-mono text-[10px] uppercase">Programme</span>
                      <strong className="text-thofnaa-navy">{confirmedStudent.programme}</strong>
                    </div>

                    <div className="col-span-2 pt-2 border-t border-gray-200/80 flex items-center justify-between">
                      <span className="text-thofnaa-charcoal-muted font-mono text-[11px]">Monthly Tuition Fee:</span>
                      <strong className="text-thofnaa-emerald font-mono text-base font-extrabold">
                        LKR {confirmedStudent.monthlyFeeLKR.toLocaleString()}.00
                      </strong>
                    </div>
                  </div>

                  {!isConfirmedChild ? (
                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="lg"
                        onClick={handleConfirmChild}
                        leftIcon={<UserCheck className="w-5 h-5 text-thofnaa-navy" />}
                        className="w-full font-serif font-extrabold text-sm shadow-gold"
                      >
                        [ This is my child/student ]
                      </Button>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between font-bold">
                      <span>✓ Student Identity Confirmed</span>
                      <button
                        type="button"
                        onClick={() => setIsConfirmedChild(false)}
                        className="text-[11px] underline text-thofnaa-navy font-normal"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* STEP 2: PAYMENT SUBMISSION FORM */}
          {confirmedStudent && isConfirmedChild && (
            <div id="payment-submission-card" className="animate-in fade-in slide-in-from-top-4 duration-300">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <Card goldHeaderBorder className="shadow-md">
                  <CardHeader className="bg-thofnaa-navy text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-thofnaa-gold text-thofnaa-navy flex items-center justify-center font-bold font-mono shadow-gold">
                        2
                      </div>
                      <div>
                        <CardTitle className="text-white text-base">Step 2: Submit Payment Details & Proof</CardTitle>
                        <CardDescription className="text-thofnaa-gold text-xs">
                          Complete all required fields below for administrative verification.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 pt-6">
                    
                    {/* READ-ONLY CONFIRMED SUMMARY HEADER */}
                    <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-2">
                      <h5 className="font-bold text-thofnaa-navy uppercase tracking-wider text-[10px] font-mono border-b border-gray-200 pb-1">
                        Confirmed Student Details (Read-Only)
                      </h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div>
                          <span className="text-gray-400 block font-mono">Reg No:</span>
                          <strong className="font-mono text-thofnaa-navy">{confirmedStudent.registrationNo}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-mono">Display Name:</span>
                          <strong className="font-serif text-thofnaa-navy">{confirmedStudent.nameWithInitials}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-mono">Grade:</span>
                          <strong className="text-thofnaa-navy">{confirmedStudent.grade}</strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block font-mono">Programme:</span>
                          <strong className="text-thofnaa-navy">{confirmedStudent.programme}</strong>
                        </div>
                      </div>
                    </div>

                    {/* PERIOD DUPLICATE STATUS WARNING BANNER */}
                    {periodStatus && (
                      <div className="space-y-2">
                        {periodStatus.status === "VERIFIED" && (
                          <Alert variant="error" title="Payment Already Verified">
                            {periodStatus.message}
                          </Alert>
                        )}

                        {periodStatus.status === "PENDING" && (
                          <Alert variant="warning" title="Verification Pending">
                            {periodStatus.message}
                          </Alert>
                        )}

                        {periodStatus.status === "CLARIFICATION_NEEDED" && (
                          <Alert variant="warning" title="Clarification Requested by Admin">
                            {periodStatus.message}
                          </Alert>
                        )}

                        {periodStatus.status === "REJECTED" && (
                          <Alert variant="info" title="Re-submission Allowed">
                            {periodStatus.message}
                          </Alert>
                        )}
                      </div>
                    )}

                    {/* TUITION PERIOD & AMOUNT */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-thofnaa-navy uppercase tracking-wider font-mono border-b border-gray-100 pb-1">
                        1. Tuition Period & Amount
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                          label="Payment Month *"
                          value={paymentMonth}
                          onChange={(e) => setPaymentMonth(e.target.value)}
                          options={THOFNAA_CONFIG.months}
                          required
                        />

                        <Select
                          label="Payment Year *"
                          value={paymentYear.toString()}
                          onChange={(e) => setPaymentYear(Number(e.target.value))}
                          options={["2026", "2025", "2024"]}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Amount Paid (LKR) *"
                          type="number"
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(Number(e.target.value))}
                          placeholder="1000"
                          helperText="Standard monthly tuition fee: LKR 1,000.00"
                          required
                        />

                        <Input
                          label="Payment Date *"
                          type="date"
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* PAYMENT METHOD & REFERENCE */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-thofnaa-navy uppercase tracking-wider font-mono border-b border-gray-100 pb-1">
                        2. Transfer Method & Reference
                      </h4>

                      <Select
                        label="Payment Method *"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        options={[
                          "Bank Transfer",
                          "Cash Deposit",
                          "Online Transfer",
                          "Other",
                        ]}
                        required
                      />

                      <Input
                        label="Bank / Reference Number (Optional)"
                        value={bankReference}
                        onChange={(e) => setBankReference(e.target.value)}
                        placeholder="e.g. PB-998231 or CDM slip ref number"
                        helperText="Reference code printed on deposit receipt or displayed in banking app."
                      />
                    </div>

                    {/* PARENT CONTACT DETAILS FOR RECEIPT */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-thofnaa-navy uppercase tracking-wider font-mono border-b border-gray-100 pb-1">
                        3. Parent Contact Details (For Email Receipt)
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Parent Email Address *"
                          type="email"
                          value={parentEmail}
                          onChange={(e) => setParentEmail(e.target.value)}
                          placeholder="parent@gmail.com"
                          leftIcon={<Mail className="w-4 h-4" />}
                          helperText="Official verified PDF tuition receipt will be emailed here."
                          required
                        />

                        <Input
                          label="Parent WhatsApp Number *"
                          value={parentWhatsapp}
                          onChange={(e) => setParentWhatsapp(e.target.value)}
                          placeholder="+94 77 123 4567"
                          leftIcon={<Phone className="w-4 h-4" />}
                          helperText="Used for verification updates and WhatsApp notifications."
                          required
                        />
                      </div>
                    </div>

                    {/* PAYMENT PROOF DROPZONE UPLOAD */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-thofnaa-navy uppercase tracking-wider font-mono border-b border-gray-100 pb-1">
                        4. Upload Receipt Proof *
                      </h4>

                      <Dropzone
                        label="Upload Payment Deposit Receipt"
                        acceptTypes="image/jpeg, image/jpg, image/png, application/pdf"
                        maxSizeMB={10}
                        helperText="Accepted formats: JPG, JPEG, PNG or PDF (Max size: 10 MB)"
                        onFileSelect={(file) => setProofFile(file)}
                        selectedFile={proofFile}
                      />
                    </div>

                    <FormError message={submissionError} />
                  </CardContent>

                  <CardFooter className="bg-gray-50 flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <p className="text-[11px] text-thofnaa-charcoal-muted">
                      By submitting, you confirm that payment proof corresponds to THOFNAA People&apos;s Bank deposit.
                    </p>

                    <Button
                      type="submit"
                      variant="success"
                      size="lg"
                      isLoading={isSubmitting}
                      disabled={Boolean(periodStatus && !periodStatus.allowed)}
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                      className="w-full sm:w-auto font-bold text-sm shadow-md"
                    >
                      Submit Payment Proof for Verification
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Bank Details Card */}
        <div className="lg:col-span-5 space-y-6">
          <BankAccountCard />

          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-academic-subtle space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-thofnaa-navy flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-thofnaa-gold" />
              THOFNAA Verification Workflow
            </h4>
            <ul className="text-xs text-thofnaa-charcoal-muted space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-bold text-thofnaa-navy">1.</span>
                <span>Each payment gets a unique reference (e.g. <strong className="font-mono text-thofnaa-navy">THF-PAY-26-0004</strong>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-thofnaa-navy">2.</span>
                <span>Administrators match your deposit against People&apos;s Bank account <strong className="font-mono">167200230025623</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-thofnaa-navy">3.</span>
                <span>Approved receipts automatically email an official confirmation PDF to the parent address.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm font-semibold">Loading THOFNAA payment portal...</div>}>
      <PaymentFormContent />
    </Suspense>
  );
}
