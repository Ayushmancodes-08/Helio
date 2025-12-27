'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale } from '@/config/i18n';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to default locale
    router.replace(`/${defaultLocale}`);
  }, [router]);

  return null;
}
