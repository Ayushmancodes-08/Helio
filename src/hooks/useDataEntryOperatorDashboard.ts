import useSWR from 'swr';
import { Profile } from '@/components/providers/AuthProvider';

// Similar to Health Official but specific to DEO if needed
export type HospitalMetric = {
    id: string;
    district_name: string;
    total_beds: number;
    occupied_beds: number;
    total_ambulances?: number;
    population?: number;
};

type DataEntryOperatorDashboardData = {
    profile: Profile;
    metrics: HospitalMetric[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useDataEntryDashboard() {
    const { data, error, isLoading, mutate } = useSWR<DataEntryOperatorDashboardData>('/api/dashboard/data-entry-operator', fetcher, {
        refreshInterval: 300000,
        revalidateOnFocus: false,
        dedupingInterval: 60000,
    });

    return {
        profile: data?.profile,
        metrics: data?.metrics || [],
        loading: isLoading,
        error,
        refresh: mutate
    };
}
