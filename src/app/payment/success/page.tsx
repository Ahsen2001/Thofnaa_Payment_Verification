"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Search, 
  Home, 
  GraduationCap, 
  Clock, 
  MailCheck, 
  ShieldCheck, 
  ArrowRight 
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatLKR } from "@/lib/utils";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);

  // Extract safe params from URL query string
  const referenceNo = searchParams.get("ref") || "THF-PAY-26-0001";
  const studentName = searchParams.get("student") || "[DEMO] Kasun Kalhara Perera";
  const regNo = searchParams.get("regNo") || "THF-26-0001";
  const paymentMonth = searchParams.get("month") || "August";
  const academicYear = searchParams.get("year") || "2026";
  const amountPaid = Number(searchParams.get("amount")) || 1000;

  const handleCopyReference = () => {
    navigator.clipboard.writeText(referenceNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <PageHeader
        title="THOFNAA INSTITUTE"
        subtitle="Official Student Payment Proof Submission Confirmation"
        badgeText="Submission Complete"
      />

      {/* MAIN SUCCESS CARD */}
      <Card goldHeaderBorder className="shadow-lg border-2 border-thofnaa-emerald/30 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-thofnaa-navy to-thofnaa-navy/90 text-white text-center py-8 relative">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-thofnaa-gold/20 text-thofnaa-gold flex items-center justify-center mb-3 shadow-gold border border-thofnaa-gold/40">
            <CheckCircle2 className="w-10 h-10 text-thofnaa-gold" />
          </div>
          <CardTitle className="text-2xl font-serif text-white">
            Payment Proof Submitted
          </CardTitle>
          <CardDescription className="text-thofnaa-gold/90 text-sm">
            Thank you. Your tuition deposit receipt has been safely received.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pt-6 px-6 sm:px-8">
          
          {/* SAFE SUBMISSION REFERENCE CODE BOX */}
          <div className="p-4 rounded-2xl bg-thofnaa-ivory border border-thofnaa-gold/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <span className="text-thofnaa-charcoal-muted block text-xs font-mono uppercase tracking-wider">
                Submission Reference Number
              </span>
              <strong className="text-thofnaa-navy font-mono text-xl sm:text-2xl font-extrabold tracking-tight">
                {referenceNo}
              </strong>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyReference}
              leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              className="bg-white text-xs font-mono border-gray-300 hover:bg-gray-50"
            >
              {copied ? "Copied!" : "Copy Ref"}
            </Button>
          </div>

          {/* RECEIPT SUMMARY GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white p-5 rounded-2xl border border-gray-200">
            <div>
              <span className="text-thofnaa-charcoal-muted block text-xs font-mono uppercase">Student Registration No</span>
              <strong className="text-thofnaa-navy font-mono text-base">{regNo}</strong>
            </div>

            <div>
              <span className="text-thofnaa-charcoal-muted block text-xs font-mono uppercase">Student Name</span>
              <strong className="text-thofnaa-navy font-serif text-base">{studentName}</strong>
            </div>

            <div className="pt-2 sm:pt-0">
              <span className="text-thofnaa-charcoal-muted block text-xs font-mono uppercase">Payment Period</span>
              <strong className="text-thofnaa-navy text-base">{paymentMonth} {academicYear}</strong>
            </div>

            <div className="pt-2 sm:pt-0">
              <span className="text-thofnaa-charcoal-muted block text-xs font-mono uppercase">Amount Paid</span>
              <strong className="text-thofnaa-emerald font-mono text-lg font-extrabold">{formatLKR(amountPaid)}</strong>
            </div>

            <div className="col-span-1 sm:col-span-2 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-thofnaa-charcoal-muted block text-xs font-mono uppercase">Current Status</span>
              <StatusBadge status="PENDING" label="Pending Verification" />
            </div>
          </div>

          {/* REQUIRED OFFICIAL GUIDANCE MESSAGE */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs sm:text-sm text-blue-950 flex items-start gap-3 leading-relaxed">
            <MailCheck className="w-5 h-5 text-thofnaa-navy shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-thofnaa-navy mb-1">Next Steps & Email Confirmation:</p>
              <p>
                Your payment proof has been received and is waiting for verification by THOFNAA INSTITUTE. You will receive a confirmation email after your payment is approved.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-gray-50/80 p-6 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-gray-200">
          <Link href={`/payment/status?ref=${encodeURIComponent(referenceNo)}`} className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Search className="w-5 h-5" />}
              className="w-full sm:w-auto font-bold shadow-md"
            >
              Check Payment Status
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              leftIcon={<Home className="w-5 h-5" />}
              className="w-full sm:w-auto font-bold bg-white border-gray-300"
            >
              Return Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm font-semibold">Loading payment receipt confirmation...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
