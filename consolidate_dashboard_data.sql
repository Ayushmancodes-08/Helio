-- Function to fetch all dashboard data for a patient in one call
CREATE OR REPLACE FUNCTION get_patient_dashboard_data(p_id UUID)
RETURNS JSON AS $$
DECLARE
  v_appointments JSON;
  v_prescriptions JSON;
  v_lab_reports JSON;
  v_user_role TEXT;
BEGIN
  -- Check if the user is a patient or has permission to view this data
  -- For simplicity, assuming RLS handles row visibility, but separate queries inside function might bypass RLS 
  -- if function is SECURITY DEFINER. Let's keep it SECURITY INVOKER (default) to respect RLS.
  
  -- Fetch Appointments with Doctor Name
  SELECT json_agg(t) INTO v_appointments
  FROM (
    SELECT 
      a.*, 
      p.full_name as doctor_name
    FROM appointments a
    LEFT JOIN profiles p ON a.doctor_id = p.id
    WHERE a.patient_id = p_id
    ORDER BY a.created_at DESC
    LIMIT 10 -- Optimization: Fetch only recent ones for dashboard
  ) t;

  -- Fetch Prescriptions with Doctor Name
  SELECT json_agg(t) INTO v_prescriptions
  FROM (
    SELECT 
      rx.*,
      p.full_name as doctor_name
    FROM prescriptions rx
    LEFT JOIN profiles p ON rx.doctor_id = p.id
    WHERE rx.patient_id = p_id
    ORDER BY rx.issued_date DESC
    LIMIT 10
  ) t;

  -- Fetch Lab Reports with Doctor Name
  SELECT json_agg(t) INTO v_lab_reports
  FROM (
    SELECT 
      lr.*,
      p.full_name as doctor_name
    FROM lab_reports lr
    LEFT JOIN profiles p ON lr.doctor_id = p.id
    WHERE lr.patient_id = p_id
    ORDER BY lr.report_date DESC
    LIMIT 10
  ) t;

  -- Return consolidated JSON
  RETURN json_build_object(
    'appointments', COALESCE(v_appointments, '[]'::json),
    'prescriptions', COALESCE(v_prescriptions, '[]'::json),
    'lab_reports', COALESCE(v_lab_reports, '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
