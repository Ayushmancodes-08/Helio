import useSWR from 'swr';
import { Profile } from '@/components/providers/AuthProvider';

// Reuse types or define simplified ones here if existing hooks are too complex to import
export type HospitalMetric = {
    id: string;
    district_name: string;
    total_beds: number;
    occupied_beds: number;
    population?: number;
};

export type DiseaseReport = {
    id: string;
    district_name: string;
    disease_name: string;
    case_count: number;
    report_date: string;
};

export type HealthAlert = {
    id: string;
    title: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Active' | 'Resolved';
    created_at: string;
};

type HealthOfficialDashboardData = {
    profile: Profile;
    metrics: HospitalMetric[];
    reports: DiseaseReport[];
    alerts: HealthAlert[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useHealthOfficialDashboard() {
    const { data, error, isLoading, mutate } = useSWR<HealthOfficialDashboardData>('/api/dashboard/health-official', fetcher, {
        refreshInterval: 300000,
        revalidateOnFocus: false,
        dedupingInterval: 60000,
    });

    return {
        profile: data?.profile,
        metrics: data?.metrics || [],
        diseaseReports: data?.reports || [],
        alerts: data?.alerts || [],
        loading: isLoading,
        error,
        refresh: mutate
    };
}
