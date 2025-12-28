import useSWR from 'swr';
import { Appointment } from './useAppointments';
import { Profile } from '@/components/providers/AuthProvider';

interface DoctorDashboardData {
    profile: Profile;
    appointments: Appointment[];
    demographics: { age: string; patients: number }[];
    stats: {
        totalPatients: number;
        todaysAppointmentsCount: number;
    };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useDoctorDashboard() {
    const { data, error, isLoading, mutate } = useSWR<DoctorDashboardData>('/api/dashboard/doctor', fetcher, {
        refreshInterval: 300000, // Refresh every 5 minutes
        revalidateOnFocus: false, // Performance: Disable aggressive revalidation
        dedupingInterval: 60000, // Dedupe requests within 1 minute
    });

    return {
        data,
        loading: isLoading,
        error,
        refresh: mutate
    };
}
