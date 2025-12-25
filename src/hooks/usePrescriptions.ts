import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

export type Prescription = {
    id: string;
    appointment_id?: string;
    patient_id: string;
    doctor_id: string;
    medication: string;
    dosage: string;
    instructions?: string;
    issued_date: Date;
    created_at?: Date;
    updated_at?: Date;
    // Joined fields
    patient_name?: string;
    doctor_name?: string;
};

export function usePrescriptions() {
    const { profile } = useAuth();
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    // Fetch prescriptions based on user role
    const fetchPrescriptions = async () => {
        if (!profile) return;

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('prescriptions')
                .select(`
          *,
          patient:profiles!prescriptions_patient_id_fkey(id, full_name),
          doctor:profiles!prescriptions_doctor_id_fkey(id, full_name)
        `)
                .order('issued_date', { ascending: false });

            if (fetchError) throw fetchError;

            const formattedData = (data || []).map((rx: any) => ({
                ...rx,
                issued_date: new Date(rx.issued_date),
                patient_name: rx.patient?.full_name,
                doctor_name: rx.doctor?.full_name,
            }));

            setPrescriptions(formattedData);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching prescriptions:', err);
        } finally {
            setLoading(false);
        }
    };

    // Create new prescription
    const createPrescription = async (prescription: Omit<Prescription, 'id' | 'created_at' | 'updated_at' | 'issued_date'>) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: insertError } = await supabase
                .from('prescriptions')
                .insert({
                    appointment_id: prescription.appointment_id,
                    patient_id: prescription.patient_id,
                    doctor_id: prescription.doctor_id,
                    medication: prescription.medication,
                    dosage: prescription.dosage,
                    instructions: prescription.instructions,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            await fetchPrescriptions(); // Refresh list
            return data;
        } catch (err: any) {
            setError(err.message);
            console.error('Error creating prescription:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile) {
            fetchPrescriptions();
        }
    }, [profile]);

    const updatePrescriptionStatus = async (id: string, status: string) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: updateError } = await supabase
                .from('prescriptions')
                .update({ status })
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            await fetchPrescriptions(); // Refresh list
            return data;
        } catch (err: any) {
            setError(err.message);
            console.error('Error updating prescription status:', JSON.stringify(err, null, 2));
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        prescriptions,
        loading,
        error,
        fetchPrescriptions,
        createPrescription,
        updatePrescriptionStatus,
    };
}
