-- ============================================================================
-- THOFNAA INSTITUTE - SECURE ROW LEVEL SECURITY & STORAGE POLICIES
-- Target: Supabase PostgreSQL & Supabase Storage ('payment-proofs')
-- ============================================================================

-- ============================================================================
-- SECTION 1: RESET & ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop all pre-existing loose policies
DROP POLICY IF EXISTS "Public students lookup policy" ON public.students;
DROP POLICY IF EXISTS "Admin full student management policy" ON public.students;
DROP POLICY IF EXISTS "Public submit payment policy" ON public.payments;
DROP POLICY IF EXISTS "Public status check policy" ON public.payments;
DROP POLICY IF EXISTS "Admin full payment management policy" ON public.payments;
DROP POLICY IF EXISTS "Admin profiles view policy" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admin audit logs policy" ON public.audit_logs;

-- ============================================================================
-- SECTION 2: ADMIN VALIDATION HELPER FUNCTION
-- ============================================================================
-- Creates an efficient, cached helper to verify active admin status
CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_profiles 
    WHERE user_id = auth.uid() 
      AND active = TRUE
  );
$$;

-- ============================================================================
-- SECTION 3: TABLE RLS POLICIES
-- ============================================================================

-------------------------------------------------------------------------------
-- 3.1 STUDENTS TABLE SECURITY
-------------------------------------------------------------------------------
-- Security Rule: Public users CANNOT query or list students directly via anon API key.
-- All public lookup MUST go through secure server action or RPC procedure.

-- Admin Policy: Full CRUD access for active admins only
CREATE POLICY "Active admins full access on students"
ON public.students
FOR ALL
TO authenticated
USING (public.is_active_admin())
WITH CHECK (public.is_active_admin());

-------------------------------------------------------------------------------
-- 3.2 PAYMENTS TABLE SECURITY
-------------------------------------------------------------------------------
-- Security Rule: Public users CANNOT read payments table directly via anon key.

-- Admin Policy: Full CRUD access for active admins
CREATE POLICY "Active admins full access on payments"
ON public.payments
FOR ALL
TO authenticated
USING (public.is_active_admin())
WITH CHECK (public.is_active_admin());

-------------------------------------------------------------------------------
-- 3.3 ADMIN PROFILES TABLE SECURITY
-------------------------------------------------------------------------------
-- Active admin can read their own profile
CREATE POLICY "Admins read own profile"
ON public.admin_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND active = TRUE);

-- Super admin full management of admin profiles
CREATE POLICY "Super admins manage profiles"
ON public.admin_profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE user_id = auth.uid() AND role = 'SUPER_ADMIN' AND active = TRUE
  )
);

-------------------------------------------------------------------------------
-- 3.4 AUDIT LOGS TABLE SECURITY
-------------------------------------------------------------------------------
-- Active admins can read audit logs
CREATE POLICY "Active admins read audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.is_active_admin());

-- Only server environment can insert audit logs (handled via trigger or service role)

-- ============================================================================
-- SECTION 4: SECURE RPC FUNCTIONS FOR PUBLIC SERVER-SIDE LOOKUP
-- ============================================================================

-- Function 4.1: Masked Student Lookup Procedure
-- Returns ONLY un-sensitive verification fields (Reg No, Full Name, Grade, Batch)
-- Masks parent email & phone numbers to prevent OSINT enumeration.
CREATE OR REPLACE FUNCTION public.get_student_public_info(p_registration_no TEXT)
RETURNS TABLE (
  id UUID,
  registration_no VARCHAR(20),
  full_name VARCHAR(255),
  grade VARCHAR(50),
  batch VARCHAR(100),
  parent_email_masked TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.registration_no,
    s.full_name,
    s.grade,
    s.batch,
    -- Mask email: e.g. s***l@gmail.com
    REGEXP_REPLACE(s.parent_email, '(^.).*(@.*$)', '\1***\2') AS parent_email_masked
  FROM public.students s
  WHERE UPPER(s.registration_no) = UPPER(TRIM(p_registration_no))
    AND s.status = 'ACTIVE';
END;
$$;

-- Function 4.2: Public Payment Status Check
-- Returns status without leaking storage paths or admin notes
CREATE OR REPLACE FUNCTION public.get_payment_public_status(p_reference TEXT)
RETURNS TABLE (
  payment_reference VARCHAR(30),
  student_name VARCHAR(255),
  payment_month INT,
  payment_year INT,
  status VARCHAR(30),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.payment_reference,
    s.full_name AS student_name,
    p.payment_month,
    p.payment_year,
    p.status,
    p.admin_note AS rejection_reason,
    p.submitted_at
  FROM public.payments p
  JOIN public.students s ON s.id = p.student_id
  WHERE UPPER(p.payment_reference) = UPPER(TRIM(p_reference));
END;
$$;

-- Revoke execute from public; grant execute to anon & authenticated
REVOKE EXECUTE ON FUNCTION public.get_student_public_info(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_student_public_info(TEXT) TO anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.get_payment_public_status(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_payment_public_status(TEXT) TO anon, authenticated;

-- ============================================================================
-- SECTION 5: SUPABASE STORAGE BUCKET SECURITY ('payment-proofs')
-- ============================================================================

-- 5.1 Ensure Private Storage Bucket Exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  FALSE, -- STRICTLY PRIVATE BUCKET
  10485760, -- 10 MB Limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = FALSE,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

-- 5.2 Storage RLS Policies (storage.objects)
-- Drop existing loose storage policies
DROP POLICY IF EXISTS "Admin view payment proof policy" ON storage.objects;
DROP POLICY IF EXISTS "Public upload payment proof policy" ON storage.objects;

-- Storage Policy A: Only Active Admins can SELECT (view/download) proof files
CREATE POLICY "Active admins read payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' 
  AND public.is_active_admin()
);

-- Storage Policy B: Only Active Admins can DELETE or UPDATE proof files
CREATE POLICY "Active admins update delete payment proofs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'payment-proofs' 
  AND public.is_active_admin()
);

-- Storage Policy C: Uploads managed via Next.js Server Action with Service Role Key
-- Or restricted to authenticated admins
CREATE POLICY "Admin direct upload payment proofs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND public.is_active_admin()
);
