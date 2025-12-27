'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en-IN';

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const supabase = createClient();
      
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          // Not logged in, redirect to login
          router.replace(`/${locale}/login`);
          return;
        }

        // Get user profile to determine role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          router.replace(`/${locale}/login`);
          return;
        }

        // Redirect to role-specific dashboard
        const roleMap: Record<string, string> = {
          'patient': 'patient',
          'doctor': 'doctor',
          'pharmacist': 'pharmacist',
          'health-official': 'health-official',
          'data-entry-operator': 'data-entry-operator',
        };

        const dashboardRole = roleMap[profile.role] || 'patient';
        router.replace(`/${locale}/dashboard/${dashboardRole}`);
      } catch (error) {
        console.error('Error checking user:', error);
        router.replace(`/${locale}/login`);
      }
    };

    checkUserAndRedirect();
  }, [router, locale]);

  return (
    <div className="flex items-center justify-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
