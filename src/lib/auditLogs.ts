/**
 * THOFNAA INSTITUTE - IMMUTABLE ADMIN AUDIT LOG SERVICE
 * 
 * Provides structured audit logging for all administrative decisions,
 * payment verifications, student profile updates, and email resends.
 */

export type AuditActionType =
  | "payment_verified"
  | "payment_rejected"
  | "payment_needs_clarification"
  | "payment_note_updated"
  | "student_updated"
  | "student_deactivated"
  | "confirmation_email_resent";

export type AuditEntityType = "payments" | "students";

export interface AuditLogRecord {
  id: string;
  adminName: string;
  adminEmail: string;
  action: AuditActionType;
  entityType: AuditEntityType;
  entityId: string;
  entityRef: string; // e.g. THF-PAY-26-0001 or THF-26-0001
  oldValues?: Record<string, any> | null;
  newValues: Record<string, any>;
  timestamp: string;
}

/**
 * INITIAL AUDIT LOG TRAIL DATASET
 */
export const INITIAL_AUDIT_LOGS: AuditLogRecord[] = [
  {
    id: "aud-101",
    adminName: "Umer Ahsen",
    adminEmail: "admin@thofnaa.edu.lk",
    action: "payment_verified",
    entityType: "payments",
    entityId: "sub-101",
    entityRef: "THF-PAY-26-0001",
    oldValues: { status: "PENDING", paymentRef: null },
    newValues: { status: "VERIFIED", paymentRef: "THF-PAY-26-0001", verifiedBy: "Umer Ahsen" },
    timestamp: "2026-01-31T14:25:10.000Z",
  },
  {
    id: "aud-102",
    adminName: "Umer Ahsen",
    adminEmail: "admin@thofnaa.edu.lk",
    action: "confirmation_email_resent",
    entityType: "payments",
    entityId: "sub-101",
    entityRef: "THF-PAY-26-0001",
    oldValues: null,
    newValues: { recipientEmail: "demo.parent.kasun@example.com", resendStatus: "SUCCESS" },
    timestamp: "2026-01-31T14:26:02.000Z",
  },
  {
    id: "aud-103",
    adminName: "Umer Ahsen",
    adminEmail: "admin@thofnaa.edu.lk",
    action: "payment_needs_clarification",
    entityType: "payments",
    entityId: "sub-102",
    entityRef: "THF-26-0002",
    oldValues: { status: "PENDING" },
    newValues: { status: "CLARIFICATION_NEEDED", adminNote: "Deposit slip image is cropped. Please re-upload clear slip." },
    timestamp: "2026-02-01T09:12:44.000Z",
  },
  {
    id: "aud-104",
    adminName: "Staff Admin",
    adminEmail: "staff@thofnaa.edu.lk",
    action: "student_updated",
    entityType: "students",
    entityId: "std-003",
    entityRef: "THF-26-0003",
    oldValues: { guardianPhone: "+94 75 000 0000" },
    newValues: { guardianPhone: "+94 75 000 0003", guardianEmail: "demo.parent.rilwan@example.com" },
    timestamp: "2026-02-01T10:05:18.000Z",
  },
  {
    id: "aud-105",
    adminName: "Umer Ahsen",
    adminEmail: "admin@thofnaa.edu.lk",
    action: "payment_rejected",
    entityType: "payments",
    entityId: "sub-103",
    entityRef: "THF-26-0004",
    oldValues: { status: "PENDING" },
    newValues: { status: "REJECTED", rejectionReason: "Incorrect bank account specified on slip." },
    timestamp: "2026-02-01T11:40:00.000Z",
  },
];

/**
 * Log a new Audit Entry to the in-memory store
 */
export function recordAuditLog(entry: Omit<AuditLogRecord, "id" | "timestamp">): AuditLogRecord {
  const newRecord: AuditLogRecord = {
    ...entry,
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  INITIAL_AUDIT_LOGS.unshift(newRecord);
  return newRecord;
}
