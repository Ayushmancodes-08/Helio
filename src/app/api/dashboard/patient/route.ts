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

        if (profileError || !profile || profile.role !== 'patient') {
            return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
        }

        // 3. Call RPC
        const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_patient_dashboard_data', { p_id: profile.id });

        if (rpcError) throw rpcError;

        // Format Data
        const appointments = (rpcData.appointments || []).map((appt: any) => ({
            ...appt,
            // Keep dates as strings for JSON serialization, client will parse
        }));

        const prescriptions = (rpcData.prescriptions || []).map((rx: any) => ({
            ...rx,
        }));

        const labReports = (rpcData.lab_reports || []).map((rep: any) => ({
            ...rep,
        }));

        return NextResponse.json({
            profile,
            appointments,
            prescriptions,
            labReports,
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
            }
        });

    } catch (error: any) {
        console.error('Patient dashboard fetch error:', error);
        console.error('Stack trace:', error.stack);
        return NextResponse.json({ error: error.message || 'Internal Server Error', details: error }, { status: 500 });
    }
}
