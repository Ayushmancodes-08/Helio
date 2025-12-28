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

        if (profileError || !profile || profile.role !== 'data-entry-operator') {
            return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
        }

        // 3. Fetch Metrics (Hospital Resource) across all districts
        const { data: metrics, error: metricsError } = await supabase
            .from('hospital_metrics')
            .select('*')
            .order('district_name');

        if (metricsError) throw metricsError;

        return NextResponse.json({
            profile,
            metrics
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
            }
        });

    } catch (error: any) {
        console.error('DEO dashboard fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
