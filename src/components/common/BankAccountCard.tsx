"use client";

import React, { useState } from "react";
import { Copy, Check, Landmark, ShieldCheck, HelpCircle } from "lucide-react";
import { THOFNAA_CONFIG } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export function BankAccountCard() {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedName, setCopiedName] = useState(false);

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(THOFNAA_CONFIG.bankDetails.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCopyName = () => {
    navigator.clipboard.writeText(THOFNAA_CONFIG.bankDetails.accountHolder);
    setCopiedName(true);
    setTimeout(() => setCopiedName(false), 2000);
  };

  return (
    <Card goldHeaderBorder className="bg-gradient-to-br from-white via-thofnaa-ivory to-white border-2 border-thofnaa-navy/20 shadow-md">
      <CardHeader className="bg-thofnaa-navy text-white py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-thofnaa-gold text-thofnaa-navy">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-white text-base">THOFNAA Official Bank Details</CardTitle>
              <CardDescription className="text-thofnaa-gold text-xs font-mono">
                Direct Bank Transfer & Cash Deposit Instructions
              </CardDescription>
            </div>
          </div>
          <span className="text-[11px] font-semibold uppercase px-2.5 py-1 rounded bg-thofnaa-emerald text-white shadow-xs">
            LKR {THOFNAA_CONFIG.tuition.monthlyFeeLKR.toLocaleString()} / Month
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-5">
        {/* Bank Name */}
        <div className="p-3 rounded-lg bg-thofnaa-navy-50 border border-thofnaa-navy-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-thofnaa-charcoal-muted">Bank Name</span>
            <p className="text-sm font-bold text-thofnaa-navy">{THOFNAA_CONFIG.bankDetails.bankName}</p>
          </div>
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-thofnaa-navy/10 text-thofnaa-navy">
            Islandwide Branch Network
          </span>
        </div>

        {/* Account Number with 1-click Copy */}
        <div className="p-3.5 rounded-lg bg-white border-2 border-thofnaa-gold/60 shadow-xs flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-thofnaa-charcoal-muted block">Account Number</span>
            <span className="text-lg font-mono font-extrabold text-thofnaa-navy tracking-wider">
              {THOFNAA_CONFIG.bankDetails.accountNumber}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyAccount}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-thofnaa-navy text-white hover:bg-thofnaa-navy-600 text-xs font-medium transition-all shadow-xs shrink-0"
            title="Copy Account Number"
          >
            {copiedAccount ? (
              <>
                <Check className="w-3.5 h-3.5 text-thofnaa-gold" />
                <span className="text-thofnaa-gold font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Number</span>
              </>
            )}
          </button>
        </div>

        {/* Account Holder Name with 1-click Copy */}
        <div className="p-3 rounded-lg bg-white border border-gray-200 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-thofnaa-charcoal-muted block">Account Holder Name</span>
            <span className="text-sm font-bold text-thofnaa-charcoal">
              {THOFNAA_CONFIG.bankDetails.accountHolder}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyName}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 text-thofnaa-charcoal hover:bg-gray-200 text-xs font-medium transition-all shrink-0"
            title="Copy Account Holder Name"
          >
            {copiedName ? (
              <>
                <Check className="w-3 h-3 text-thofnaa-emerald" />
                <span className="text-thofnaa-emerald font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-gray-600" />
                <span>Copy Name</span>
              </>
            )}
          </button>
        </div>

        {/* Reference Notice Box */}
        <div className="p-3 rounded-lg bg-amber-50/90 border border-amber-200 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Important Deposit Reference Note</span>
          </div>
          <p className="text-amber-800 leading-relaxed text-[11px]">
            Please enter student&apos;s registration number (e.g., <strong className="font-mono">THF-26-0001</strong>) or student&apos;s full name as the transfer remark / reference.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
