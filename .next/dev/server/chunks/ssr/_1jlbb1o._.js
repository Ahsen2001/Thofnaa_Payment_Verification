module.exports = [
"[project]/src/lib/mockData.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "INITIAL_STUDENTS",
    ()=>INITIAL_STUDENTS,
    "INITIAL_SUBMISSIONS",
    ()=>INITIAL_SUBMISSIONS
]);
const INITIAL_STUDENTS = [
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
        createdAt: "2026-01-05"
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
        createdAt: "2026-01-10"
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
        createdAt: "2026-01-15"
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
        createdAt: "2026-01-18"
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
        createdAt: "2026-01-20"
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
        createdAt: "2026-01-22"
    }
];
const INITIAL_SUBMISSIONS = [
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
        createdAt: "2026-01-28T14:30:00Z"
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
        createdAt: "2026-01-30T09:12:00Z"
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
        createdAt: "2026-01-31T11:45:00Z"
    }
];
}),
"[project]/src/app/actions/studentLookupAction.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"402e9b7368c372b2c82c65d7ae6400d1ffd13fa6d8":{"name":"lookupStudentRegNo"}},"src/app/actions/studentLookupAction.ts",""] */ __turbopack_context__.s([
    "lookupStudentRegNo",
    ()=>lookupStudentRegNo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mockData.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
