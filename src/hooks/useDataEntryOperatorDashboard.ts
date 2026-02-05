'use client';

import useSWR from 'swr';
import { useEffect, useRef, useCallback } from 'react';
import { Profile } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';

// Similar to Health Official but specific to DEO if needed
export type HospitalMetric = {
    id: string;
    district_name: string;
    total_beds: number;
    occupied_beds: number;
    total_ambulances?: number;
    population?: number;
    doctors?: number;
    nurses?: number;
    hospital_count?: number;
};

type DataEntryOperatorDashboardData = {
    profile: Profile;
    metrics: HospitalMetric[];
};

const fetcher = async (url: string) => {
    const res = await fetch(url, { 
        priority: 'high' as RequestInit['priority']
    });
    if (!res.ok) {
        const error = new Error('Failed to fetch dashboard data');
        (error as any).status = res.status;
        throw error;
    }
    return res.json();
};

export function useDataEntryDashboard() {
    const subscriptionRef = useRef<any>(null);
    const supabaseRef = useRef(createClient());
    const refetchTimeoutRef = useRef<NodeJS.Timeout>();
    
    const { data, error, isLoading, mutate } = useSWR<DataEntryOperatorDashboardData>(
        '/api/dashboard/data-entry-operator',
        fetcher,
        {
            refreshInterval: 0,
            revalidateOnFocus: true,
            dedupingInterval: 1000,
            keepPreviousData: true,
            focusThrottleInterval: 3000,
            errorRetryCount: 3,
            errorRetryInterval: 1000,
        }
    );

    // Debounced refetch to avoid too many requests
    const debouncedRefetch = useCallback(() => {
        if (refetchTimeoutRef.current) {
            clearTimeout(refetchTimeoutRef.current);
        }
        refetchTimeoutRef.current = setTimeout(() => {
            mutate();
        }, 500); // Wait 500ms after last change before refetching
    }, [mutate]);

    // Subscribe to real-time hospital updates
    useEffect(() => {
        const supabase = supabaseRef.current;
        
        // Clean up existing subscription
        if (subscriptionRef.current) {
            supabase.removeChannel(subscriptionRef.current);
            subscriptionRef.current = null;
        }

        // Create new subscription
        subscriptionRef.current = supabase
            .channel('hospitals-changes', {
                config: {
                    broadcast: { self: true },
                    presence: { key: 'deo-dashboard' },
                }
            })
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'hospitals'
                },
                (payload) => {
                    console.log('[DEO Dashboard] Hospital inserted:', payload.new);
                    debouncedRefetch();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'hospitals'
                },
                (payload) => {
                    console.log('[DEO Dashboard] Hospital updated:', payload.new);
                    debouncedRefetch();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'DELETE',
                    schema: 'public',
                    table: 'hospitals'
                },
                (payload) => {
                    console.log('[DEO Dashboard] Hospital deleted:', payload.old);
                    debouncedRefetch();
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('[DEO Dashboard] Real-time subscription active');
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('[DEO Dashboard] Subscription error, retrying...');
                    // Retry subscription after delay
                    setTimeout(() => {
                        subscriptionRef.current?.subscribe();
                    }, 2000);
                }
            });

        return () => {
            if (refetchTimeoutRef.current) {
                clearTimeout(refetchTimeoutRef.current);
            }
            if (subscriptionRef.current) {
                supabase.removeChannel(subscriptionRef.current);
                subscriptionRef.current = null;
            }
        };
    }, [debouncedRefetch]);

    return {
        profile: data?.profile,
        metrics: data?.metrics || [],
        loading: isLoading,
        error,
        refresh: mutate
    };
}
