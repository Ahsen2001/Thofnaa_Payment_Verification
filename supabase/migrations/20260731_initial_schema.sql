-- ============================================================================
-- THOFNAA INSTITUTE - DATABASE MIGRATION SCRIPT
-- Schema: Students, Payments, Admin Profiles, Audit Logs
-- Platform: Supabase PostgreSQL
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Helper Function for Updating Timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TABLE 1: STUDENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_no VARCHAR(20) UNIQUE NOT NULL, -- e.g. THF-26-0001
    full_name VARCHAR(255) NOT NULL,
    name_with_initials VARCHAR(255) NOT NULL,
    grade VARCHAR(50) NOT NULL, -- e.g. Grade 6, Grade 11
    batch VARCHAR(100) NOT NULL, -- e.g. Foundation Sinhala - Grades 6 & 7
    programme VARCHAR(100) NOT NULL DEFAULT 'Sinhala Language Tuition',
    parent_name VARCHAR(255) NOT NULL,
    parent_email VARCHAR(255) NOT NULL,
    parent_whatsapp VARCHAR(20) NOT NULL,
    monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 1000.00 CHECK (monthly_fee >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Students
CREATE INDEX IF NOT EXISTS idx_students_registration_no ON public.students(registration_no);
CREATE INDEX IF NOT EXISTS idx_students_batch ON public.students(batch);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);

-- Updated_at Trigger for Students
DROP TRIGGER IF EXISTS set_students_updated_at ON public.students;
CREATE TRIGGER set_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- TABLE 2: PAYMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_reference VARCHAR(30) UNIQUE, -- e.g. THF-PAY-26-0001 (nullable until generated)
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    payment_month INTEGER NOT NULL CHECK (payment_month BETWEEN 1 AND 12),
    payment_year INTEGER NOT NULL CHECK (payment_year >= 2020),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- e.g. Online Transfer, CDM, Cash
    bank_reference VARCHAR(100), -- Bank slip/transfer transaction reference
    proof_path TEXT NOT NULL, -- Supabase Storage file path in 'payment-proofs'
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'needs_clarification')),
    admin_note TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial Unique Index: PREVENT DUPLICATE VERIFIED PAYMENTS for same student + month + year
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_verified_payment_per_period
ON public.payments (student_id, payment_month, payment_year)
WHERE status = 'verified';

-- Performance Indexes for Payments
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(payment_reference);
CREATE INDEX IF NOT EXISTS idx_payments_period ON public.payments(payment_year, payment_month);

-- Updated_at Trigger for Payments
DROP TRIGGER IF EXISTS set_payments_updated_at ON public.payments;
CREATE TRIGGER set_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- TABLE 3: ADMIN PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('ADMIN', 'SUPER_ADMIN')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for Admin Profiles
CREATE INDEX IF NOT EXISTS idx_admin_profiles_user_id ON public.admin_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON public.admin_profiles(role);

-- ============================================================================
-- TABLE 4: AUDIT LOGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- e.g. VERIFY_PAYMENT, REJECT_PAYMENT, CREATE_STUDENT
    entity_type VARCHAR(50) NOT NULL, -- e.g. payments, students
    entity_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user_id ON public.audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Students RLS Policies
-- Public can look up student by registration_no
CREATE POLICY "Public students lookup policy"
ON public.students FOR SELECT
USING (TRUE);

-- Only authenticated admins can insert/update students
CREATE POLICY "Admin full student management policy"
ON public.students FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE user_id = auth.uid() AND active = TRUE
    )
);

-- 2. Payments RLS Policies
-- Public can submit payment proof
CREATE POLICY "Public submit payment policy"
ON public.payments FOR INSERT
WITH CHECK (TRUE);

-- Public can view payment by reference code or ID
CREATE POLICY "Public status check policy"
ON public.payments FOR SELECT
USING (TRUE);

-- Admin full management of payments
CREATE POLICY "Admin full payment management policy"
ON public.payments FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE user_id = auth.uid() AND active = TRUE
    )
);

-- 3. Admin Profiles RLS Policies
CREATE POLICY "Admin profiles view policy"
ON public.admin_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.admin_profiles WHERE user_id = auth.uid() AND role = 'SUPER_ADMIN'
));

-- 4. Audit Logs RLS Policies
CREATE POLICY "Admin audit logs policy"
ON public.audit_logs FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE user_id = auth.uid() AND active = TRUE
    )
);

-- ============================================================================
-- INITIAL SEED DATA (BATCHES & DEMO STUDENTS)
-- ============================================================================
INSERT INTO public.students (
    registration_no,
    full_name,
    name_with_initials,
    grade,
    batch,
    programme,
    parent_name,
    parent_email,
    parent_whatsapp,
    monthly_fee,
    status
) VALUES 
(
    'THF-26-0001',
    'Kasun Kalhara Perera',
    'K. K. Perera',
    'Grade 11',
    'Senior / O/L Sinhala – Grades 10 & 11',
    'Sinhala Language Tuition',
    'Sunil Perera',
    'sunil.perera@gmail.com',
    '+94 77 123 4567',
    1000.00,
    'ACTIVE'
),
(
    'THF-26-0002',
    'Dilini Senaratne',
    'D. Senaratne',
    'Grade 9',
    'Intermediate Sinhala – Grades 8 & 9',
    'Sinhala Language Tuition',
    'Nirosha Senaratne',
    'nirosha.s@yahoo.com',
    '+94 71 987 6543',
    1000.00,
    'ACTIVE'
),
(
    'THF-26-0003',
    'Mohamed Rilwan',
    'M. Rilwan',
    'Grade 7',
    'Foundation Sinhala – Grades 6 & 7',
    'Sinhala Language Tuition',
    'Fathima Rilwan',
    'fathima.rilwan@gmail.com',
    '+94 75 333 4444',
    1000.00,
    'ACTIVE'
)
ON CONFLICT (registration_no) DO NOTHING;
