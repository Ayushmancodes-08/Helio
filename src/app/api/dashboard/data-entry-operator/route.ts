import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();

    try {
        // 1. Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.warn('[DEO API] Unauthorized: No user');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch and verify profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_user_id', user.id)
            .single();

        if (profileError) {
            console.error('[DEO API] Profile fetch error:', profileError);
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        if (!profile || profile.role !== 'data-entry-operator') {
            console.warn('[DEO API] Unauthorized role:', profile?.role);
            return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
        }

        // 3. Fetch hospitals with district info - use fresh data
        const { data: hospitals, error: hospitalsError } = await supabase
            .from('hospitals')
            .select(`
                id,
                name,
                district_id,
                population,
                total_beds,
                occupied_beds,
                ambulances,
                doctors,
                nurses,
                updated_at,
                districts(id, name)
            `)
            .order('districts(name)', { ascending: true });

        if (hospitalsError) {
            console.error('[DEO API] Hospitals fetch error:', hospitalsError);
            throw hospitalsError;
        }

        console.log(`[DEO API] Fetched ${hospitals?.length || 0} hospitals`);

        // 4. Aggregate metrics by district
        const metricsMap = new Map<string, any>();
        
        hospitals?.forEach((hospital: any) => {
            const districtName = hospital.districts?.name || 'Unknown';
            const districtId = hospital.district_id;
            
            if (!metricsMap.has(districtId)) {
                metricsMap.set(districtId, {
                    id: districtId,
                    district_name: districtName,
                    total_beds: 0,
                    occupied_beds: 0,
                    total_ambulances: 0,
                    population: 0,
                    doctors: 0,
                    nurses: 0,
                    hospital_count: 0,
                    last_updated: new Date().toISOString()
                });
            }
            
            const metric = metricsMap.get(districtId);
            metric.total_beds += hospital.total_beds || 0;
            metric.occupied_beds += hospital.occupied_beds || 0;
            metric.total_ambulances += hospital.ambulances || 0;
            metric.population += hospital.population || 0;
            metric.doctors += hospital.doctors || 0;
            metric.nurses += hospital.nurses || 0;
            metric.hospital_count += 1;
            
            // Track latest update time
            if (hospital.updated_at) {
                const updateTime = new Date(hospital.updated_at);
                const currentTime = new Date(metric.last_updated);
                if (updateTime > currentTime) {
                    metric.last_updated = hospital.updated_at;
                }
            }
        });

        const metrics = Array.from(metricsMap.values());
        console.log(`[DEO API] Aggregated into ${metrics.length} district metrics`);

        return NextResponse.json({
            profile,
            metrics,
            timestamp: new Date().toISOString()
        }, {
            headers: {
                'Cache-Control': 'private, no-cache, no-store, must-revalidate',
                'Content-Type': 'application/json',
                'X-Metrics-Count': metrics.length.toString(),
            }
        });

    } catch (error: any) {
        console.error('[DEO API] Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
