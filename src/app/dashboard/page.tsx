'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale } from '@/config/i18n';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to locale-aware dashboard
    router.replace(`/${defaultLocale}/dashboard`);
  }, [router]);

  return null;
}
