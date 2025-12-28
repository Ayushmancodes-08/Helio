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

        // 2. Fetch Profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_user_id', user.id)
            .single();

        if (profileError || !profile || profile.role !== 'health-official') {
            return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
        }

        // 3. Fetch Metrics (Hospital Resource) across all districts (Health Official sees all or regional?)
        // Assuming 'hospital_metrics' table exists.
        const { data: metrics, error: metricsError } = await supabase
            .from('hospital_metrics')
            .select('*');

        if (metricsError) throw metricsError;

        // 4. Fetch Disease Reports for summation
        // Assuming 'disease_reports' table
        const { data: reports, error: reportError } = await supabase
            .from('disease_reports')
            .select('*');

        if (reportError) throw reportError;

        // 5. Fetch Active Alerts
        const { data: alerts, error: alertsError } = await supabase
            .from('health_alerts')
            .select('*')
            .eq('status', 'Active') // Optimize: only fetch active
            .order('created_at', { ascending: false });

        if (alertsError) throw alertsError;

        return NextResponse.json({
            profile,
            metrics,
            reports,
            alerts
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
            }
        });

    } catch (error: any) {
        console.error('Health official dashboard fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
