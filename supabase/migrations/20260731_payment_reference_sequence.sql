-- ============================================================================
-- THOFNAA INSTITUTE - AUTOMATIC PAYMENT REFERENCE GENERATION & VERIFICATION
-- Migration File: 20260731_payment_reference_sequence.sql
-- ============================================================================

-- 1. Create a dedicated PostgreSQL Sequence for Payment References
-- Sequences are atomic, lock-free, and collision-safe across concurrent transactions
CREATE SEQUENCE IF NOT EXISTS public.payment_ref_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Grant usage permissions on sequence to authenticated users & service role
GRANT USAGE, SELECT ON SEQUENCE public.payment_ref_seq TO authenticated, service_role;


-- 2. Helper function to generate next sequential payment reference code
-- Format: THF-PAY-YY-NNNN (e.g. THF-PAY-26-0001)
CREATE OR REPLACE FUNCTION public.generate_next_payment_reference()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_year_short TEXT;
    v_seq_val BIGINT;
    v_formatted_ref TEXT;
BEGIN
    -- Extract 2-digit current year (e.g. '26' for 2026)
    v_year_short := TO_CHAR(CURRENT_DATE, 'YY');
    
    -- Atomically increment and fetch next sequence integer
    v_seq_val := NEXTVAL('public.payment_ref_seq');
    
    -- Format: THF-PAY-26-0001 (Zero padded to 4 digits minimum)
    v_formatted_ref := 'THF-PAY-' || v_year_short || '-' || LPAD(v_seq_val::TEXT, 4, '0');
    
    RETURN v_formatted_ref;
END;
$$;


-- 3. Atomic Admin Payment Verification & Reference Assignment Procedure
-- Prevents race conditions by using ROW LEVEL FOR UPDATE locking and PostgreSQL Sequences
CREATE OR REPLACE FUNCTION public.verify_payment_and_assign_reference(
    p_payment_id UUID,
    p_admin_user_id UUID,
    p_admin_note TEXT DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    payment_reference TEXT,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_current_status TEXT;
    v_existing_ref TEXT;
    v_final_ref TEXT;
BEGIN
    -- 1. Verify caller is an active THOFNAA admin
    IF NOT public.is_active_admin() THEN
        RETURN QUERY SELECT FALSE, NULL::TEXT, 'Unauthorized: Active administrator privileges required.'::TEXT;
        RETURN;
    END IF;

    -- 2. Row Lock FOR UPDATE: Prevents concurrent race conditions when two admins click verify simultaneously
    SELECT status, payment_reference
    INTO v_current_status, v_existing_ref
    FROM public.payments
    WHERE id = p_payment_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::TEXT, 'Error: Payment record not found.'::TEXT;
        RETURN;
    END IF;

    -- 3. If already verified with reference, return existing reference cleanly
    IF v_current_status = 'verified' AND v_existing_ref IS NOT NULL THEN
        RETURN QUERY SELECT TRUE, v_existing_ref, 'Payment is already verified.'::TEXT;
        RETURN;
    END IF;

    -- 4. Assign reference ONLY if null (when payment is VERIFIED)
    IF v_existing_ref IS NULL THEN
        v_final_ref := public.generate_next_payment_reference();
    ELSE
        v_final_ref := v_existing_ref;
    END IF;

    -- 5. Atomically update payment record status to 'verified'
    UPDATE public.payments
    SET 
        status = 'verified',
        payment_reference = v_final_ref,
        verified_at = NOW(),
        verified_by = p_admin_user_id,
        admin_note = COALESCE(p_admin_note, admin_note),
        updated_at = NOW()
    WHERE id = p_payment_id;

    -- 6. Insert audit trail entry
    INSERT INTO public.audit_logs (
        admin_user_id,
        action,
        entity_type,
        entity_id,
        new_value
    ) VALUES (
        p_admin_user_id,
        'VERIFY_PAYMENT',
        'payments',
        p_payment_id::TEXT,
        jsonb_build_object(
            'status', 'verified',
            'payment_reference', v_final_ref,
            'verified_at', NOW()
        )
    );

    RETURN QUERY SELECT TRUE, v_final_ref, 'Payment verified successfully. Reference code assigned.'::TEXT;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.generate_next_payment_reference() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_payment_and_assign_reference(UUID, UUID, TEXT) TO authenticated, service_role;
