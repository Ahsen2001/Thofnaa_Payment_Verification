"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  History, 
  Search, 
  Filter, 
  RotateCcw, 
  Eye, 
  Lock, 
  ShieldCheck, 
  UserCheck, 
  FileCheck2, 
  AlertTriangle, 
  XCircle, 
  Mail, 
  ChevronLeft, 
  ChevronRight,
  Clock
} from "lucide-react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { INITIAL_AUDIT_LOGS, AuditLogRecord, AuditActionType } from "@/lib/auditLogs";

export default function AdminAuditTrailPage() {
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState("All");
  const [selectedAction, setSelectedAction] = useState("All");
  const [selectedEntityType, setSelectedEntityType] = useState("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Log Record for Diff Inspection Modal
  const [inspectRecord, setInspectRecord] = useState<AuditLogRecord | null>(null);

  // Filter Audit Dataset
  const filteredLogs = useMemo(() => {
    return INITIAL_AUDIT_LOGS.filter((log) => {
      // 1. Search Query Filter (Admin Name, Ref, or Entity ID)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesAdmin = log.adminName.toLowerCase().includes(query);
        const matchesRef = log.entityRef.toLowerCase().includes(query);
        const matchesAction = log.action.toLowerCase().includes(query);
        if (!matchesAdmin && !matchesRef && !matchesAction) return false;
      }

      // 2. Admin Filter
      if (selectedAdmin !== "All" && !log.adminName.toLowerCase().includes(selectedAdmin.toLowerCase())) {
        return false;
      }

      // 3. Action Filter
      if (selectedAction !== "All" && log.action !== selectedAction) {
        return false;
      }

      // 4. Entity Type Filter
      if (selectedEntityType !== "All" && log.entityType !== selectedEntityType) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedAdmin, selectedAction, selectedEntityType]);

  // Paginated Roster
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedAdmin("All");
    setSelectedAction("All");
    setSelectedEntityType("All");
    setCurrentPage(1);
  };

  // Helper Badge Color for Audit Actions
  const renderActionBadge = (action: AuditActionType) => {
    switch (action) {
      case "payment_verified":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase">
            <ShieldCheck className="w-3 h-3 text-thofnaa-emerald" /> VERIFIED
          </span>
        );
      case "payment_rejected":
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-800 border border-red-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase">
            <XCircle className="w-3 h-3 text-red-600" /> REJECTED
          </span>
        );
      case "payment_needs_clarification":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> CLARIFICATION
          </span>
        );
      case "confirmation_email_resent":
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase">
            <Mail className="w-3 h-3 text-purple-600" /> EMAIL RESENT
          </span>
        );
      case "student_updated":
      case "payment_note_updated":
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase">
            <UserCheck className="w-3 h-3 text-blue-600" /> UPDATED
          </span>
        );
      case "student_deactivated":
        return (
          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 border border-gray-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase">
            <Lock className="w-3 h-3 text-gray-500" /> DEACTIVATED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-700 border border-gray-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono uppercase">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 space-y-8 min-w-0">
        <PageHeader
          title="System Audit Trail Log"
          subtitle="Immutable security audit records tracking all payment verifications, status decisions, profile edits, and system actions."
          badgeText="Compliance & Security"
          action={
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-thofnaa-navy text-white px-3 py-1.5 rounded-xl border border-thofnaa-gold/30">
                Total Audit Entries: {INITIAL_AUDIT_LOGS.length}
              </span>
            </div>
          }
        />

        {/* IMMUTABLE LOG NOTICE BANNER */}
        <div className="p-4 rounded-2xl bg-thofnaa-navy text-white flex items-center justify-between border-2 border-thofnaa-gold">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-thofnaa-gold text-thofnaa-navy flex items-center justify-center font-bold shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-thofnaa-gold font-mono uppercase tracking-wider block font-bold">
                Immutable Security Log
              </span>
              <p className="text-xs text-white/90">
                Audit logs are strictly write-once records. No administrator may modify or delete audit entries from this interface.
              </p>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR CARD */}
        <Card goldHeaderBorder className="shadow-md">
          <CardHeader className="bg-white border-b border-gray-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="w-4 h-4 text-thofnaa-navy" /> Search & Filter Audit Log
                </CardTitle>
                <CardDescription>
                  Filter audit entries by administrator, action type, entity model, or reference code.
                </CardDescription>
              </div>

              {(searchQuery || selectedAdmin !== "All" || selectedAction !== "All" || selectedEntityType !== "All") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  className="text-xs text-thofnaa-navy hover:bg-gray-100 self-start sm:self-auto"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Search Input */}
              <div className="lg:col-span-4">
                <Input
                  label="Search Admin / Ref Code / Action"
                  placeholder="e.g. Umer Ahsen or THF-PAY-26-0001"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>

              {/* Filters */}
              <div className="lg:col-span-8 grid grid-cols-3 gap-3">
                <Select
                  label="Administrator"
                  value={selectedAdmin}
                  onChange={(e) => {
                    setSelectedAdmin(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={["All", "Umer Ahsen", "Staff Admin"]}
                />

                <Select
                  label="Action Type"
                  value={selectedAction}
                  onChange={(e) => {
                    setSelectedAction(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={[
                    "All",
                    "payment_verified",
                    "payment_rejected",
                    "payment_needs_clarification",
                    "payment_note_updated",
                    "student_updated",
                    "student_deactivated",
                    "confirmation_email_resent",
                  ]}
                />

                <Select
                  label="Entity Type"
                  value={selectedEntityType}
                  onChange={(e) => {
                    setSelectedEntityType(e.target.value);
                    setCurrentPage(1);
                  }}
                  options={["All", "payments", "students"]}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AUDIT ROSTER TABLE CARD */}
        <Card goldHeaderBorder className="shadow-md">
          <CardHeader className="bg-thofnaa-navy text-white flex flex-row items-center justify-between py-4">
            <div>
              <CardTitle className="text-white text-base">Audit Trail Log Roster</CardTitle>
              <CardDescription className="text-thofnaa-gold text-xs">
                Showing {filteredLogs.length} audit entries
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {paginatedLogs.length === 0 ? (
              <div className="py-12">
                <EmptyState
                  title="No audit entries match your filters"
                  description="Try adjusting your administrator, action, or entity filters."
                  action={
                    <Button variant="outline" size="sm" onClick={handleResetFilters}>
                      Clear All Filters
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Administrator</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Inspection</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-thofnaa-ivory/50 transition-colors">
                        <TableCell className="text-[11px] text-thofnaa-charcoal-muted font-mono whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString("en-GB", {
                            dateStyle: "short",
                            timeStyle: "medium",
                          })}
                        </TableCell>

                        <TableCell className="text-xs">
                          <span className="font-bold text-thofnaa-navy block">{log.adminName}</span>
                          <span className="text-[10px] text-thofnaa-charcoal-muted font-mono">{log.adminEmail}</span>
                        </TableCell>

                        <TableCell>
                          {renderActionBadge(log.action)}
                        </TableCell>

                        <TableCell className="text-xs font-mono font-semibold uppercase text-thofnaa-navy">
                          {log.entityType}
                        </TableCell>

                        <TableCell className="font-mono text-xs font-bold text-thofnaa-navy">
                          {log.entityRef}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInspectRecord(log)}
                            leftIcon={<Eye className="w-3.5 h-3.5 text-thofnaa-navy" />}
                            className="bg-white text-xs"
                          >
                            Inspect Diff
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          {/* PAGINATION FOOTER */}
          {filteredLogs.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-thofnaa-charcoal-muted">
              <div>
                Showing <strong className="text-thofnaa-navy font-mono">{(currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
                <strong className="text-thofnaa-navy font-mono">
                  {Math.min(currentPage * itemsPerPage, filteredLogs.length)}
                </strong>{" "}
                of <strong className="text-thofnaa-navy font-mono">{filteredLogs.length}</strong> audit records
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                    className="bg-white text-xs"
                  >
                    Prev
                  </Button>

                  <span className="font-mono text-xs px-2 text-thofnaa-navy font-semibold">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    className="bg-white text-xs"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* INSPECTION DIFF MODAL */}
      <Modal
        isOpen={!!inspectRecord}
        onClose={() => setInspectRecord(null)}
        title={`Audit Entry Inspection: ${inspectRecord?.id}`}
      >
        {inspectRecord && (
          <div className="space-y-4 text-xs">
            <div className="bg-thofnaa-navy text-white p-4 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">{inspectRecord.adminName}</span>
                <span className="font-mono text-[10px] text-thofnaa-gold">
                  {new Date(inspectRecord.timestamp).toLocaleString("en-GB")}
                </span>
              </div>
              <p className="text-[11px] text-thofnaa-ivory/80 font-mono">
                {inspectRecord.adminEmail} • Entity: {inspectRecord.entityType} ({inspectRecord.entityRef})
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Old Values Box */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="font-mono font-bold text-[10px] text-gray-500 uppercase block mb-1">
                  Old Values (Previous State):
                </span>
                <pre className="font-mono text-[11px] bg-white p-2 rounded-lg border border-gray-200 overflow-x-auto text-gray-700">
                  {inspectRecord.oldValues ? JSON.stringify(inspectRecord.oldValues, null, 2) : "None (Initial Record)"}
                </pre>
              </div>

              {/* New Values Box */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="font-mono font-bold text-[10px] text-emerald-800 uppercase block mb-1">
                  New Values (Updated State):
                </span>
                <pre className="font-mono text-[11px] bg-white p-2 rounded-lg border border-emerald-200 overflow-x-auto text-emerald-950">
                  {JSON.stringify(inspectRecord.newValues, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-gray-200">
              <Button variant="outline" size="sm" onClick={() => setInspectRecord(null)}>
                Close Inspection
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
