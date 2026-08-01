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
export const INITIAL_AUDIT_LOGS: AuditLogRecord[] = [];

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
