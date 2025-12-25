import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

export type Appointment = {
    id: string;
    patient_id: string;
    doctor_id: string;
    appointment_date: Date;
    appointment_time: string;
    consultation_type: 'Video' | 'In-Person';
    status: 'Upcoming' | 'Completed' | 'Cancelled';
    notes?: string;
    created_at?: Date;
    updated_at?: Date;
    // Joined fields
    patient_name?: string;
    doctor_name?: string;
};

export function useAppointments() {
    const { profile } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    // Fetch appointments based on user role
    const fetchAppointments = async () => {
        if (!profile) return;

        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('appointments')
                .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(id, full_name),
          doctor:profiles!appointments_doctor_id_fkey(id, full_name)
        `)
                .order('appointment_date', { ascending: true });

            // Explicitly filter based on role to ensure data consistency
            if (profile.role === 'doctor') {
                query = query.eq('doctor_id', profile.id);
            } else if (profile.role === 'patient') {
                query = query.eq('patient_id', profile.id);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            const formattedData = (data || []).map((appt: any) => ({
                ...appt,
                appointment_date: new Date(appt.appointment_date),
                patient_name: appt.patient?.full_name,
                doctor_name: appt.doctor?.full_name,
            }));

            setAppointments(formattedData);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching appointments:', err);
        } finally {
            setLoading(false);
        }
    };

    // Create new appointment
    const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: insertError } = await supabase
                .from('appointments')
                .insert({
                    patient_id: appointment.patient_id,
                    doctor_id: appointment.doctor_id,
                    appointment_date: appointment.appointment_date.toISOString(),
                    appointment_time: appointment.appointment_time,
                    consultation_type: appointment.consultation_type,
                    status: appointment.status || 'Upcoming',
                    notes: appointment.notes,
                })
                .select()
                .single();

            if (insertError) throw insertError;

            await fetchAppointments(); // Refresh list
            return data;
        } catch (err: any) {
            setError(err.message);
            console.error('Error creating appointment:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Update appointment
    const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: updateError } = await supabase
                .from('appointments')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (updateError) throw updateError;

            await fetchAppointments(); // Refresh list
            return data;
        } catch (err: any) {
            setError(err.message);
            console.error('Error updating appointment:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Cancel appointment
    const cancelAppointment = async (id: string) => {
        return updateAppointment(id, { status: 'Cancelled' });
    };

    // Complete appointment
    const completeAppointment = async (id: string, notes?: string) => {
        return updateAppointment(id, { status: 'Completed', notes });
    };

    useEffect(() => {
        if (profile) {
            fetchAppointments();
        }
    }, [profile]);

    return {
        appointments,
        loading,
        error,
        fetchAppointments,
        createAppointment,
        updateAppointment,
        cancelAppointment,
        completeAppointment,
    };
}
