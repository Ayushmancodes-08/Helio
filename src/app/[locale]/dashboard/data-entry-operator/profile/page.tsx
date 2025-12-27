'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';


const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  userId: z.string(),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function DataEntryOperatorProfilePage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      userId: '',
      email: '',
      phone: '',
    }
  });

  useEffect(() => {
    try {
      // Check for hardcoded admin in sessionStorage
      const hardcodedAdmin = sessionStorage.getItem('hardcoded_admin');
      if (hardcodedAdmin) {
        const adminData = JSON.parse(hardcodedAdmin);
        form.reset({
          name: adminData.full_name || '',
          userId: adminData.user_id || '',
          email: adminData.email || '',
          phone: adminData.phone || '',
        });
      }
      setLoading(false);
    } catch (e) {
      console.error('Failed to load user data', e);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load your profile data.' });
      setLoading(false);
    }
  }, [form, toast]);

  const onSubmit = (data: ProfileFormValues) => {
    try {
      // Update sessionStorage for hardcoded admin
      const currentAdmin = sessionStorage.getItem('hardcoded_admin');
      if (currentAdmin) {
        const adminData = JSON.parse(currentAdmin);
        const updatedData = {
          ...adminData,
          full_name: data.name,
          email: data.email,
          phone: data.phone,
        };
        sessionStorage.setItem('hardcoded_admin', JSON.stringify(updatedData));
      }

      toast({
        title: t('dataEntryOperator.profileUpdated'),
        description: t('dataEntryOperator.profileUpdatedSuccess'),
      });

      // Reload to update sidebar
      window.location.reload();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('dataEntryOperator.updateFailed'),
        description: t('dataEntryOperator.somethingWentWrong'),
      });
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-headline text-3xl font-bold">{t('dataEntryOperator.myProfile')}</h1>
          <p className="text-muted-foreground">{t('dataEntryOperator.loadingProfile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">{t('dataEntryOperator.myProfile')}</h1>
        <p className="text-muted-foreground">
          {t('dataEntryOperator.viewUpdateProfile')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dataEntryOperator.editYourDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('dataEntryOperator.fullName')}</FormLabel>
                      <FormControl><Input placeholder={t('dataEntryOperator.fullNamePlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('dataEntryOperator.userId')}</FormLabel>
                      <FormControl><Input {...field} readOnly className="text-muted-foreground" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('dataEntryOperator.emailAddress')}</FormLabel>
                      <FormControl><Input type="email" placeholder={t('dataEntryOperator.emailPlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('dataEntryOperator.phoneNumber')}</FormLabel>
                      <FormControl><Input type="tel" placeholder={t('dataEntryOperator.phonePlaceholder')} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" className="w-full md:w-auto">
                <Save className="mr-2 h-4 w-4" /> {t('dataEntryOperator.saveChanges')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
