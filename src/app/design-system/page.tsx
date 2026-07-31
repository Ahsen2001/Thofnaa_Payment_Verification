"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Palette, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Upload, 
  Search, 
  Send, 
  ArrowRight,
  TrendingUp,
  Users,
  GraduationCap,
  Sparkles,
  Info
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";
import { Dropzone } from "@/components/ui/Dropzone";
import { MetricsCard } from "@/components/ui/MetricsCard";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { FormError } from "@/components/ui/FormError";

export default function DesignSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [inputText, setInputText] = useState("");
  const [inputError, setInputError] = useState("");

  const brandColors = [
    { name: "Primary Navy", hex: "#12355B", usage: "Headers, Primary Buttons, Main Branding", text: "text-white", bg: "bg-[#12355B]" },
    { name: "Emerald Green", hex: "#159A6A", usage: "Verified Status, Success Badges, Approval Actions", text: "text-white", bg: "bg-[#159A6A]" },
    { name: "Gold", hex: "#E7B33E", usage: "Secondary Buttons, Gold Trim Lines, Highlights", text: "text-thofnaa-navy", bg: "bg-[#E7B33E]" },
    { name: "Ivory Neutral", hex: "#F8F7F2", usage: "Application Background, Card Surfaces", text: "text-thofnaa-charcoal", bg: "bg-[#F8F7F2]" },
    { name: "Charcoal Neutral", hex: "#263238", usage: "Typography Body, High Contrast Text", text: "text-white", bg: "bg-[#263238]" },
    { name: "Pure White", hex: "#FFFFFF", usage: "Card Containers, Input Backgrounds", text: "text-thofnaa-charcoal", bg: "bg-white border border-gray-200" },
  ];

  return (
    <div className="space-y-12 pb-16 max-w-6xl mx-auto">
      <PageHeader
        title="THOFNAA UI Design System & Component Library"
        subtitle="Accessible, institutional web application components engineered with strict brand color compliance and high-contrast accessibility."
        badgeText="Institutional Design Tokens"
        action={
          <Link href="/admin">
            <Button variant="secondary" size="sm">
              Return to Admin Dashboard
            </Button>
          </Link>
        }
      />

      {/* 1. Brand Palette Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-thofnaa-navy flex items-center gap-2">
          <Palette className="w-5 h-5 text-thofnaa-gold" />
          1. Brand Color Tokens & Contrast Matrix
        </h2>
        <p className="text-xs text-thofnaa-charcoal-muted max-w-2xl">
          Restrained color palette ensuring modern educational aesthetics without color overuse.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {brandColors.map((col) => (
            <div key={col.hex} className="rounded-2xl border border-gray-200 shadow-academic-subtle overflow-hidden bg-white">
              <div className={`h-24 ${col.bg} ${col.text} p-4 flex flex-col justify-between`}>
                <span className="font-mono text-xs font-bold uppercase">{col.hex}</span>
                <span className="font-bold text-sm font-serif">{col.name}</span>
              </div>
              <div className="p-3 text-[11px] text-thofnaa-charcoal-muted">
                {col.usage}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Payment Status Badges */}
      <section className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-thofnaa-navy flex items-center gap-2">
          <Clock className="w-5 h-5 text-thofnaa-gold" />
          2. Payment Verification Status Badges
        </h2>
        <p className="text-xs text-thofnaa-charcoal-muted">
          Standardized badge badges: Pending (Amber), Verified (Green), Rejected (Red), Needs Clarification (Orange).
        </p>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-academic-subtle flex flex-wrap items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-gray-400 block">Pending</span>
            <StatusBadge status="PENDING" size="md" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-gray-400 block">Verified</span>
            <StatusBadge status="VERIFIED" size="md" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-gray-400 block">Rejected</span>
            <StatusBadge status="REJECTED" size="md" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono text-gray-400 block">Clarification Needed</span>
            <StatusBadge status="CLARIFICATION_NEEDED" size="md" />
          </div>
        </div>
      </section>

      {/* 3. Reusable Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-thofnaa-navy flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-thofnaa-gold" />
          3. Button Variants & States
        </h2>
        
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-academic-subtle space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="danger">Danger Button</Button>
            <Button variant="success">Success Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3">
            <Button variant="primary" isLoading>Loading State</Button>
            <Button variant="primary" leftIcon={<Send className="w-4 h-4" />}>Icon Left</Button>
            <Button variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>Icon Right</Button>
            <Button variant="danger" disabled>Disabled State</Button>
          </div>
        </div>
      </section>

      {/* 4. Alert Banners */}
      <section className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-thofnaa-navy flex items-center gap-2">
          <Info className="w-5 h-5 text-thofnaa-gold" />
          4. Accessible Alert Banners
        </h2>

        <div className="space-y-3">
          <Alert variant="info" title="System Announcement">
            THOFNAA online verification portal is updated for Academic Year 2026.
          </Alert>
          <Alert variant="success" title="Verification Approved">
            Payment reference THF-PAY-26-0001 verified! Parent confirmation receipt sent.
          </Alert>
          <Alert variant="warning" title="Action Required">
            Clarification requested for deposit slip reference number.
          </Alert>
          <Alert variant="error" title="Submission Rejected">
            Deposit reference number did not match People&apos;s Bank statement records.
          </Alert>
        </div>
      </section>

      {/* 5. Metrics & Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-thofnaa-navy flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-thofnaa-gold" />
          5. Dashboard Metrics Cards
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricsCard
            label="Verified Revenue"
            value="LKR 2,000.00"
            subtitle="2 Approved Submissions"
            icon={<CheckCircle2 className="w-6 h-6" />}
            variant="emerald"
          />
          <MetricsCard
            label="Pending Verification"
            value="1 Submission"
            subtitle="Requires Admin Action"
            icon={<Clock className="w-6 h-6" />}
            variant="amber"
          />
          <MetricsCard
            label="Enrolled Students"
            value="3 Active"
            subtitle="Sinhala Tuition Roster"
            icon={<Users className="w-6 h-6" />}
            variant="navy"
          />
        </div>
      </section>

      {/* 6. Upload Dropzone Component */}
      <section className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-thofnaa-navy flex items-center gap-2">
          <Upload className="w-5 h-5 text-thofnaa-gold" />
          6. Accessible Upload Dropzone
        </h2>

        <Card goldHeaderBorder>
          <CardContent className="pt-6">
            <Dropzone
              onFileSelect={(file) => setSampleFile(file)}
              selectedFile={sampleFile}
            />
          </CardContent>
        </Card>
      </section>

      {/* 7. Accessible Data Table */}
      <section className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-thofnaa-navy flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-thofnaa-gold" />
          7. Accessible Data Table
        </h2>

        <Table ariaLabel="Sample Verification Queue Table">
          <TableHeader>
            <TableRow>
              <TableHead>Ref Code</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Bank</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono font-bold text-thofnaa-navy">THF-PAY-26-0001</TableCell>
              <TableCell className="font-serif font-bold">Kasun Kalhara Perera</TableCell>
              <TableCell>January 2026</TableCell>
              <TableCell>People&apos;s Bank</TableCell>
              <TableCell><StatusBadge status="VERIFIED" size="sm" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono font-bold text-thofnaa-navy">THF-PAY-26-0002</TableCell>
              <TableCell className="font-serif font-bold">Dilini Senaratne</TableCell>
              <TableCell>February 2026</TableCell>
              <TableCell>People&apos;s Bank</TableCell>
              <TableCell><StatusBadge status="PENDING" size="sm" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      {/* 8. Accessible Modal Dialog */}
      <section className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-thofnaa-navy flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-thofnaa-gold" />
          8. Accessible Modal / Dialog Component
        </h2>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-academic-subtle flex items-center justify-between">
          <div>
            <h4 className="font-bold text-thofnaa-navy text-sm font-serif">Test Accessible Dialog Window</h4>
            <p className="text-xs text-thofnaa-charcoal-muted">Supports focus trap, backdrop blur, and Escape key dismissal.</p>
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Open Test Modal
          </Button>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="THOFNAA Verification Modal"
          description="Interactive design system modal component."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={() => setIsModalOpen(false)}>
                Confirm Action
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="leading-relaxed">
              This modal component features full WCAG accessibility compliance with <code>role=&quot;dialog&quot;</code>, keyboard focus trapping, escape key closing, and high-contrast headers.
            </p>
            <Input
              label="Modal Test Input"
              placeholder="Type test text..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>
        </Modal>
      </section>
    </div>
  );
}
