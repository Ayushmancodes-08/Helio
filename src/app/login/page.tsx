'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale } from '@/config/i18n';

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to locale-aware login
    router.replace(`/${defaultLocale}/login`);
  }, [router]);

  return null;
}
