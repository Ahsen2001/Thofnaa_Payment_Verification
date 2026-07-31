"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, SearchCheck, Clock, CheckCircle2, AlertCircle, FileText, ArrowRight, ShieldCheck } from "lucide-react";
import { INITIAL_SUBMISSIONS, PaymentSubmission } from "@/lib/mockData";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FormError } from "@/components/ui/FormError";

export default function PaymentStatusPage() {
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<PaymentSubmission[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResults(null);

    const query = searchInput.trim().toUpperCase();
    if (!query) {
      setError("Please enter a Payment Reference Code (e.g., THF-PAY-26-0001) or Student Reg Number.");
      return;
    }

    setIsSearching(true);

    setTimeout(() => {
      setIsSearching(false);
      const matches = INITIAL_SUBMISSIONS.filter(
        (sub) =>
          sub.paymentRef.toUpperCase() === query ||
          sub.studentRegNo.toUpperCase() === query
      );

      if (matches.length > 0) {
        setResults(matches);
      } else {
        setError(`No payment records found matching "${query}". Please check your receipt code or contact administration on WhatsApp.`);
      }
    }, 500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <PageHeader
        title="Check Payment Verification Status"
        subtitle="Track live administrative status of your tuition fee submission."
        badgeText="Public Lookup"
      />

      <Card goldHeaderBorder className="shadow-md">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="w-5 h-5 text-thofnaa-navy" />
            Track Payment Reference or Student Reg No
          </CardTitle>
          <CardDescription>
            Enter your generated reference (e.g. THF-PAY-26-0001) or Student Reg No (e.g. THF-26-0001).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="e.g. THF-PAY-26-0001 or THF-26-0001"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                leftIcon={<SearchCheck className="w-4 h-4" />}
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSearching}
              leftIcon={<Search className="w-4 h-4" />}
              className="px-6 font-bold"
            >
              Check Status
            </Button>
          </form>

          <FormError message={error} />

          {/* Search Results Display */}
          {results && results.length > 0 && (
            <div className="space-y-6 pt-4 border-t border-gray-100 animate-in fade-in duration-300">
              <h4 className="text-xs font-bold uppercase tracking-wider text-thofnaa-navy flex items-center gap-2">
                <FileText className="w-4 h-4 text-thofnaa-gold" />
                Found {results.length} Payment Submission(s)
              </h4>

              {results.map((sub) => (
                <div
                  key={sub.id}
                  className="p-6 rounded-xl border border-gray-200 bg-white shadow-xs space-y-4 hover:border-thofnaa-navy/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div>
                      <span className="text-[10px] font-bold font-mono text-thofnaa-charcoal-muted uppercase block">
                        Payment Reference
                      </span>
                      <span className="text-lg font-mono font-extrabold text-thofnaa-navy tracking-tight">
                        {sub.paymentRef}
                      </span>
                    </div>

                    <StatusBadge status={sub.status} size="lg" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-thofnaa-charcoal-muted block">Student Name</span>
                      <strong className="text-thofnaa-navy text-sm font-serif">{sub.studentName}</strong>
                      <p className="text-[11px] font-mono text-gray-500">{sub.studentRegNo}</p>
                    </div>

                    <div>
                      <span className="text-thofnaa-charcoal-muted block">Month & Fee</span>
                      <strong className="text-thofnaa-navy">{sub.paymentMonth} {sub.academicYear}</strong>
                      <p className="text-[11px] font-mono font-bold text-thofnaa-emerald">
                        LKR {sub.feeAmount.toLocaleString()}.00
                      </p>
                    </div>

                    <div>
                      <span className="text-thofnaa-charcoal-muted block">Deposit Date</span>
                      <strong className="text-thofnaa-navy">{sub.transactionDate}</strong>
                      <p className="text-[11px] font-mono text-gray-500">Ref: {sub.depositReferenceNo}</p>
                    </div>
                  </div>

                  {/* Clarification or Rejection Note alert if applicable */}
                  {sub.rejectionReason && (
                    <div className="p-3.5 rounded-lg bg-orange-50 border border-orange-200 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-orange-900 font-bold">
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                        <span>Administrative Feedback:</span>
                      </div>
                      <p className="text-orange-800 leading-relaxed text-[11px]">
                        {sub.rejectionReason}
                      </p>
                    </div>
                  )}

                  {sub.adminNotes && sub.status === "VERIFIED" && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                      <span className="font-bold">Admin Note:</span> {sub.adminNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
