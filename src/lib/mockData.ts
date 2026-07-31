export interface Student {
  id: string;
  studentRegNo: string; // e.g. THF-26-0001
  fullName: string;
  gradeLevel: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  whatsappNumber: string;
  createdAt: string;
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
  proofUrl: string; // Mock preview image/pdf
  status: "PENDING" | "VERIFIED" | "REJECTED" | "CLARIFICATION_NEEDED";
  adminNotes?: string;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
}

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "std-001",
    studentRegNo: "THF-26-0001",
    fullName: "Kasun Kalhara Perera",
    gradeLevel: "Grade 11 (O/L)",
    guardianName: "Sunil Perera",
    guardianEmail: "sunil.perera@gmail.com",
    guardianPhone: "+94 77 123 4567",
    whatsappNumber: "+94 77 123 4567",
    createdAt: "2026-01-05",
  },
  {
    id: "std-002",
    studentRegNo: "THF-26-0002",
    fullName: "Dilini Senaratne",
    gradeLevel: "Grade 10",
    guardianName: "Nirosha Senaratne",
    guardianEmail: "nirosha.s@yahoo.com",
    guardianPhone: "+94 71 987 6543",
    whatsappNumber: "+94 71 987 6543",
    createdAt: "2026-01-10",
  },
  {
    id: "std-003",
    studentRegNo: "THF-26-0003",
    fullName: "Mohamed Rilwan",
    gradeLevel: "Grade 8",
    guardianName: "Fathima Rilwan",
    guardianEmail: "fathima.rilwan@gmail.com",
    guardianPhone: "+94 75 333 4444",
    whatsappNumber: "+94 75 333 4444",
    createdAt: "2026-01-15",
  },
];

export const INITIAL_SUBMISSIONS: PaymentSubmission[] = [
  {
    id: "sub-101",
    paymentRef: "THF-PAY-26-0001",
    studentId: "std-001",
    studentRegNo: "THF-26-0001",
    studentName: "Kasun Kalhara Perera",
    guardianEmail: "sunil.perera@gmail.com",
    guardianPhone: "+94 77 123 4567",
    paymentMonth: "January",
    academicYear: 2026,
    feeAmount: 1000,
    paymentMethod: "Online Bank Transfer",
    bankName: "People's Bank",
    transactionDate: "2026-01-28",
    depositReferenceNo: "PB-998231",
    proofFileName: "kasun_jan_receipt.pdf",
    proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
    status: "VERIFIED",
    adminNotes: "Bank transfer reference matches People's Bank statement.",
    verifiedAt: "2026-01-29T10:15:00Z",
    createdAt: "2026-01-28T14:30:00Z",
  },
  {
    id: "sub-102",
    paymentRef: "THF-PAY-26-0002",
    studentId: "std-002",
    studentRegNo: "THF-26-0002",
    studentName: "Dilini Senaratne",
    guardianEmail: "nirosha.s@yahoo.com",
    guardianPhone: "+94 71 987 6543",
    paymentMonth: "February",
    academicYear: 2026,
    feeAmount: 1000,
    paymentMethod: "Cash Deposit Machine (CDM)",
    bankName: "People's Bank",
    transactionDate: "2026-01-30",
    depositReferenceNo: "CDM-7721",
    proofFileName: "dilini_feb_receipt.jpg",
    proofUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
    status: "PENDING",
    createdAt: "2026-01-30T09:12:00Z",
  },
  {
    id: "sub-103",
    paymentRef: "THF-PAY-26-0003",
    studentId: "std-003",
    studentRegNo: "THF-26-0003",
    studentName: "Mohamed Rilwan",
    guardianEmail: "fathima.rilwan@gmail.com",
    guardianPhone: "+94 75 333 4444",
    paymentMonth: "February",
    academicYear: 2026,
    feeAmount: 1000,
    paymentMethod: "Online Bank Transfer",
    bankName: "Commercial Bank",
    transactionDate: "2026-01-31",
    depositReferenceNo: "COMB-10293",
    proofFileName: "rilwan_feb_slip.png",
    proofUrl: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&auto=format&fit=crop&q=80",
    status: "CLARIFICATION_NEEDED",
    rejectionReason: "The receipt image is blurry. Please re-upload a clear picture of the deposit slip showing the reference number.",
    createdAt: "2026-01-31T11:45:00Z",
  },
];
