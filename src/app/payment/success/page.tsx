"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Copy, Check, Download, ArrowRight, Home, SearchCheck, MailCheck, ShieldCheck } from "lucide-react";
import { THOFNAA_CONFIG } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  const paymentRef = searchParams.get("ref") || "THF-PAY-26-0004";
  const studentName = searchParams.get("student") || "Kasun Kalhara Perera";
  const month = searchParams.get("month") || "February";

  const [copied, setCopied] = useState(false);

  const handleCopyRef = () => {
    navigator.clipboard.writeText(paymentRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      <Card goldHeaderBorder className="shadow-academic border-2 border-thofnaa-emerald/40 overflow-hidden">
        <div className="bg-gradient-to-br from-thofnaa-navy via-thofnaa-navy-800 to-thofnaa-emerald text-white p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-thofnaa-gold text-thofnaa-navy flex items-center justify-center mx-auto shadow-gold">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest font-mono text-thofnaa-gold font-bold">
              Payment Submission Received
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Thank You! Proof Submitted
            </h1>
            <p className="text-xs text-thofnaa-ivory/80 max-w-md mx-auto leading-relaxed">
              Your payment proof has been successfully logged into the THOFNAA administrative verification queue.
            </p>
          </div>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Reference Number Box */}
          <div className="p-5 rounded-xl bg-thofnaa-ivory border-2 border-thofnaa-navy/20 space-y-2 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-thofnaa-charcoal-muted block font-mono">
              Your Unique Payment Reference Code
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-thofnaa-navy tracking-wider">
                {paymentRef}
              </span>
              <button
                type="button"
                onClick={handleCopyRef}
                className="p-2 rounded-lg bg-thofnaa-navy text-white hover:bg-thofnaa-navy-600 transition-colors shadow-xs"
                title="Copy Reference Code"
              >
                {copied ? <Check className="w-4 h-4 text-thofnaa-gold" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copied && <span className="text-xs text-thofnaa-emerald font-bold block">Copied to clipboard!</span>}
          </div>

          {/* Submission Overview Table */}
          <div className="space-y-3 text-xs border border-gray-200 rounded-xl p-4 bg-white">
            <h4 className="font-bold text-thofnaa-navy uppercase tracking-wider text-[11px] border-b border-gray-100 pb-2">
              Submission Summary
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <span className="text-thofnaa-charcoal-muted">Student Name:</span>
              <strong className="text-thofnaa-navy text-right font-serif">{studentName}</strong>

              <span className="text-thofnaa-charcoal-muted">Tuition Month:</span>
              <strong className="text-thofnaa-navy text-right">{month} 2026</strong>

              <span className="text-thofnaa-charcoal-muted">Amount:</span>
              <strong className="text-thofnaa-emerald text-right font-mono font-bold">
                LKR {THOFNAA_CONFIG.tuition.monthlyFeeLKR.toLocaleString()}.00
              </strong>

              <span className="text-thofnaa-charcoal-muted">Status:</span>
              <strong className="text-amber-700 text-right uppercase font-mono">
                PENDING VERIFICATION
              </strong>
            </div>
          </div>

          {/* Automated Receipt Info */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900">
            <MailCheck className="w-5 h-5 text-thofnaa-emerald shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-emerald-950">Automated Parent Email Receipt</h5>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Once THOFNAA administration verifies your deposit against People&apos;s Bank statement, an official tuition receipt with PDF download link will be emailed automatically to your guardian email address.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-gray-50 flex flex-col sm:flex-row gap-3 justify-between">
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="md" leftIcon={<Home className="w-4 h-4" />} className="w-full">
              Back to Home
            </Button>
          </Link>

          <Link href="/payment/status" className="w-full sm:w-auto">
            <Button variant="primary" size="md" rightIcon={<SearchCheck className="w-4 h-4" />} className="w-full font-bold">
              Track Verification Status
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm font-semibold">Loading confirmation details...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
