-- Row Level Security (RLS) Policies for AssetIQ

-- Role Helper Function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text AS $$
BEGIN
  RETURN COALESCE(
    NULLIF(current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role', ''),
    NULLIF(current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role', ''),
    'biomedical_engineer'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'biomedical_engineer';
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Assets RLS (biomedical_engineer & hospital_admin write)
-- Maintenance Records RLS (biomedical_engineer & hospital_admin write)
-- Surgeries RLS (ot_admin & hospital_admin write)
-- Breakdown Incidents RLS (biomedical_engineer & hospital_admin write)
-- Asset Utilization RLS (biomedical_engineer & hospital_admin write)
-- Readiness Config RLS (hospital_admin write)
-- Readiness Assessments RLS (ot_admin, biomedical_engineer & hospital_admin write)
