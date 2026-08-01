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

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "std-001",
    studentRegNo: "THF-26-0001",
    fullName: "Kasun Kalhara Perera",
    gradeLevel: "Grade 6",
    batch: "Foundation Sinhala",
    programme: "Second Language Sinhala",
    guardianName: "Sunil Perera",
    guardianEmail: "demo.parent.kasun@example.com",
    guardianPhone: "+94 77 000 0001",
    whatsappNumber: "+94 77 000 0001",
    createdAt: "2026-01-05",
  },
  {
    id: "std-002",
    studentRegNo: "THF-26-0002",
    fullName: "Dilini Senaratne",
    gradeLevel: "Grade 7",
    batch: "Foundation Sinhala",
    programme: "Second Language Sinhala",
    guardianName: "Nirosha Senaratne",
    guardianEmail: "demo.parent.dilini@example.com",
    guardianPhone: "+94 71 000 0002",
    whatsappNumber: "+94 71 000 0002",
    createdAt: "2026-01-10",
  },
  {
    id: "std-003",
    studentRegNo: "THF-26-0003",
    fullName: "Mohamed Rilwan",
    gradeLevel: "Grade 8",
    batch: "Intermediate Sinhala",
    programme: "Second Language Sinhala",
    guardianName: "Fathima Rilwan",
    guardianEmail: "demo.parent.rilwan@example.com",
    guardianPhone: "+94 75 000 0003",
    whatsappNumber: "+94 75 000 0003",
    createdAt: "2026-01-15",
  },
  {
    id: "std-004",
    studentRegNo: "THF-26-0004",
    fullName: "Ruwan Wickremasinghe",
    gradeLevel: "Grade 9",
    batch: "Intermediate Sinhala",
    programme: "Second Language Sinhala",
    guardianName: "Gamini Wickremasinghe",
    guardianEmail: "demo.parent.ruwan@example.com",
    guardianPhone: "+94 77 000 0004",
    whatsappNumber: "+94 77 000 0004",
    createdAt: "2026-01-18",
  },
  {
    id: "std-005",
    studentRegNo: "THF-26-0005",
    fullName: "Anuki Fernando",
    gradeLevel: "Grade 10",
    batch: "Senior / O/L Sinhala",
    programme: "Second Language Sinhala",
    guardianName: "Nimali Fernando",
    guardianEmail: "demo.parent.anuki@example.com",
    guardianPhone: "+94 71 000 0005",
    whatsappNumber: "+94 71 000 0005",
    createdAt: "2026-01-20",
  },
  {
    id: "std-006",
    studentRegNo: "THF-26-0006",
    fullName: "Sahan Bandara",
    gradeLevel: "Grade 11",
    batch: "Senior / O/L Sinhala",
    programme: "Second Language Sinhala",
    guardianName: "Jayampathi Bandara",
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
    studentName: "Kasun Kalhara Perera",
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
    createdAt: "2026-01-28T14:20:00Z",
  },
  {
    id: "sub-102",
    paymentRef: "THF-PAY-26-0002",
    studentId: "std-002",
    studentRegNo: "THF-26-0002",
    studentName: "Dilini Senaratne",
    guardianEmail: "demo.parent.dilini@example.com",
    guardianPhone: "+94 71 000 0002",
    paymentMonth: "February",
    academicYear: 2026,
    feeAmount: 1000,
    paymentMethod: "Cash Deposit",
    bankName: "People's Bank",
    transactionDate: "2026-02-02",
    depositReferenceNo: "PB-776109",
    proofFileName: "dilini_feb_slip.jpg",
    proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
    status: "PENDING",
    createdAt: "2026-02-02T09:10:00Z",
  },
  {
    id: "sub-103",
    paymentRef: "THF-PAY-26-0003",
    studentId: "std-003",
    studentRegNo: "THF-26-0003",
    studentName: "Mohamed Rilwan",
    guardianEmail: "demo.parent.rilwan@example.com",
    guardianPhone: "+94 75 000 0003",
    paymentMonth: "February",
    academicYear: 2026,
    feeAmount: 1000,
    paymentMethod: "Online Bank Transfer",
    bankName: "People's Bank",
    transactionDate: "2026-02-03",
    depositReferenceNo: "PB-332901",
    proofFileName: "rilwan_feb_transfer.png",
    proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
    status: "CLARIFICATION_NEEDED",
    adminNotes: "Receipt image is blurry. Please re-upload a clear copy showing the transaction reference.",
    createdAt: "2026-02-03T11:45:00Z",
  },
  {
    id: "sub-104",
    paymentRef: "THF-PAY-26-0004",
    studentId: "std-004",
    studentRegNo: "THF-26-0004",
    studentName: "Ruwan Wickremasinghe",
    guardianEmail: "demo.parent.ruwan@example.com",
    guardianPhone: "+94 77 000 0004",
    paymentMonth: "January",
    academicYear: 2026,
    feeAmount: 1000,
    paymentMethod: "Online Bank Transfer",
    bankName: "People's Bank",
    transactionDate: "2026-01-30",
    depositReferenceNo: "PB-112045",
    proofFileName: "ruwan_jan_proof.jpg",
    proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
    status: "REJECTED",
    rejectionReason: "Account number on transfer slip does not match THOFNAA Institute account.",
    createdAt: "2026-01-30T16:05:00Z",
  },
];
