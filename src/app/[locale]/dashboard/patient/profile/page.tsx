'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { getSuccessMessageTranslation, getErrorMessageTranslation } from '@/lib/notification-translations';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters.'),
  age: z.coerce.number().min(1, 'Age must be a positive number.').max(120).optional(),
  gender: z.string().optional(),
  phone: z.string().min(10, 'Please enter a valid phone number.').optional().or(z.literal('')),
  address: z.string().min(5, 'Address is required.').optional().or(z.literal('')),
  // photo: z.any().optional(), // TODO: Handle file upload to storage
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function PatientProfilePage() {
  const { toast } = useToast();
  const { profile, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      age: '' as any, // Initialize as empty string for controlled input
      gender: '',
      phone: '',
      address: '',
    }
  });

  // Load profile data into form when fetched
  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        age: profile.age ?? '', // Use nullish coalescing to fallback to empty string
        gender: profile.gender || '',
        address: profile.address || '',
      } as any);
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!profile?.id) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          age: data.age,
          gender: data.gender,
          phone: data.phone,
          address: data.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: getSuccessMessageTranslation('profileUpdated', t),
      });

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: getErrorMessageTranslation('profileUpdateFailed', t),
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">{t('patient.myProfile')}</h1>
        <p className="text-muted-foreground">
          {t('patient.viewAndUpdatePersonal')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('patient.editYourDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Avatar Placeholder (Upload logic requires Storage bucket setup) */}
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">{t('patient.profilePhotoUpload')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('patient.fullName')}</FormLabel>
                      <FormControl><Input placeholder={t('patient.fullNamePlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('patient.phoneNumber')}</FormLabel>
                      <FormControl><Input placeholder={t('patient.phoneNumberPlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('patient.age')}</FormLabel>
                      <FormControl><Input type="number" placeholder={t('patient.agePlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('patient.gender')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('patient.selectGender')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">{t('patient.male')}</SelectItem>
                          <SelectItem value="Female">{t('patient.female')}</SelectItem>
                          <SelectItem value="Other">{t('patient.other')}</SelectItem>
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
                    <FormItem className="md:col-span-2">
                      <FormLabel>{t('patient.fullAddress')}</FormLabel>
                      <FormControl><Input placeholder={t('patient.addressPlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full md:w-auto" disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {t('patient.saveChanges')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