async function lookupStudentRegNo(rawRegNo) {
    try {
        if (!rawRegNo || typeof rawRegNo !== "string") {
            return {
                success: false,
                error: "Please enter a Student Registration Number."
            };
        }
        // 1. Normalize input to uppercase and trim spaces
        const normalizedRegNo = rawRegNo.trim().toUpperCase();
        // 2. Validate THF-YY-NNNN format (e.g. THF-26-0001)
        const regNoRegex = /^THF-\d{2}-\d{4}$/;
        if (!regNoRegex.test(normalizedRegNo)) {
            return {
                success: false,
                error: "Invalid registration format. Registration number must follow format THF-YY-NNNN (e.g., THF-26-0001)."
            };
        }
        // 3. Perform Server-side Lookup
        // Queries database or fallback mock roster safely on server
        const matchedStudent = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["INITIAL_STUDENTS"].find((s)=>s.studentRegNo.toUpperCase() === normalizedRegNo);
        // 4. Handle Unknown Registration Number
        if (!matchedStudent) {
            return {
                success: false,
                error: `Student Registration Number "${normalizedRegNo}" was not found in THOFNAA records. Please check your student ID card or contact administration on WhatsApp +94 75 460 3008.`
            };
        }
        // 5. Handle Inactive / Suspended Student
        if ("status" in matchedStudent && matchedStudent.status !== "ACTIVE") {
            return {
                success: false,
                error: `Student registration "${normalizedRegNo}" is currently inactive or suspended. Please contact THOFNAA administration to reactivate your enrollment.`
            };
        }
        // 6. Return ONLY Limited Un-sensitive Public Fields
        // EXCLUDES: full parent name, email, WhatsApp, address, or sensitive profile information
        const publicStudent = {
            id: matchedStudent.id,
            registrationNo: matchedStudent.studentRegNo,
            nameWithInitials: getInitialsName(matchedStudent.fullName),
            grade: matchedStudent.gradeLevel,
            programme: matchedStudent.batch || "Foundation Sinhala",
            monthlyFeeLKR: 1000.00,
            status: "ACTIVE"
        };
        return {
            success: true,
            student: publicStudent
        };
    } catch (err) {
        console.error("Server Student Lookup Error:", err);
        return {
            success: false,
            error: "An unexpected server error occurred during lookup. Please try again or contact support."
        };
    }
}
/**
 * Helper to convert full name into limited initials format for student privacy
 * e.g., "Kasun Kalhara Perera" -> "K. K. Perera"
 */ function getInitialsName(fullName) {
    const parts = fullName.replace(/\[DEMO\]\s*/g, "").trim().split(/\s+/);
    if (parts.length <= 1) return fullName;
    const last = parts[parts.length - 1];
    const initials = parts.slice(0, parts.length - 1).map((p)=>`${p[0]}.`).join(" ");
    return `${initials} ${last}`;
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    lookupStudentRegNo
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(lookupStudentRegNo, "402e9b7368c372b2c82c65d7ae6400d1ffd13fa6d8", null);
}),
"[project]/src/app/actions/paymentSubmissionAction.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40dfef40923850b76281b17d4b3ffe32a6ac9b1fae":{"name":"submitPaymentForm"},"705759579119abfdfded1218b60b58e5468422da88":{"name":"checkPaymentPeriodStatus"}},"src/app/actions/paymentSubmissionAction.ts",""] */ __turbopack_context__.s([
    "checkPaymentPeriodStatus",
    ()=>checkPaymentPeriodStatus,
    "submitPaymentForm",
    ()=>submitPaymentForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mockData.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
async function checkPaymentPeriodStatus(studentRegNo, month, year) {
    const normalizedRegNo = studentRegNo.trim().toUpperCase();
    const existing = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["INITIAL_SUBMISSIONS"].find((sub)=>sub.studentRegNo.toUpperCase() === normalizedRegNo && sub.paymentMonth.toLowerCase() === month.toLowerCase() && sub.academicYear === year);
    if (!existing) {
        return {
            allowed: true
        };
    }
    if (existing.status === "VERIFIED") {
        return {
            allowed: false,
            status: "VERIFIED",
            message: `Payment for ${month} ${year} has already been verified and approved. Another submission is not allowed for this period.`
        };
    }
    if (existing.status === "PENDING") {
        return {
            allowed: false,
            status: "PENDING",
            message: `A payment submission for ${month} ${year} (Ref: ${existing.paymentRef}) is currently waiting for administrative verification. Please wait for review.`
        };
    }
    if (existing.status === "CLARIFICATION_NEEDED") {
        return {
            allowed: true,
            status: "CLARIFICATION_NEEDED",
            message: `Previous submission for ${month} ${year} requires clarification: "${existing.rejectionReason || "Please re-upload a clear receipt."}". You may submit a new proof.`,
            adminNote: existing.rejectionReason
        };
    }
    if (existing.status === "REJECTED") {
        return {
            allowed: true,
            status: "REJECTED",
            message: `Previous submission for ${month} ${year} was rejected: "${existing.rejectionReason || "Invalid receipt."}". You may submit a new payment proof.`,
            adminNote: existing.rejectionReason
        };
    }
    return {
        allowed: true
    };
}
async function submitPaymentForm(input) {
    try {
        // 1. Validate Required Fields
        if (!input.studentRegNo || !input.paymentMonth || !input.paymentYear) {
            return {
                success: false,
                error: "Missing student registration or tuition period."
            };
        }
        if (!input.amount || input.amount <= 0) {
            return {
                success: false,
                error: "Amount paid must be greater than LKR 0."
            };
        }
        if (!input.paymentDate) {
            return {
                success: false,
                error: "Payment transfer date is required."
            };
        }
        // 2. Validate Parent Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!input.parentEmail || !emailRegex.test(input.parentEmail.trim())) {
            return {
                success: false,
                error: "Please provide a valid parent email address for receipt delivery."
            };
        }
        // 3. Validate WhatsApp Number
        if (!input.parentWhatsapp || input.parentWhatsapp.trim().length < 8) {
            return {
                success: false,
                error: "Please provide a valid parent WhatsApp contact number."
            };
        }
        // 4. Validate File Upload
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "application/pdf"
        ];
        if (!input.proofFileType || !allowedTypes.includes(input.proofFileType.toLowerCase())) {
            return {
                success: false,
                error: "Invalid file type. Payment proof must be a JPG, JPEG, PNG image or PDF document."
            };
        }
        if (input.proofFileSizeMB > 5) {
            return {
                success: false,
                error: "File size exceeds the 5 MB limit. Please upload a smaller receipt file."
            };
        }
        // 5. Check Duplicate Period Status on Server
        const periodCheck = await checkPaymentPeriodStatus(input.studentRegNo, input.paymentMonth, input.paymentYear);
        if (!periodCheck.allowed) {
            return {
                success: false,
                error: periodCheck.message,
                existingStatus: periodCheck.status
            };
        }
        // 6. Generate Unique Payment Reference Code: THF-PAY-YY-XXXX
        const generatedRef = `THF-PAY-26-000${__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["INITIAL_SUBMISSIONS"].length + 1}`;
        // 7. Log Record into Dataset
        const newSubmission = {
            id: `sub-${Date.now()}`,
            paymentRef: generatedRef,
            studentId: `std-${input.studentRegNo}`,
            studentRegNo: input.studentRegNo.toUpperCase(),
            studentName: input.studentName,
            guardianEmail: input.parentEmail,
            guardianPhone: input.parentWhatsapp,
            paymentMonth: input.paymentMonth,
            academicYear: input.paymentYear,
            feeAmount: input.amount,
            paymentMethod: input.paymentMethod,
            bankName: "People's Bank",
            transactionDate: input.paymentDate,
            depositReferenceNo: input.bankReference || "N/A",
            proofFileName: input.proofFileName,
            proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80",
            status: "PENDING",
            createdAt: new Date().toISOString()
        };
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["INITIAL_SUBMISSIONS"].unshift(newSubmission);
        return {
            success: true,
            paymentRef: generatedRef
        };
    } catch (err) {
        console.error("Server Payment Submission Error:", err);
        return {
            success: false,
            error: "An unexpected server error occurred during submission. Please try again."
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    checkPaymentPeriodStatus,
    submitPaymentForm
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(checkPaymentPeriodStatus, "705759579119abfdfded1218b60b58e5468422da88", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(submitPaymentForm, "40dfef40923850b76281b17d4b3ffe32a6ac9b1fae", null);
}),
"[project]/.next-internal/server/app/payment/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions/studentLookupAction.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/app/actions/paymentSubmissionAction.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2f$studentLookupAction$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions/studentLookupAction.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2f$paymentSubmissionAction$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions/paymentSubmissionAction.ts [app-rsc] (ecmascript)");
;
;
;
}),
"[project]/.next-internal/server/app/payment/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/actions/studentLookupAction.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/app/actions/paymentSubmissionAction.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "402e9b7368c372b2c82c65d7ae6400d1ffd13fa6d8",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2f$studentLookupAction$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["lookupStudentRegNo"],
    "40dfef40923850b76281b17d4b3ffe32a6ac9b1fae",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2f$paymentSubmissionAction$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["submitPaymentForm"],
    "705759579119abfdfded1218b60b58e5468422da88",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2f$paymentSubmissionAction$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["checkPaymentPeriodStatus"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$payment$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2f$studentLookupAction$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$app$2f$actions$2f$paymentSubmissionAction$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/payment/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/actions/studentLookupAction.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/app/actions/paymentSubmissionAction.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2f$studentLookupAction$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions/studentLookupAction.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$actions$2f$paymentSubmissionAction$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/actions/paymentSubmissionAction.ts [app-rsc] (ecmascript)");
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/* eslint-disable import/no-extraneous-dependencies */ Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "registerServerReference", {
    enumerable: true,
    get: function() {
        return _server.registerServerReference;
    }
});
const _server = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// This function ensures that all the exported values are valid server actions,
// during the runtime. By definition all actions are required to be async
// functions, but here we can only check that they are functions.
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ensureServerEntryExports", {
    enumerable: true,
    get: function() {
        return ensureServerEntryExports;
    }
});
function ensureServerEntryExports(actions) {
    for(let i = 0; i < actions.length; i++){
        const action = actions[i];
        if (typeof action !== 'function') {
            throw Object.defineProperty(new Error(`A "use server" file can only export async functions, found ${typeof action}.\nRead more: https://nextjs.org/docs/messages/invalid-use-server-value`), "__NEXT_ERROR_CODE", {
                value: "E352",
                enumerable: false,
                configurable: true
            });
        }
    }
}
}),
];

//# sourceMappingURL=_1jlbb1o._.js.map