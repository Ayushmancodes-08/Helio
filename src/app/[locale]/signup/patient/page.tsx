'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useErrorTranslation } from '@/hooks/useErrorTranslation';
import { Camera, ArrowRight, KeyRound } from 'lucide-react';
import { Logo } from '@/components/icons';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLanguage } from '@/hooks/useLanguage';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  age: z.coerce.number().min(1, 'Age must be a positive number.').max(120),
  gender: z.string().min(1, 'Please select a gender.'),
  phone: z.string().regex(/^\d{10}$/, 'Please enter a valid 10-digit phone number.'),
  address: z.string().min(5, 'Address is required.'),
  photo: z.any().optional(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function PatientSignupPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'en-IN';
  const { toast } = useToast();
  const { getErrorMessage } = useErrorTranslation();
  const { t: tCommon } = useLanguage();
  const t = useTranslations('auth');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      gender: '',
      phone: '',
      address: '',
      age: 0,
      photo: null,
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        form.setValue('photo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [step, setStep] = useState(1); // 1 = form, 2 = OTP verification
  const [otp, setOtp] = useState('');

  const onSubmit = async (data: SignupFormValues) => {
    try {
      const supabase = createClient()

      // For phone auth in Supabase, we use signInWithOtp (not signUp!)
      // This works for both new users and existing users
      const { error: otpError } = await supabase.auth.signInWithOtp({
        phone: `+91${data.phone}`,
      })

      if (otpError) {
        console.error('OTP send error:', otpError)
        const errorMessage = getErrorMessage('authentication.invalidCredentials')
        toast({
          variant: 'destructive',
          title: t('signup.title'),
          description: errorMessage,
        })
        return
      }

      // Store patient data temporarily to use after OTP verification
      localStorage.setItem('pending_patient_signup', JSON.stringify({
        full_name: data.name,
        age: data.age,
        gender: data.gender,
        address: data.address,
        photo: data.photo,
        phone: data.phone,
      }))

      toast({
        title: t('otpSent'),
        description: `${t('otpSentDesc')} +91${data.phone}`,
      })

      // Move to OTP verification step
      setStep(2)
    } catch (error: any) {
      const errorMessage = getErrorMessage('general.serverError')
      toast({
        variant: 'destructive',
        title: t('signup.title'),
        description: error.message || errorMessage,
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      const errorMessage = getErrorMessage('validation.invalidNumber')
      toast({
        variant: 'destructive',
        title: tCommon('common.errors.invalidOtp') || 'Invalid OTP',
        description: errorMessage
      });
      return;
    }

    try {
      const supabase = createClient()
      const formData = form.getValues()

      // Verify OTP
      const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
        phone: `+91${formData.phone}`,
        token: otp,
        type: 'sms',
      })

      if (verifyError) {
        const errorMessage = getErrorMessage('authentication.tokenInvalid')
        toast({
          variant: 'destructive',
          title: tCommon('common.errors.invalidOtp') || 'Invalid OTP',
          description: errorMessage
        });
        return;
      }

      if (!authData.user) {
        throw new Error('No user returned after verification')
      }

      // Get pending signup data
      const pendingData = localStorage.getItem('pending_patient_signup')
      if (pendingData) {
        const patientData = JSON.parse(pendingData)

        // Update the auto-created profile with patient details
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: patientData.full_name,
            age: patientData.age,
            gender: patientData.gender,
            address: patientData.address,
            photo: patientData.photo,
            phone: patientData.phone,
            role: 'patient',
          })
          .eq('auth_user_id', authData.user.id)

        if (updateError) {
          console.error('Profile update error:', updateError)
        }

        // Clear pending data
        localStorage.removeItem('pending_patient_signup')
      }

      toast({
        title: t('loginSuccess'),
        description: t('accountCreatedDesc'),
      })

      // Redirect to patient dashboard
      router.push(`/${locale}/dashboard/patient`)
    } catch (error: any) {
      const errorMessage = getErrorMessage('general.serverError')
      toast({
        variant: 'destructive',
        title: t('signup.title'),
        description: error.message || errorMessage,
      })
      console.error(error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary py-12 px-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher variant="homepage" />
      </div>
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Link href={`/${locale}`} className="flex items-center justify-center gap-2 mb-4">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">{tCommon('common.app.name') || 'Grameen Swasthya Setu'}</span>
          </Link>
          <CardTitle>{step === 1 ? t('signup.patient.title') : t('signup.patient.verifyOtp')}</CardTitle>
          <CardDescription>
            {step === 1 ? t('signup.patient.description') : t('signup.patient.otpVerification')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <Camera className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                  </label>
                  <Input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  <FormMessage>{form.formState.errors.photo?.message as string}</FormMessage>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('signup.patient.name')}</FormLabel>
                        <FormControl><Input placeholder={t('signup.patient.namePlaceholder')} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('phone')}</FormLabel>
                        <FormControl><Input type="tel" placeholder={t('phonePlaceholder')} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('signup.patient.age')}</FormLabel>
                        <FormControl><Input type="number" placeholder={t('signup.patient.agePlaceholder')} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('signup.patient.gender')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('signup.patient.genderPlaceholder')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">{t('signup.patient.male')}</SelectItem>
                            <SelectItem value="female">{t('signup.patient.female')}</SelectItem>
                            <SelectItem value="other">{t('signup.patient.other')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>{t('signup.patient.address')}</FormLabel>
                        <FormControl><Input placeholder={t('signup.patient.addressPlaceholder')} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full">
                  {t('signup.submit')} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="otp" className="text-sm font-medium">{t('signup.patient.enterOtp')}</label>
                <div className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-muted-foreground" />
                  <Input
                    id="otp"
                    type="text"
                    placeholder={t('signup.patient.otpPlaceholder')}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                </div>
              </div>

              <Button onClick={handleVerifyOtp} className="w-full">
                {t('signup.patient.verifyAndCreate')}
              </Button>

              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="w-full"
              >
                {t('signup.patient.backToForm')}
              </Button>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            {t('haveAccount')}{' '}
            <Link href={`/${locale}/login/patient`} className="text-primary hover:underline">
              {t('login.title')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
