'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, KeyRound } from 'lucide-react';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';

export default function PatientLoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en-IN';
  const { toast } = useToast();
  const { t: tCommon } = useLanguage();
  const t = useTranslations('auth');

  const handleRequestOtp = async () => {
    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      toast({ variant: 'destructive', title: tCommon('common.errors.invalidPhone') || 'Invalid Phone Number', description: tCommon('common.errors.invalidPhoneDesc') || 'Please enter a valid 10-digit phone number.' });
      return;
    }

    try {
      const supabase = createClient()

      // Request OTP from Supabase
      const { error } = await supabase.auth.signInWithOtp({
        phone: `+91${phone}`,
      })

      if (error) {
        if (error.message.includes('not found') || error.message.includes('User not found')) {
          toast({
            variant: 'destructive',
            title: tCommon('common.errors.accountNotFound') || 'Account Not Found',
            description: tCommon('common.errors.accountNotFoundDesc') || 'No account exists with this phone number. Please sign up first.',
            action: <Button variant="secondary" size="sm" onClick={() => router.push(`/${locale}/signup/patient`)}>Sign Up</Button>,
          });
          return
        }
        throw error
      }

      toast({ title: 'OTP Sent!', description: `An OTP has been sent to +91${phone}` });
      setStep(2);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('common.errors.failedToSendOtp') || 'Failed to Send OTP',
        description: error.message || t('common.tryAgain') || 'Please try again.'
      });
    }
  };

  const handleLogin = async () => {
    if (!otp || otp.length !== 6) {
      toast({ variant: 'destructive', title: t('common.errors.invalidOtp') || 'Invalid OTP', description: t('common.errors.invalidOtpDesc') || 'Please enter the 6-digit OTP.' });
      return;
    }

    try {
      const supabase = createClient()

      // Verify OTP
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+91${phone}`,
        token: otp,
        type: 'sms',
      })

      if (error) {
        toast({ variant: 'destructive', title: t('common.errors.invalidOtp') || 'Invalid OTP', description: t('common.errors.invalidOtpDesc') || 'The OTP you entered is incorrect.' });
        return;
      }

      if (data.user) {
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_user_id', data.user.id)
          .single()

        toast({ title: 'Login Successful!', description: `Welcome ${profile?.full_name || 'back'}!` });
        router.push(`/${locale}/dashboard/patient`);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: tCommon('common.errors.loginFailed') || 'Login Failed',
        description: error.message || tCommon('common.tryAgain') || 'Please try again.'
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href={`/${locale}`} className="flex items-center justify-center gap-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">{tCommon('common.app.name') || 'Grameen Swasthya Setu'}</span>
          </Link>
          <CardTitle>{t('patientLogin')}</CardTitle>
          <CardDescription>
            {step === 1 ? t('enterPhone') : t('enterOtp')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 ? (
            <div className="space-y-4">
              <Input
                type="tel"
                placeholder={t('phonePlaceholder')}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={10}
              />
              <Button onClick={handleRequestOtp} className="w-full">
                {t('requestOtp')} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                type="text"
                placeholder={t('otpPlaceholder')}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
              <Button onClick={handleLogin} className="w-full">
                {tCommon('common.buttons.login')} <KeyRound className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="link" onClick={() => setStep(1)} className="w-full">
                {t('backToPhone')}
              </Button>
            </div>
          )}
          <div className="text-center text-sm text-muted-foreground pt-4">
            {t('login.noAccount')}{' '}
            <Link href={`/${locale}/signup/patient`} className="text-primary underline">
              {t('signup.title')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
