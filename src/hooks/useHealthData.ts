'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface District {
    id: string
    name: string
    created_by: string | null
    created_at: string
    updated_at: string
}

export interface Hospital {
    id: string
    district_id: string
    name: string
    population: number
    total_beds: number
    occupied_beds: number
    ambulances: number
    doctors: number
    nurses: number
    created_by: string | null
    created_at: string
    updated_at: string
}

export function useDistricts() {
    const [districts, setDistricts] = useState<District[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchDistricts = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('districts')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error
            setDistricts(data || [])
            setError(null)
        } catch (err: any) {
            console.error('Error fetching districts:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const addDistrict = async (name: string) => {
        try {
            const { data: authData } = await supabase.auth.getUser()
            const userId = authData.user?.id
            console.log('DEBUG: Current Auth User ID:', userId)

            // DEBUG: Check if we can read the profile
            const { data: profileCheck, error: profileError } = await supabase
                .from('profiles')
                .select('role, id, auth_user_id')
                .eq('auth_user_id', userId)
                .single()

            console.log('DEBUG: Profile Fetch Result:', { profileCheck, profileError })

            const { data, error } = await supabase
                .from('districts')
                .insert([{ name, created_by: userId }])
                .select()
                .single()

            if (error) throw error
            await fetchDistricts()
            return { success: true, data }
        } catch (err: any) {
            console.error('Error adding district:', JSON.stringify(err, null, 2))
            return { success: false, error: err.message }
        }
    }

    const deleteDistrict = async (id: string) => {
        try {
            const { error } = await supabase
                .from('districts')
                .delete()
                .eq('id', id)

            if (error) throw error
            await fetchDistricts()
            return { success: true }
        } catch (err: any) {
            console.error('Error deleting district:', err)
            return { success: false, error: err.message }
        }
    }

    useEffect(() => {
        fetchDistricts()
    }, [])

    return {
        districts,
        loading,
        error,
        addDistrict,
        deleteDistrict,
        refresh: fetchDistricts
    }
}

export function useHospitals(districtId?: string) {
    const [hospitals, setHospitals] = useState<Hospital[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchHospitals = async () => {
        try {
            setLoading(true)
            let query = supabase
                .from('hospitals')
                .select('*')
                .order('name', { ascending: true })

            if (districtId) {
                query = query.eq('district_id', districtId)
            }

            const { data, error } = await query

            if (error) throw error
            setHospitals(data || [])
            setError(null)
        } catch (err: any) {
            console.error('Error fetching hospitals:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const addHospital = async (hospitalData: Partial<Hospital>) => {
        try {
            const { data: profile } = await supabase.auth.getUser()
            const { data, error } = await supabase
                .from('hospitals')
                .insert([{ ...hospitalData, created_by: profile.user?.id }])
                .select()
                .single()

            if (error) throw error
            await fetchHospitals()
            return { success: true, data }
        } catch (err: any) {
            console.error('Error adding hospital:', err)
            return { success: false, error: err.message }
        }
    }

    const updateHospital = async (id: string, updates: Partial<Hospital>) => {
        try {
            const { data, error } = await supabase
                .from('hospitals')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            await fetchHospitals()
            return { success: true, data }
        } catch (err: any) {
            console.error('Error updating hospital:', err)
            return { success: false, error: err.message }
        }
    }

    const deleteHospital = async (id: string) => {
        try {
            const { error } = await supabase
                .from('hospitals')
                .delete()
                .eq('id', id)

            if (error) throw error
            await fetchHospitals()
            return { success: true }
        } catch (err: any) {
            console.error('Error deleting hospital:', err)
            return { success: false, error: err.message }
        }
    }

    useEffect(() => {
        fetchHospitals()
    }, [districtId])

    return {
        hospitals,
        loading,
        error,
        addHospital,
        updateHospital,
        deleteHospital,
        refresh: fetchHospitals
    }
}
