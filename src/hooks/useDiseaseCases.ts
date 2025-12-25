'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface DiseaseCase {
    id: string
    hospital_id: string
    disease_name: string
    case_count: number
    report_date: string
    severity: 'Low' | 'Medium' | 'High' | 'Critical'
    notes: string | null
    entered_by: string | null
    created_at: string
    updated_at: string
}

export function useDiseaseCases(hospitalId?: string) {
    const [cases, setCases] = useState<DiseaseCase[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchCases = async () => {
        try {
            setLoading(true)
            let query = supabase
                .from('disease_cases')
                .select('*')
                .order('report_date', { ascending: false })

            if (hospitalId) {
                query = query.eq('hospital_id', hospitalId)
            }

            const { data, error } = await query

            if (error) throw error
            setCases(data || [])
            setError(null)
        } catch (err: any) {
            console.error('Error fetching disease cases:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const addCase = async (caseData: {
        hospital_id: string
        disease_name: string
        case_count: number
        report_date: string
        severity: 'Low' | 'Medium' | 'High' | 'Critical'
        notes?: string
    }) => {
        try {
            const { data: profile } = await supabase.auth.getUser()
            const { data, error } = await supabase
                .from('disease_cases')
                .insert([{ ...caseData, entered_by: profile.user?.id }])
                .select()
                .single()

            if (error) throw error
            await fetchCases()
            return { success: true, data }
        } catch (err: any) {
            console.error('Error adding disease case:', err)
            return { success: false, error: err.message }
        }
    }

    const updateCase = async (id: string, updates: Partial<DiseaseCase>) => {
        try {
            const { data, error } = await supabase
                .from('disease_cases')
                .update(updates)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error
            await fetchCases()
            return { success: true, data }
        } catch (err: any) {
            console.error('Error updating disease case:', err)
            return { success: false, error: err.message }
        }
    }

    const deleteCase = async (id: string) => {
        try {
            const { error } = await supabase
                .from('disease_cases')
                .delete()
                .eq('id', id)

            if (error) throw error
            await fetchCases()
            return { success: true }
        } catch (err: any) {
            console.error('Error deleting disease case:', err)
            return { success: false, error: err.message }
        }
    }

    useEffect(() => {
        fetchCases()
    }, [hospitalId])

    return {
        cases,
        loading,
        error,
        addCase,
        updateCase,
        deleteCase,
        refresh: fetchCases
    }
}
