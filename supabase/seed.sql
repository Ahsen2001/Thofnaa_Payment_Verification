-- ============================================================================
-- THOFNAA INSTITUTE - SUPABASE DEMO SEED DATA
-- ⚠️ WARNING: THIS IS DEMO / TEST DATA FOR DEVELOPMENT PURPOSES ONLY.
-- DO NOT USE IN PRODUCTION ENVIRONMENTS OR WITH REAL STUDENT RECORDS.
-- ============================================================================

-- Clear pre-existing demo student records if any
DELETE FROM public.students 
WHERE registration_no IN (
  'THF-26-0001',
  'THF-26-0002',
  'THF-26-0003',
  'THF-26-0004',
  'THF-26-0005',
  'THF-26-0006'
);

-- Insert 6 Demo Students across Grade 6 through Grade 11
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
    '[DEMO] Kasun Kalhara Perera',
    'K. K. Perera (DEMO)',
    'Grade 6',
    'Foundation Sinhala',
    'Second Language Sinhala',
    '[DEMO PARENT] Sunil Perera',
    'demo.parent.kasun@example.com',
    '+94 77 000 0001',
    1000.00,
    'ACTIVE'
),
(
    'THF-26-0002',
    '[DEMO] Dilini Senaratne',
    'D. Senaratne (DEMO)',
    'Grade 7',
    'Foundation Sinhala',
    'Second Language Sinhala',
    '[DEMO PARENT] Nirosha Senaratne',
    'demo.parent.dilini@example.com',
    '+94 71 000 0002',
    1000.00,
    'ACTIVE'
),
(
    'THF-26-0003',
    '[DEMO] Mohamed Rilwan',
    'M. Rilwan (DEMO)',
    'Grade 8',
    'Intermediate Sinhala',
    'Second Language Sinhala',
    '[DEMO PARENT] Fathima Rilwan',
    'demo.parent.rilwan@example.com',
    '+94 75 000 0003',
    1000.00,
    'ACTIVE'
),
(
    'THF-26-0004',
    '[DEMO] Ruwan Wickremasinghe',
    'R. Wickremasinghe (DEMO)',
    'Grade 9',
    'Intermediate Sinhala',
    'Second Language Sinhala',
    '[DEMO PARENT] Gamini Wickremasinghe',
    'demo.parent.ruwan@example.com',
    '+94 77 000 0004',
    1000.00,
    'ACTIVE'
),
(
    'THF-26-0005',
    '[DEMO] Anuki Fernando',
    'A. Fernando (DEMO)',
    'Grade 10',
    'Senior / O/L Sinhala',
    'Second Language Sinhala',
    '[DEMO PARENT] Nimali Fernando',
    'demo.parent.anuki@example.com',
    '+94 71 000 0005',
    1000.00,
    'ACTIVE'
),
(
    'THF-26-0006',
    '[DEMO] Sahan Bandara',
    'S. Bandara (DEMO)',
    'Grade 11',
    'Senior / O/L Sinhala',
    'Second Language Sinhala',
    '[DEMO PARENT] Jayampathi Bandara',
    'demo.parent.sahan@example.com',
    '+94 72 000 0006',
    1000.00,
    'ACTIVE'
);

-- Output Confirmation Note
SELECT 
    registration_no, 
    full_name, 
    grade, 
    batch, 
    programme, 
    monthly_fee 
FROM public.students 
WHERE registration_no LIKE 'THF-26-000%';
