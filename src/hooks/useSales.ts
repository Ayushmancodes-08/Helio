'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'

export type SaleRecord = {
    id: string
    pharmacist_id: string
    medicine_name: string
    quantity: number
    total_amount: number
    sale_date: string
    created_at: string
}

export function useSales() {
    const { profile } = useAuth()
    const [sales, setSales] = useState<SaleRecord[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const supabase = createClient()

    const fetchSales = async () => {
        if (!profile) return

        setLoading(true)
        setError(null)

        try {
            const { data, error } = await supabase
                .from('pharmacy_sales')
                .select('*')
                .order('sale_date', { ascending: false })

            if (error) throw error

            setSales(data || [])
        } catch (err: any) {
            console.error('Error fetching sales:', JSON.stringify(err, null, 2));
            setError(err.message || 'Failed to fetch sales');
        } finally {
            setLoading(false)
        }
    }

    const recordSale = async (sale: Omit<SaleRecord, 'id' | 'created_at' | 'pharmacist_id'>) => {
        if (!profile?.id) return null

        setLoading(true)
        setError(null)

        try {
            const { data, error } = await supabase
                .from('pharmacy_sales')
                .insert({
                    ...sale,
                    pharmacist_id: profile.id
                })
                .select()
                .single()

            if (error) throw error

            await fetchSales()
            return data
        } catch (err: any) {
            console.error('Error recording sale:', err)
            setError(err.message)
            return null
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (profile) {
            fetchSales()
        }
    }, [profile])

    return {
        sales,
        loading,
        error,
        fetchSales,
        recordSale
    }
}
