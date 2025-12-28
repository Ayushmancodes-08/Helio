import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();

    try {
        // 1. Check Session
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch Profile to confirm role
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_user_id', user.id)
            .single();

        if (profileError || !profile || profile.role !== 'doctor') {
            return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
        }

        // 3. Parallel Fetch: Appointments
        // We can't do complex joins easily in one query without RPC, so we do parallel queries here (Server-side is fast)
        // Fetch appointments for this doctor
        const { data: appointmentsRaw, error: apptError } = await supabase
            .from('appointments')
            .select('*')
            .eq('doctor_id', profile.id)
            .order('appointment_date', { ascending: true });

        if (apptError) throw apptError;

        // Fetch relevant patient profiles for these appointments
        const patientIds = [...new Set(appointmentsRaw?.map(a => a.patient_id) || [])];

        let patientsMap = new Map();
        let demographicsData: { age: string; patients: number }[] = [];

        if (patientIds.length > 0) {
            const { data: patients, error: patientsError } = await supabase
                .from('profiles')
                .select('id, full_name, age, gender, photo')
                .in('id', patientIds);

            if (patientsError) throw patientsError;

            patients?.forEach(p => patientsMap.set(p.id, p));

            // Calculate Demographics (Backend calculation)
            const ageGroups = { '0-18': 0, '19-30': 0, '31-45': 0, '46-60': 0, '60+': 0 };
            patients?.forEach(p => {
                if (typeof p.age === 'number') {
                    if (p.age <= 18) ageGroups['0-18']++;
                    else if (p.age <= 30) ageGroups['19-30']++;
                    else if (p.age <= 45) ageGroups['31-45']++;
                    else if (p.age <= 60) ageGroups['46-60']++;
                    else ageGroups['60+']++;
                }
            });
            demographicsData = Object.entries(ageGroups).map(([age, count]) => ({ age, patients: count }));
        }

        // Format Appointments
        const appointments = appointmentsRaw?.map(appt => ({
            ...appt,
            patient_name: patientsMap.get(appt.patient_id)?.full_name || 'Unknown',
            patient_photo: patientsMap.get(appt.patient_id)?.photo || null
        })) || [];

        // Return Aggregated Data
        return NextResponse.json({
            profile,
            appointments,
            demographics: demographicsData,
            stats: {
                totalPatients: patientIds.length,
                todaysAppointmentsCount: appointments.filter(a => {
                    const today = new Date().toISOString().split('T')[0];
                    return a.appointment_date?.startsWith(today); // Simple check, verify timezone handling in real app
                }).length
            }
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' // 1 min fresh, 5 min stale
            }
        });

    } catch (error: any) {
        console.error('Doctor dashboard fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
