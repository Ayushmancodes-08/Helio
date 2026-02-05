import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

export type InventoryItem = {
    id: string;
    medicine_name: string;
    quantity: number;
    expiry_date?: Date;
    price?: number;
    pharmacist_id?: string;
    created_at?: Date;
    updated_at?: Date;
    // Joined fields
    pharmacist_name?: string;
    pharmacist_address?: string;
    pharmacist_latitude?: number;
    pharmacist_longitude?: number;
};

export function useInventory() {
    const { profile } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    // Fetch inventory
    const fetchInventory = async () => {
        if (!profile) return;

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('inventory')
                .select(`
          *,
          pharmacist:profiles(id, full_name, address, latitude, longitude)
        `)
                .order('medicine_name', { ascending: true });

            if (fetchError) throw fetchError;

            const formattedData = (data || []).map((item: any) => ({
                ...item,
                expiry_date: item.expiry_date ? new Date(item.expiry_date) : undefined,
                pharmacist_name: item.pharmacist?.full_name,
                pharmacist_address: item.pharmacist?.address,
                pharmacist_latitude: item.pharmacist?.latitude,
                pharmacist_longitude: item.pharmacist?.longitude,
            }));

            setInventory(formattedData);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    // Create new inventory item
    const createInventoryItem = async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: insertError } = await supabase
                .from('inventory')
                .insert({
                    medicine_name: item.medicine_name,
                    quantity: item.quantity,
                    expiry_date: item.expiry_date?.toISOString(),
                    price: item.price,
                    pharmacist_id: item.pharmacist_id || profile?.id,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            await fetchInventory(); // Refresh list
            return data;
        } catch (err: any) {
            setError(err.message);
            console.error('Error creating inventory item:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Update inventory item
    const updateInventoryItem = async (id: string, updates: Partial<InventoryItem>) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: updateError } = await supabase
                .from('inventory')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            await fetchInventory(); // Refresh list
            return data;
        } catch (err: any) {
            setError(err.message);
            console.error('Error updating inventory item:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Delete inventory item
    const deleteInventoryItem = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const { error: deleteError } = await supabase
                .from('inventory')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            await fetchInventory(); // Refresh list
            return true;
        } catch (err: any) {
            setError(err.message);
            console.error('Error deleting inventory item:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile) {
            fetchInventory();
        }
    }, [profile]);

    return {
        inventory,
        loading,
        error,
        fetchInventory,
        createInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
    };
}
