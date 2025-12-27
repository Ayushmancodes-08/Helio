'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { defaultLocale } from '@/config/i18n';

export default function SignupPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || defaultLocale;

  useEffect(() => {
    // Redirect to patient signup by default
    router.replace(`/${locale}/signup/patient`);
  }, [router, locale]);

  return null;
}
