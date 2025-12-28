import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

export type Appointment = {
    id: string;
    patient_id: string;
    doctor_id: string;
    appointment_date?: Date;
    appointment_time?: string;
    consultation_type: 'Video' | 'In-Person';
    status: 'Upcoming' | 'Completed' | 'Cancelled';
    notes?: string;
    channel_name?: string;
    consultation_fee?: number; // Fee for the consultation
    created_at?: Date;
    updated_at?: Date;
    ended_at?: string;
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
        if (!profile) {
            console.log('No profile available, skipping fetch');
            return;
        }

        console.log('Fetching appointments for profile:', profile.id, 'role:', profile.role);
        setLoading(true);
        setError(null);

        try {
            // First fetch appointments without joins
            let query = supabase
                .from('appointments')
                .select('*')
                .order('created_at', { ascending: false });

            // Filter based on role
            if (profile.role === 'doctor') {
                query = query.eq('doctor_id', profile.id);
            } else if (profile.role === 'patient') {
                query = query.eq('patient_id', profile.id);
            }

            const { data, error: fetchError, status, statusText } = await query;



            if (fetchError) {
                console.error('Supabase error details:', {
                    message: fetchError.message,
                    details: fetchError.details,
                    hint: fetchError.hint,
                    code: fetchError.code
                });
                throw new Error(fetchError.message || `Database error: ${status} ${statusText}`);
            }

            // Fetch profile names separately if we have appointments
            let formattedData = data || [];

            if (formattedData.length > 0) {
                // Get unique patient and doctor IDs
                const patientIds = [...new Set(formattedData.map(a => a.patient_id))];
                const doctorIds = [...new Set(formattedData.map(a => a.doctor_id))];
                const allIds = [...new Set([...patientIds, ...doctorIds])];

                // Fetch all relevant profiles
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .in('id', allIds);

                const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

                formattedData = formattedData.map((appt: any) => {
                    const appointmentDate = new Date(appt.appointment_date || appt.scheduled_at || appt.date || appt.created_at);

                    // Use stored time slot, or extract from timestamp, or check notes
                    let appointmentTime = appt.appointment_time;
                    if (!appointmentTime) {
                        // Try to extract from notes if it contains "Time: XX:XX"
                        if (appt.notes && appt.notes.includes('Time:')) {
                            const match = appt.notes.match(/Time:\s*(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
                            if (match) appointmentTime = match[1];
                        }
                        // Fallback: extract from appointment_date timestamp
                        if (!appointmentTime) {
                            appointmentTime = appointmentDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            });
                        }
                    }

                    return {
                        ...appt,
                        appointment_date: appointmentDate,
                        appointment_time: appointmentTime,
                        patient_name: profileMap.get(appt.patient_id) || 'Unknown',
                        doctor_name: profileMap.get(appt.doctor_id) || 'Unknown',
                    };
                });
            }

            setAppointments(formattedData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch appointments');
            console.error('Error fetching appointments:', err);
        } finally {
            setLoading(false);
        }
    };

    // Create new appointment
    const createAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
        if (!profile) {
            setError('You must be logged in to create an appointment');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            // Generate a unique channel name for video consultations
            const channelName = `appointment-${Date.now()}-${Math.random().toString(36).substring(7)}`;

            // Combine date and time into a single timestamp
            let appointmentDateTime: string | undefined;
            if (appointment.appointment_date) {
                const date = appointment.appointment_date instanceof Date
                    ? appointment.appointment_date
                    : new Date(appointment.appointment_date);

                // If we have a time string like "09:30 AM", parse and combine with date
                if (appointment.appointment_time) {
                    const timeStr = appointment.appointment_time;
                    const [time, period] = timeStr.split(' ');
                    const [hours, minutes] = time.split(':').map(Number);

                    let hour24 = hours;
                    if (period === 'PM' && hours !== 12) hour24 = hours + 12;
                    if (period === 'AM' && hours === 12) hour24 = 0;

                    date.setHours(hour24, minutes, 0, 0);
                }

                appointmentDateTime = date.toISOString();
            }

            // Build insert data - store time slot and date
            const insertData: Record<string, any> = {
                patient_id: profile.id,
                doctor_id: appointment.doctor_id,
                channel_name: channelName,
            };

            if (appointmentDateTime) {
                insertData.appointment_date = appointmentDateTime;
            }

            // Store the selected time slot (e.g., "09:00 AM")
            if (appointment.appointment_time) {
                insertData.appointment_time = appointment.appointment_time;
            }

            if (appointment.consultation_type) {
                insertData.consultation_type = appointment.consultation_type;
            }

            if (appointment.notes) {
                insertData.notes = appointment.notes;
            }

            console.log('Creating appointment with data:', insertData);

            const { data, error: insertError, status, statusText } = await supabase
                .from('appointments')
                .insert(insertData)
                .select()
                .single();

            console.log('Insert response:', { data, error: insertError, status, statusText });

            if (insertError) {
                console.error('Supabase insert error:', {
                    message: insertError.message,
                    details: insertError.details,
                    hint: insertError.hint,
                    code: insertError.code
                });
                throw new Error(insertError.message || 'Failed to create appointment');
            }

            console.log('Appointment created successfully:', data);
            await fetchAppointments();
            return data;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to create appointment';
            setError(errorMessage);
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
