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
    fullName: "[DEMO] Kasun Kalhara Perera",
    gradeLevel: "Grade 6",
    batch: "Foundation Sinhala",
    programme: "Second Language Sinhala",
    guardianName: "[DEMO PARENT] Sunil Perera",
    guardianEmail: "demo.parent.kasun@example.com",
    guardianPhone: "+94 77 000 0001",
    whatsappNumber: "+94 77 000 0001",
    createdAt: "2026-01-05",
  },
  {
    id: "std-002",
    studentRegNo: "THF-26-0002",
    fullName: "[DEMO] Dilini Senaratne",
    gradeLevel: "Grade 7",
    batch: "Foundation Sinhala",
    programme: "Second Language Sinhala",
    guardianName: "[DEMO PARENT] Nirosha Senaratne",
    guardianEmail: "demo.parent.dilini@example.com",
    guardianPhone: "+94 71 000 0002",
    whatsappNumber: "+94 71 000 0002",
    createdAt: "2026-01-10",
  },
  {
    id: "std-003",
    studentRegNo: "THF-26-0003",
    fullName: "[DEMO] Mohamed Rilwan",
    gradeLevel: "Grade 8",
    batch: "Intermediate Sinhala",
    programme: "Second Language Sinhala",
    guardianName: "[DEMO PARENT] Fathima Rilwan",
    guardianEmail: "demo.parent.rilwan@example.com",
    guardianPhone: "+94 75 000 0003",
    whatsappNumber: "+94 75 000 0003",
    createdAt: "2026-01-15",
  },
  {
    id: "std-004",
    studentRegNo: "THF-26-0004",
    fullName: "[DEMO] Ruwan Wickremasinghe",
    gradeLevel: "Grade 9",
    batch: "Intermediate Sinhala",
    programme: "Second Language Sinhala",
    guardianName: "[DEMO PARENT] Gamini Wickremasinghe",
    guardianEmail: "demo.parent.ruwan@example.com",
    guardianPhone: "+94 77 000 0004",
    whatsappNumber: "+94 77 000 0004",
    createdAt: "2026-01-18",
  },
  {
    id: "std-005",
    studentRegNo: "THF-26-0005",
    fullName: "[DEMO] Anuki Fernando",
    gradeLevel: "Grade 10",
    batch: "Senior / O/L Sinhala",
    programme: "Second Language Sinhala",
    guardianName: "[DEMO PARENT] Nimali Fernando",
    guardianEmail: "demo.parent.anuki@example.com",
    guardianPhone: "+94 71 000 0005",
    whatsappNumber: "+94 71 000 0005",
    createdAt: "2026-01-20",
  },
  {
    id: "std-006",
    studentRegNo: "THF-26-0006",
    fullName: "[DEMO] Sahan Bandara",
    gradeLevel: "Grade 11",
    batch: "Senior / O/L Sinhala",
    programme: "Second Language Sinhala",
    guardianName: "[DEMO PARENT] Jayampathi Bandara",
    guardianEmail: "demo.parent.sahan@example.com",
    guardianPhone: "+94 72 000 0006",
    whatsappNumber: "+94 72 000 0006",
    createdAt: "2026-01-22",
  },
];

export const INITIAL_SUBMISSIONS: PaymentSubmission[] = [
  {
    id: "sub-101",
    paymentRef: "THF-PAY-26-0001",
    studentId: "std-001",
    studentRegNo: "THF-26-0001",
    studentName: "[DEMO] Kasun Kalhara Perera",
    guardianEmail: "demo.parent.kasun@example.com",
    guardianPhone: "+94 77 000 0001",
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
    studentName: "[DEMO] Dilini Senaratne",
    guardianEmail: "demo.parent.dilini@example.com",
    guardianPhone: "+94 71 000 0002",
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
    studentName: "[DEMO] Mohamed Rilwan",
    guardianEmail: "demo.parent.rilwan@example.com",
    guardianPhone: "+94 75 000 0003",
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
