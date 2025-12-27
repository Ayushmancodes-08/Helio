'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeSubscriptionOptions<T extends Record<string, any>> {
    table: string;
    event?: RealtimeEvent;
    filter?: {
        column: string;
        value: any;
    };
    onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
    onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
    onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
    onChange?: (payload: RealtimePostgresChangesPayload<T>) => void;
}

/**
 * Generic hook for managing Supabase real-time subscriptions
 * 
 * @example
 * ```tsx
 * useRealtimeSubscription({
 *   table: 'health_alerts',
 *   onInsert: (payload) => setAlerts(prev => [payload.new, ...prev]),
 *   onUpdate: (payload) => setAlerts(prev => prev.map(a => 
 *     a.id === payload.new.id ? payload.new : a
 *   ))
 * });
 * ```
 */
export function useRealtimeSubscription<T extends Record<string, any> = any>(
    options: UseRealtimeSubscriptionOptions<T>
) {
    const {
        table,
        event = '*',
        filter,
        onInsert,
        onUpdate,
        onDelete,
        onChange
    } = options;

    const channelRef = useRef<RealtimeChannel | null>(null);
    const supabase = createClient();

    useEffect(() => {
        // Create unique channel name
        const channelName = `realtime_${table}_${Date.now()}`;

        try {
            const channel = supabase.channel(channelName);

            // Build filter object if provided
            const filterConfig = filter
                ? { filter: `${filter.column}=eq.${filter.value}` }
                : {};

            // Subscribe to INSERT events
            if (event === 'INSERT' || event === '*') {
                channel.on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table,
                        ...filterConfig
                    },
                    (payload: RealtimePostgresChangesPayload<T>) => {
                        console.log(`[Realtime] INSERT on ${table}:`, payload.new);
                        onInsert?.(payload);
                        onChange?.(payload);
                    }
                );
            }

            // Subscribe to UPDATE events
            if (event === 'UPDATE' || event === '*') {
                channel.on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table,
                        ...filterConfig
                    },
                    (payload: RealtimePostgresChangesPayload<T>) => {
                        console.log(`[Realtime] UPDATE on ${table}:`, payload.new);
                        onUpdate?.(payload);
                        onChange?.(payload);
                    }
                );
            }

            // Subscribe to DELETE events
            if (event === 'DELETE' || event === '*') {
                channel.on(
                    'postgres_changes',
                    {
                        event: 'DELETE',
                        schema: 'public',
                        table,
                        ...filterConfig
                    },
                    (payload: RealtimePostgresChangesPayload<T>) => {
                        console.log(`[Realtime] DELETE on ${table}:`, payload.old);
                        onDelete?.(payload);
                        onChange?.(payload);
                    }
                );
            }

            // Subscribe to the channel
            channel.subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`[Realtime] Subscribed to ${table}`);
                } else if (status === 'CHANNEL_ERROR') {
                    console.error(`[Realtime] Error subscribing to ${table}`);
                } else if (status === 'TIMED_OUT') {
                    console.warn(`[Realtime] Subscription to ${table} timed out`);
                }
            });

            channelRef.current = channel;
        } catch (error) {
            console.error(`[Realtime] Failed to set up subscription for ${table}:`, error);
        }

        // Cleanup on unmount
        return () => {
            if (channelRef.current) {
                console.log(`[Realtime] Unsubscribing from ${table}`);
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [table, event, filter?.column, filter?.value]); // Re-subscribe if these change

    return {
        channel: channelRef.current
    };
}
