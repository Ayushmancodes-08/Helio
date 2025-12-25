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

    return {
        alerts,
        loading,
        createAlert,
        resolveAlert,
        deleteAlert,
        refetch: fetchAlerts
    };
}
