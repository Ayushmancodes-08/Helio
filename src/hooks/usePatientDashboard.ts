import useSWR from 'swr';
import { createClient } from '@/lib/supabase/client';
import { Appointment } from './useAppointments';
import { Prescription } from './usePrescriptions';
import { LabReport } from './useLabReports';
import { Profile } from '@/components/providers/AuthProvider';

type DashboardData = {
    profile: Profile;
    appointments: Appointment[];
    prescriptions: Prescription[];
    labReports: LabReport[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePatientDashboard() {
    const supabase = createClient();

    const { data, error, isLoading, mutate } = useSWR<DashboardData>('/api/dashboard/patient', fetcher, {
        refreshInterval: 300000,
        revalidateOnFocus: false,
        dedupingInterval: 60000,
    });

    const appointments = (data?.appointments || []).map(a => ({
        ...a,
        appointment_date: a.appointment_date ? new Date(a.appointment_date) : undefined
    }));

    const prescriptions = (data?.prescriptions || []).map(p => ({
        ...p,
        issued_date: p.issued_date ? new Date(p.issued_date) : new Date()
    }));

    const labReports = (data?.labReports || []).map(r => ({
        ...r,
        report_date: r.report_date ? new Date(r.report_date) : new Date()
    }));

    const cancelAppointment = async (id: string) => {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'Cancelled' })
                .eq('id', id);

            if (error) throw error;
            mutate(); // Refresh data
            return true;
        } catch (err) {
            console.error('Error cancelling appointment:', err);
            return false;
        }
    };

    return {
        appointments,
        prescriptions,
        labReports,
        loading: isLoading,
        error,
        refreshDashboard: mutate,
        cancelAppointment
    };
}
