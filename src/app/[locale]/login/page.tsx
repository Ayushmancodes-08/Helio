'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/hooks/useLanguage';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en-IN';
  const { t: tCommon } = useLanguage();
  const t = useTranslations('auth');
  const [selectedRole, setSelectedRole] = useState('');

  const handleRoleSelection = () => {
    if (!selectedRole) return;
    if (selectedRole === 'patient') {
      router.push(`/${locale}/login/patient`);
    } else {
      router.push(`/${locale}/login/professional?role=${selectedRole}`);
    }
  };

  const roles = [
    { value: 'patient', label: tCommon('common.roles.patient') || 'Patient' },
    { value: 'doctor', label: tCommon('common.roles.doctor') || 'Doctor' },
    { value: 'pharmacist', label: tCommon('common.roles.pharmacist') || 'Pharmacist' },
    { value: 'health-official', label: tCommon('common.roles.healthOfficial') || 'Health Official' },
    { value: 'data-entry-operator', label: tCommon('common.roles.dataEntryOperator') || 'Data Entry Operator' },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-secondary p-4">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher variant="homepage" />
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <Link href={`/${locale}`} className="flex items-center justify-center gap-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">{tCommon('common.app.name') || 'Grameen Swasthya Setu'}</span>
          </Link>
          <CardTitle>{t('login.welcome')}</CardTitle>
          <CardDescription>{t('login.chooseRole')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Select onValueChange={setSelectedRole} value={selectedRole}>
            <SelectTrigger>
              <SelectValue placeholder={t('login.chooseRole')} />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value} className="capitalize">
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleRoleSelection} disabled={!selectedRole} className="w-full">
            {tCommon('common.continue')} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
