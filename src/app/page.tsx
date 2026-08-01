"use client";

import React, { useState } from "react";
import useRouter from "next/navigation";
import Link from "next/link";
import { GraduationCap, Search, ArrowRight, ShieldCheck, CheckCircle2, CreditCard, Sparkles, BookOpen } from "lucide-react";
import { THOFNAA_CONFIG } from "@/lib/constants";
import { INITIAL_STUDENTS } from "@/lib/mockData";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";
import { BankAccountCard } from "@/components/common/BankAccountCard";

export default function HomePage() {
  const [regNoInput, setRegNoInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validatedStudent, setValidatedStudent] = useState<(typeof INITIAL_STUDENTS)[0] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidatedStudent(null);

    const formatted = regNoInput.trim().toUpperCase();
    if (!formatted) {
      setError("Please enter a valid THOFNAA Student Registration Number (e.g., THF-26-0001).");
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      const match = INITIAL_STUDENTS.find(
        (s) => s.studentRegNo.toUpperCase() === formatted
      );

      if (match) {
        setValidatedStudent(match);
      } else {
        setError(`Student Registration Number "${formatted}" was not found in our records. Please verify your registration card or contact support on WhatsApp.`);
      }
    }, 600);
  };

  return (
    <div className="space-y-12 pb-10">
      {/* Hero Banner with Academic Styling */}
      <section className="relative rounded-3xl bg-thofnaa-navy text-white overflow-hidden shadow-academic gold-border-top p-8 sm:p-12">
        <div className="absolute right-0 top-0 w-96 h-96 bg-thofnaa-gold/10 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="max-w-3xl relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-thofnaa-gold/20 text-thofnaa-gold border border-thofnaa-gold/40 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>THOFNAA SINHALA TUITION • ACADEMIC YEAR {THOFNAA_CONFIG.tuition.academicYear}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight leading-tight text-white">
            Sinhala Tuition Payment <br className="hidden sm:inline" />
            <span className="text-thofnaa-gold">Verification System</span>
          </h1>

          <p className="text-sm sm:text-base text-thofnaa-ivory/90 leading-relaxed font-sans max-w-2xl">
            Welcome to the official online payment proof verification portal. Enter your THOFNAA student registration number below to select your tuition month and upload bank transfer receipts.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-thofnaa-ivory/80">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-thofnaa-emerald" />
              <span>Monthly Fee: <strong>LKR 1,000.00</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-thofnaa-emerald" />
              <span>Auto Parent Email Receipt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-thofnaa-emerald" />
              <span>Admin Verified Security</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Student Lookup & Bank Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col (7 cols): Step 1 Student Verification */}
        <div className="lg:col-span-7 space-y-6">
          <Card goldHeaderBorder className="shadow-md">
            <CardHeader className="bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-thofnaa-navy text-white flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <CardTitle>Step 1: Student Verification</CardTitle>
                  <CardDescription>
                    Enter the student registration number printed on your THOFNAA ID card.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              <form onSubmit={handleLookup} className="space-y-4">
                <Input
                  label="Student Registration Number"
                  placeholder="e.g. THF-26-0001"
                  value={regNoInput}
                  onChange={(e) => setRegNoInput(e.target.value)}
                  leftIcon={<GraduationCap className="w-4 h-4" />}
                  helperText="Format: THF-YY-NNNN (e.g. THF-26-0001)"
                  required
                />

                <FormError message={error} />

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSearching}
                    leftIcon={<Search className="w-4 h-4" />}
                    className="w-full sm:w-auto"
                  >
                    Verify Student Details
                  </Button>
                  
                  <Link href="/payment/status" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full">
                      Track Existing Status
                    </Button>
                  </Link>
                </div>
              </form>

              {/* Verified Student Details Result Card */}
              {validatedStudent && (
                <div className="p-5 rounded-xl bg-emerald-50/80 border-2 border-thofnaa-emerald/40 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-thofnaa-emerald uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-thofnaa-emerald/30">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Student Confirmed
                      </span>
                      <h4 className="text-lg font-serif font-bold text-thofnaa-navy">
                        {validatedStudent.fullName}
                      </h4>
                      <p className="text-xs text-thofnaa-charcoal-muted font-mono">
                        Registration No: <strong className="text-thofnaa-navy">{validatedStudent.studentRegNo}</strong> • Grade: <strong>{validatedStudent.gradeLevel}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-thofnaa-charcoal">
                      <span>Guardian: </span>
                      <strong>{validatedStudent.guardianName}</strong> ({validatedStudent.guardianEmail})
                    </div>

                    <Link
                      href={{
                        pathname: "/payment",
                        query: { regNo: validatedStudent.studentRegNo },
                      }}
                    >
                      <Button
                        variant="success"
                        size="md"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                        className="w-full sm:w-auto font-bold"
                      >
                        Proceed to Payment Submission
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Steps Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-thofnaa-navy/10 text-thofnaa-navy flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h5 className="text-xs font-bold text-thofnaa-navy">Verify Reg No</h5>
              <p className="text-[11px] text-thofnaa-charcoal-muted">Confirm student identity and grade level.</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-thofnaa-gold/20 text-thofnaa-navy flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h5 className="text-xs font-bold text-thofnaa-navy">Upload Proof</h5>
              <p className="text-[11px] text-thofnaa-charcoal-muted">Select tuition month and upload transfer receipt.</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-thofnaa-emerald/10 text-thofnaa-emerald flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h5 className="text-xs font-bold text-thofnaa-navy">Receive Email</h5>
              <p className="text-[11px] text-thofnaa-charcoal-muted">Admin verifies proof & sends official receipt.</p>
            </div>
          </div>
        </div>

        {/* Right Col (5 cols): Bank Account Quick Card */}
        <div className="lg:col-span-5 space-y-6">
          <BankAccountCard />

          {/* Contact Support Card */}
          <div className="p-5 rounded-xl bg-thofnaa-navy text-white space-y-3 shadow-md">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-thofnaa-gold" />
              <h4 className="text-sm font-bold text-white font-serif">Need Help or Registration Assistance?</h4>
            </div>
            <p className="text-xs text-thofnaa-ivory/80 leading-relaxed">
              If you don&apos;t know your student registration number or need to register a new student for Sinhala tuition, reach out to THOFNAA administration via WhatsApp.
            </p>
            <div className="pt-1">
              <a
                href={THOFNAA_CONFIG.contact.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-thofnaa-gold text-thofnaa-navy font-bold text-xs hover:bg-thofnaa-gold-600 transition-colors shadow-gold"
              >
                <span>WhatsApp Administration</span>
                <span className="font-mono">{THOFNAA_CONFIG.contact.whatsappFormatted}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
