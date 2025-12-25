import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

export type LabReport = {
    id: string;
    patient_id: string;
    doctor_id?: string;
    report_name: string;
    file_name: string;
    file_url?: string;
    status: 'Pending' | 'Available';
    report_date: Date;
    created_at?: Date;
    updated_at?: Date;
    // Joined fields
    patient_name?: string;
    doctor_name?: string;
};

export function useLabReports() {
    const { profile } = useAuth();
    const [labReports, setLabReports] = useState<LabReport[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    // Fetch lab reports based on user role
    const fetchLabReports = async () => {
        if (!profile) return;

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('lab_reports')
                .select(`
          *,
          patient:profiles!lab_reports_patient_id_fkey(id, full_name),
          doctor:profiles!lab_reports_doctor_id_fkey(id, full_name)
        `)
                .order('report_date', { ascending: false });

            if (fetchError) throw fetchError;

            const formattedData = (data || []).map((report: any) => ({
                ...report,
                report_date: new Date(report.report_date),
                patient_name: report.patient?.full_name,
                doctor_name: report.doctor?.full_name,
            }));

            setLabReports(formattedData);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching lab reports:', err);
        } finally {
            setLoading(false);
        }
    };

    // Create new lab report
    const createLabReport = async (report: Omit<LabReport, 'id' | 'created_at' | 'updated_at'>) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: insertError } = await supabase
                .from('lab_reports')
                .insert({
                    patient_id: report.patient_id,
                    doctor_id: report.doctor_id,
                    report_name: report.report_name,
                    file_name: report.file_name,
                    file_url: report.file_url,
                    status: report.status || 'Pending',
                    report_date: report.report_date.toISOString(),
                })
                .select()
                .single();

            if (insertError) throw insertError;

            await fetchLabReports(); // Refresh list
            return data;
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred');
            console.error('Error creating lab report:', JSON.stringify(err, null, 2));
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Update lab report status
    const updateLabReportStatus = async (id: string, status: 'Pending' | 'Available', file_url?: string) => {
        setLoading(true);
        setError(null);

        try {
            const updates: any = { status };
            if (file_url) updates.file_url = file_url;

            const { data, error: updateError } = await supabase
                .from('lab_reports')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            await fetchLabReports(); // Refresh list
            return data;
        } catch (err: any) {
            setError(err.message);
            console.error('Error updating lab report:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile) {
            fetchLabReports();
        }
    }, [profile]);

    return {
        labReports,
        loading,
        error,
        fetchLabReports,
        createLabReport,
        updateLabReportStatus,
    };
}
