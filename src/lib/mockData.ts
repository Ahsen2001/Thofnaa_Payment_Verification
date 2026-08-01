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

// Initial registered student roster (includes student THF-26-0001)
export const INITIAL_STUDENTS: Student[] = [
  {
    id: "std-001",
    studentRegNo: "THF-26-0001",
    fullName: "U. AHSEN",
    gradeLevel: "Grade 6",
    batch: "Foundation Sinhala",
    programme: "Second Language Sinhala",
    guardianName: "Umer",
    guardianEmail: "uahsens1@gmail.com",
    guardianPhone: "+94 75 460 3008",
    whatsappNumber: "+94 75 460 3008",
    createdAt: "2026-01-01",
    active: true,
  },
];

export const INITIAL_SUBMISSIONS: PaymentSubmission[] = [];
