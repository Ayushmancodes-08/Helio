'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Doctor {
    id: string
    user_id: string | null
    full_name: string
    email: string | null
    phone: string | null
    specialization: string | null
    license_number: string | null
    photo: string | null
}

export function useDoctors(specialization?: string) {
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchDoctors = async () => {
        try {
            setLoading(true)
            let query = supabase
                .from('profiles')
                .select('id, user_id, full_name, email, phone, specialization, license_number, photo')
                .eq('role', 'doctor')
                .order('full_name', { ascending: true })

            if (specialization) {
                query = query.eq('specialization', specialization)
            }

            const { data, error: fetchError } = await query

            if (fetchError) throw fetchError
            setDoctors(data || [])
            setError(null)
        } catch (err: any) {
            console.error('Error fetching doctors:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDoctors()
    }, [specialization])

    return {
        doctors,
        loading,
        error,
        refresh: fetchDoctors
    }
}
