'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale } from '@/config/i18n';

export default function SignupRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to locale-aware signup
    router.replace(`/${defaultLocale}/signup`);
  }, [router]);

  return null;
}
