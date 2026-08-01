"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Copy, 
  Check, 
  ArrowRight, 
  PlusCircle,
  GraduationCap
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";
import { StatusBadge, PaymentStatus } from "@/components/ui/StatusBadge";
import { formatLKR } from "@/lib/utils";
import { lookupPaymentStatusAction, PaymentHistoryItem } from "@/app/actions/paymentStatusLookupAction";

export default function PaymentStatusPage() {
  const [studentRegNo, setStudentRegNo] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [studentInfo, setStudentInfo] = useState<{
    registrationNo: string;
    nameWithInitials: string;
    grade: string;
    programme: string;
  } | null>(null);

  const [history, setHistory] = useState<PaymentHistoryItem[] | null>(null);
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!studentRegNo.trim() || !parentEmail.trim()) {
      setErrorMessage("Please enter both Registration Number and Parent Email.");
      return;
    }

    setIsLoading(true);
    const result = await lookupPaymentStatusAction({
      studentRegNo,
      parentEmail,
    });
    setIsLoading(false);

    if (result.success && result.studentInfo && result.history) {
      setStudentInfo(result.studentInfo);
      setHistory(result.history);
    } else {
      setErrorMessage(result.error || "No matching student record found.");
      setStudentInfo(null);
      setHistory(null);
    }
  };

  const handleCopyReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(ref);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <PageHeader
        title="Check Payment Status & History"
        subtitle="Dual-factor secure lookup for THOFNAA INSTITUTE Sinhala tuition payment verification records."
        badgeText="Parent Portal"
      />

      {/* 2-FACTOR SECURE LOOKUP FORM */}
      <Card goldHeaderBorder className="shadow-lg">
        <CardHeader className="bg-thofnaa-navy text-white py-6">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Lock className="w-4 h-4 text-thofnaa-gold" /> Secure Payment History Lookup
          </CardTitle>
          <CardDescription className="text-thofnaa-gold text-xs">
            Enter Student Registration Number and Parent Email to verify payment status.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Student Registration Number *"
                placeholder="e.g. THF-26-0001"
                value={studentRegNo}
                onChange={(e) => setStudentRegNo(e.target.value.toUpperCase())}
                leftIcon={<Search className="w-4 h-4" />}
                required
              />

              <Input
                label="Parent Email Address *"
                type="email"
                placeholder="e.g. parent@example.com"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />
            </div>

            <FormError message={errorMessage} />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <span className="text-[11px] text-thofnaa-charcoal-muted flex items-center gap-1">
                🔒 Requires both Registration No & Parent Email for student privacy.
              </span>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto font-bold shadow-md"
              >
                Lookup Payment History
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* RESULTS DISPLAY PANEL */}
      {studentInfo && history && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          
          {/* STUDENT SUMMARY CARD */}
          <Card goldHeaderBorder className="shadow-md bg-thofnaa-ivory border border-thofnaa-gold/40">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-thofnaa-gold/20 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-thofnaa-navy text-thofnaa-gold flex items-center justify-center font-serif font-bold text-lg shadow-md shrink-0">
                    {studentInfo.nameWithInitials.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-thofnaa-navy text-lg">
                      {studentInfo.nameWithInitials}
                    </h3>
                    <p className="text-xs text-thofnaa-charcoal-muted font-mono">
                      Registration No: <strong className="text-thofnaa-navy">{studentInfo.registrationNo}</strong>
                    </p>
                  </div>
                </div>

                <Link href="/payment">
                  <Button variant="success" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
                    Submit New Payment
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-thofnaa-charcoal-muted block font-mono text-[10px] uppercase">Grade Level</span>
                  <strong className="text-thofnaa-navy font-semibold">{studentInfo.grade}</strong>
                </div>
                <div>
                  <span className="text-thofnaa-charcoal-muted block font-mono text-[10px] uppercase">Programme</span>
                  <strong className="text-thofnaa-navy font-semibold">{studentInfo.programme}</strong>
                </div>
                <div>
                  <span className="text-thofnaa-charcoal-muted block font-mono text-[10px] uppercase">Monthly Tuition Fee</span>
                  <strong className="text-thofnaa-emerald font-mono font-bold">LKR 1,000.00</strong>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 12-MONTH TUITION PAYMENT HISTORY ROSTER */}
          <Card goldHeaderBorder className="shadow-lg">
            <CardHeader className="bg-thofnaa-navy text-white flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-thofnaa-gold" /> 2026 Academic Payment History
                </CardTitle>
                <CardDescription className="text-thofnaa-gold text-xs">
                  Official verification record for THOFNAA tuition receipts.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-gray-100">
              {history.map((item, idx) => {
                const isVerified = item.status === "VERIFIED";
                const isPending = item.status === "PENDING";
                const isClarification = item.status === "CLARIFICATION_NEEDED";
                const isRejected = item.status === "REJECTED";
                const isNotSubmitted = item.status === "NOT_SUBMITTED";

                return (
                  <div
                    key={idx}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors"
                  >
                    {/* Left: Month & Amount */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-thofnaa-navy text-sm">
                          {item.monthYear}
                        </span>
                        {item.submittedDate && (
                          <span className="text-[10px] text-thofnaa-charcoal-muted font-mono bg-gray-100 px-2 py-0.5 rounded-full">
                            Submitted: {item.submittedDate}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono text-thofnaa-emerald font-semibold block">
                        Tuition Fee: {formatLKR(item.amountLKR)}
                      </span>
                    </div>

                    {/* Center/Right: Status Badge & Reference */}
                    <div className="flex flex-wrap items-center gap-3">
                      {isNotSubmitted ? (
                        <span className="text-xs font-medium text-gray-400 italic bg-gray-100 px-3 py-1 rounded-full">
                          No payment submitted
                        </span>
                      ) : (
                        <StatusBadge status={item.status as PaymentStatus} size="sm" />
                      )}

                      {/* Payment Reference Display with Copy Action */}
                      {item.paymentReference && (
                        <div className="flex items-center gap-1.5 bg-thofnaa-ivory border border-thofnaa-gold/40 px-3 py-1 rounded-xl text-xs">
                          <span className="font-mono text-[10px] text-thofnaa-charcoal-muted uppercase">Ref:</span>
                          <strong className="font-mono text-thofnaa-navy text-xs">{item.paymentReference}</strong>
                          <button
                            type="button"
                            onClick={() => handleCopyReference(item.paymentReference!)}
                            className="ml-1 text-thofnaa-navy hover:text-thofnaa-gold transition-colors"
                            title="Copy Payment Reference"
                          >
                            {copiedRef === item.paymentReference ? (
                              <Check className="w-3.5 h-3.5 text-thofnaa-emerald" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      {isNotSubmitted && (
                        <Link href="/payment">
                          <Button variant="outline" size="sm" className="text-xs bg-white">
                            Submit Proof
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>

            <CardFooter className="bg-gray-50 text-[11px] text-thofnaa-charcoal-muted justify-between">
              <span>🔒 Verification records are updated in real-time by THOFNAA Administration.</span>
              <span className="font-mono">Contact: tthofnaa@gmail.com</span>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
