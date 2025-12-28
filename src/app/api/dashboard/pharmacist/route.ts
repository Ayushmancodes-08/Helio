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

        if (profileError || !profile || profile.role !== 'pharmacist') {
            return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
        }

        // 3. Fetch Inventory Stats (Only quantity needed)
        const { data: inventory, error: invError } = await supabase
            .from('inventory')
            .select('quantity')
            .eq('pharmacist_id', profile.id);

        if (invError) throw invError;

        // Calculate Stats on Server
        let inStock = 0;
        let lowStock = 0;
        let outOfStock = 0;

        inventory?.forEach((item: any) => {
            if (item.quantity <= 0) outOfStock++;
            else if (item.quantity < 50) lowStock++;
            else inStock++;
        });

        return NextResponse.json({
            profile,
            stats: {
                inStock,
                lowStock,
                outOfStock
            }
        }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
            }
        });

    } catch (error: any) {
        console.error('Pharmacist dashboard fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
