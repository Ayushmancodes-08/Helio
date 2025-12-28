'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export type HealthAlert = {
    id: string;
    title: string;
    description: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Active' | 'Resolved';
    created_at: string;
    district_id: string | null;
};

export function useHealthAlerts() {
    const [alerts, setAlerts] = useState<HealthAlert[]>([]);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('health_alerts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAlerts(data || []);
        } catch (e) {
            console.error('Error fetching health alerts:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    const createAlert = async (alert: Omit<HealthAlert, 'id' | 'created_at' | 'status'> & { district_id?: string | null }) => {
        try {
            const { data, error } = await supabase
                .from('health_alerts')
                .insert({
                    title: alert.title,
                    description: alert.description,
                    priority: alert.priority,
                    district_id: alert.district_id
                })
                .select()
                .single();

            if (error) {
                console.error('Supabase error creating alert:', JSON.stringify(error, null, 2));
                throw error;
            }
            await fetchAlerts();
            return { success: true, data };
        } catch (e) {
            console.error('Error creating alert:', e);
            return { success: false, error: (e as Error).message || 'Failed to create alert' };
        }
    };

    const resolveAlert = async (id: string) => {
        try {
            const { error } = await supabase
                .from('health_alerts')
                .update({ status: 'Resolved' })
                .eq('id', id);
            if (error) throw error;
            await fetchAlerts();
        } catch (e) {
            console.error('Error resolving alert:', e);
            throw e;
        }
    }

    const deleteAlert = async (id: string) => {
        try {
            const { error } = await supabase
                .from('health_alerts')
                .delete()
                .eq('id', id);
            if (error) throw error;
            await fetchAlerts();
            return { success: true };
        } catch (e) {
            console.error('Error deleting alert:', e);
            return { success: false, error: (e as Error).message || 'Failed to delete alert' };
        }
    }

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    // Real-time subscription for live updates
    useEffect(() => {
        const channel = supabase
            .channel('health_alerts_realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'health_alerts' },
                (payload) => {
                    console.log('[Health Alerts] New alert received:', payload.new);
                    setAlerts((prev) => [payload.new as HealthAlert, ...prev]);
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'health_alerts' },
                (payload) => {
                    console.log('[Health Alerts] Alert updated:', payload.new);
                    setAlerts((prev) =>
                        prev.map((alert) =>
                            alert.id === (payload.new as HealthAlert).id
                                ? (payload.new as HealthAlert)
                                : alert
                        )
                    );
                }
            )
            .on(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: 'health_alerts' },
                (payload) => {
                    console.log('[Health Alerts] Alert deleted:', payload.old);
                    setAlerts((prev) =>
                        prev.filter((alert) => alert.id !== (payload.old as HealthAlert).id)
                    );
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('[Health Alerts] Real-time subscription active');
                } else if (status === 'CHANNEL_ERROR') {
                    console.error('[Health Alerts] Subscription error');
                } else if (status === 'TIMED_OUT') {
                    console.warn('[Health Alerts] Subscription timed out');
                }
            });

        return () => {
            console.log('[Health Alerts] Cleaning up real-time subscription');
            supabase.removeChannel(channel);
        };
    }, []);


    return {
        alerts,
        loading,
        createAlert,
        resolveAlert,
        deleteAlert,
        refetch: fetchAlerts
    };
}
