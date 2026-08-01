export interface Student {
  id: string;
  studentRegNo: string; // e.g. THF-26-0001
  fullName: string;
  gradeLevel: string;
  batch: string;
  programme: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  whatsappNumber: string;
  createdAt: string;
  active?: boolean;
}

export interface PaymentSubmission {
  id: string;
  paymentRef: string; // e.g. THF-PAY-26-0001
  studentId: string;
  studentRegNo: string;
  studentName: string;
  guardianEmail: string;
  guardianPhone: string;
  paymentMonth: string;
  academicYear: number;
  feeAmount: number;
  paymentMethod: string;
  bankName: string;
  transactionDate: string;
  depositReferenceNo: string;
  proofFileName: string;
  proofUrl: string; // Preview image/pdf
  status: "PENDING" | "VERIFIED" | "REJECTED" | "CLARIFICATION_NEEDED";
  adminNotes?: string;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
}

// Production starts with no students — admins add real students via the admin portal.
// Test files inject their own fixtures via beforeAll() hooks.
export const INITIAL_STUDENTS: Student[] = [];

// Production starts with no submissions. Test files inject their own via beforeAll().
export const INITIAL_SUBMISSIONS: PaymentSubmission[] = [];
