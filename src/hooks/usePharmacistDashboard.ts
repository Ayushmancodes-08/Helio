import useSWR from 'swr';
import { Profile } from '@/components/providers/AuthProvider';

type PharmacistDashboardData = {
    profile: Profile;
    stats: {
        inStock: number;
        lowStock: number;
        outOfStock: number;
    };
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePharmacistDashboard() {
    const { data, error, isLoading, mutate } = useSWR<PharmacistDashboardData>('/api/dashboard/pharmacist', fetcher, {
        refreshInterval: 300000,
        revalidateOnFocus: false,
        dedupingInterval: 60000,
    });

    return {
        profile: data?.profile,
        stats: data?.stats || { inStock: 0, lowStock: 0, outOfStock: 0 },
        loading: isLoading,
        error,
        refresh: mutate
    };
}
