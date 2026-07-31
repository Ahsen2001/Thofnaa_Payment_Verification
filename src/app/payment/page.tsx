"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, Upload, CheckCircle2, FileText, Calendar, Landmark, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { THOFNAA_CONFIG } from "@/lib/constants";
import { INITIAL_STUDENTS, INITIAL_SUBMISSIONS, PaymentSubmission } from "@/lib/mockData";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormError } from "@/components/ui/FormError";
import { BankAccountCard } from "@/components/common/BankAccountCard";

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const regNoQuery = searchParams.get("regNo") || "THF-26-0001";

  const [studentRegNo, setStudentRegNo] = useState(regNoQuery);
  const [selectedStudent, setSelectedStudent] = useState<(typeof INITIAL_STUDENTS)[0] | null>(null);
  
  const [paymentMonth, setPaymentMonth] = useState("February");
  const [paymentMethod, setPaymentMethod] = useState("Online Bank Transfer");
  const [bankName, setBankName] = useState("People's Bank");
  const [transactionDate, setTransactionDate] = useState("2026-01-31");
  const [depositReferenceNo, setDepositReferenceNo] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const match = INITIAL_STUDENTS.find(
      (s) => s.studentRegNo.toUpperCase() === studentRegNo.trim().toUpperCase()
    );
    if (match) {
      setSelectedStudent(match);
      setError(null);
    } else {
      setSelectedStudent(null);
    }
  }, [studentRegNo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit. Please upload a smaller receipt image or PDF.");
        return;
      }
      setProofFile(file);
      setError(null);

      if (file.type.startsWith("image/")) {
        setProofPreviewUrl(URL.createObjectURL(file));
      } else {
        setProofPreviewUrl(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedStudent) {
      setError("Please enter a valid THOFNAA Student Registration Number first.");
      return;
    }

    if (!depositReferenceNo.trim()) {
      setError("Please enter the bank transaction or deposit slip reference number.");
      return;
    }

    if (!proofFile) {
      setError("Please upload a clear picture or PDF of your bank deposit receipt / transfer screenshot.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const newRefNo = `THF-PAY-26-000${INITIAL_SUBMISSIONS.length + 1}`;

      // Redirect to success page with ref number
      router.push(`/payment/success?ref=${newRefNo}&student=${encodeURIComponent(selectedStudent.fullName)}&month=${paymentMonth}`);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Submit Tuition Payment Proof"
        subtitle="Upload bank transfer receipts for instant administrative review and automated email confirmation."
        badgeText="Step 2 of 2"
        action={
          <Link href="/">
            <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-thofnaa-navy">
              <ArrowLeft className="w-4 h-4" /> Back to Verification
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Submission Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Confirmation Header Card */}
            <Card goldHeaderBorder>
              <CardHeader className="bg-thofnaa-navy-50/50">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-thofnaa-navy" />
                  Student & Academic Details
                </CardTitle>
                <CardDescription>
                  Confirm student registration number for tuition credit.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Student Reg Number"
                    value={studentRegNo}
                    onChange={(e) => setStudentRegNo(e.target.value.toUpperCase())}
                    placeholder="THF-26-0001"
                    required
                  />
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-thofnaa-charcoal mb-1.5">
                      Tuition Fee
                    </label>
                    <div className="px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm font-bold text-thofnaa-navy font-mono">
                      LKR {THOFNAA_CONFIG.tuition.monthlyFeeLKR.toLocaleString()}.00 / Month
                    </div>
                  </div>
                </div>

                {selectedStudent ? (
                  <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs space-y-1">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-thofnaa-emerald" />
                      <span>{selectedStudent.fullName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-mono">
                        {selectedStudent.gradeLevel}
                      </span>
                    </div>
                    <p className="text-emerald-800 text-[11px]">
                      Parent Email: <strong>{selectedStudent.guardianEmail}</strong> • WhatsApp: <strong>{selectedStudent.guardianPhone}</strong>
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Enter a valid registration number (e.g. THF-26-0001) to confirm student profile.</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-thofnaa-gold" />
                  Payment Period & Transaction Info
                </CardTitle>
                <CardDescription>
                  Specify which month this tuition fee payment covers.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Tuition Payment Month"
                    value={paymentMonth}
                    onChange={(e) => setPaymentMonth(e.target.value)}
                    options={THOFNAA_CONFIG.months}
                    required
                  />

                  <Select
                    label="Payment Transfer Method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    options={[
                      "Online Bank Transfer",
                      "Cash Deposit Machine (CDM)",
                      "Bank Branch Cash Deposit",
                      "Standing Order",
                    ]}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Bank Transferred To"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="People's Bank"
                    required
                  />

                  <Input
                    label="Deposit / Transfer Date"
                    type="date"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Bank Reference / Deposit Slip No."
                  value={depositReferenceNo}
                  onChange={(e) => setDepositReferenceNo(e.target.value)}
                  placeholder="e.g. PB-998231 or CDM reference code"
                  helperText="Printed on your deposit receipt or displayed in your banking app confirmation."
                  required
                />
              </CardContent>
            </Card>

            {/* Proof Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="w-5 h-5 text-thofnaa-emerald" />
                  Upload Payment Proof Receipt
                </CardTitle>
                <CardDescription>
                  Attach clear screenshot or photo of bank receipt (PNG, JPG, PDF up to 5MB).
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 hover:border-thofnaa-navy rounded-xl p-6 text-center bg-gray-50/60 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-thofnaa-navy/10 text-thofnaa-navy flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-thofnaa-navy">Click to browse</span> or drag and drop receipt file
                    </div>
                    <p className="text-[11px] text-thofnaa-charcoal-muted">
                      Supports JPG, PNG or PDF (Maximum 5MB)
                    </p>
                  </div>
                </div>

                {proofFile && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-thofnaa-emerald shrink-0" />
                      <div className="text-xs">
                        <p className="font-bold text-thofnaa-navy">{proofFile.name}</p>
                        <p className="text-[10px] text-thofnaa-charcoal-muted">
                          {(proofFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-thofnaa-emerald uppercase tracking-wider">
                      Ready
                    </span>
                  </div>
                )}

                {proofPreviewUrl && (
                  <div className="mt-2 text-center">
                    <p className="text-[11px] text-thofnaa-charcoal-muted mb-1 font-medium">Receipt Image Preview:</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={proofPreviewUrl}
                      alt="Proof Preview"
                      className="max-h-48 rounded-lg mx-auto border border-gray-300 shadow-xs"
                    />
                  </div>
                )}

                <FormError message={error} />
              </CardContent>

              <CardFooter className="bg-gray-50 flex justify-end">
                <Button
                  type="submit"
                  variant="success"
                  size="lg"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto font-bold"
                >
                  Submit Payment Proof for Verification
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>

        {/* Right Column (5 cols): Bank Account Card */}
        <div className="lg:col-span-5 space-y-6">
          <BankAccountCard />

          <div className="p-5 rounded-xl bg-white border border-gray-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-thofnaa-navy flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-thofnaa-gold" />
              What Happens Next?
            </h4>
            <ul className="text-xs text-thofnaa-charcoal-muted space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-bold text-thofnaa-navy">1.</span>
                <span>You will receive an instant payment reference code (e.g. <strong className="font-mono text-thofnaa-navy">THF-PAY-26-0004</strong>).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-thofnaa-navy">2.</span>
                <span>THOFNAA administrators will cross-verify your deposit against our People&apos;s Bank statement.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-thofnaa-navy">3.</span>
                <span>An official receipt confirmation will be emailed to your guardian address.</span>
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
    <Suspense fallback={<div className="p-10 text-center text-sm font-semibold">Loading payment portal...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
