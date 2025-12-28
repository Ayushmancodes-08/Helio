'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { HeartPulse, Pill, Video, Calendar, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { usePatientDashboard } from '@/hooks/usePatientDashboard';
import { useLanguage } from '@/hooks/useLanguage';
import { getSuccessMessageTranslation, getErrorMessageTranslation } from '@/lib/notification-translations';
import { ChatbotFloatingButton } from '@/components/ChatbotFloatingButton';

export default function PatientDashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const {
    appointments,
    prescriptions,
    labReports,
    loading: dashboardLoading,
    cancelAppointment
  } = usePatientDashboard();

  const { toast } = useToast();
  const { t, formatDate, locale } = useLanguage();

  // Map loading states for backward compatibility if needed, or just use one
  const appointmentsLoading = dashboardLoading;
  const prescriptionsLoading = dashboardLoading;
  const reportsLoading = dashboardLoading;

  const [canJoin, setCanJoin] = useState(false);
  const [countdown, setCountdown] = useState('');

  // Get upcoming appointment
  const upcomingAppointment = useMemo(() => {
    if (!appointments.length) return null;

    const now = new Date();
    const upcoming = appointments
      .filter(appt => {
        const status = (appt.status || '').toLowerCase();
        const isUpcoming = status === 'upcoming' || status === 'scheduled' || !status;
        const appointmentDate = appt.appointment_date ? new Date(appt.appointment_date) : new Date();
        return isUpcoming && appointmentDate >= now;
      })
      .sort((a, b) => {
        const dateA = a.appointment_date ? new Date(a.appointment_date).getTime() : 0;
        const dateB = b.appointment_date ? new Date(b.appointment_date).getTime() : 0;
        return dateA - dateB;
      })[0];

    return upcoming || null;
  }, [appointments]);

  // Countdown timer for upcoming appointment
  useEffect(() => {
    if (!upcomingAppointment) return;

    if (!upcomingAppointment || !upcomingAppointment.appointment_date) return;

    const appointmentDateTime = new Date(upcomingAppointment.appointment_date);

    const updateCountdown = () => {
      const now = new Date();
      const diff = appointmentDateTime.getTime() - now.getTime();

      // Can join 15 min before to 1 hour after
      const joinWindowStart = appointmentDateTime.getTime() - 15 * 60 * 1000;
      const joinWindowEnd = appointmentDateTime.getTime() + 60 * 60 * 1000;

      if (now.getTime() >= joinWindowStart && now.getTime() <= joinWindowEnd) {
        setCanJoin(true);
        setCountdown('You can join the call now.');
        return;
      } else {
        setCanJoin(false);
      }

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setCountdown(`Join in: ${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m ${seconds}s`);
      } else {
        setCountdown('Appointment time has passed.');
      }
    };

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => clearInterval(interval);
  }, [upcomingAppointment]);

  const handleCancelAppointment = async () => {
    if (!upcomingAppointment) return;

    const result = await cancelAppointment(upcomingAppointment.id);

    if (result) {
      toast({
        title: getSuccessMessageTranslation('appointmentCancelled', t),
      });
    } else {
      toast({
        variant: 'destructive',
        title: getErrorMessageTranslation('appointmentCancellationFailed', t),
      });
    }
  };

  const healthyHabitsImages = PlaceHolderImages.filter((img) =>
    img.id.startsWith('healthy-habit-')
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="font-headline text-2xl sm:text-3xl font-bold">
          {t('patient.welcomeBack', { name: profile?.full_name || 'Patient' })}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {t('patient.manageHealth')}
        </p>
      </div>

      {/* Healthy Habits Carousel */}
      <Card>
        <CardHeader>
          <CardTitle>{t('patient.dailyHealthTips')}</CardTitle>
          <CardDescription>{t('patient.simpleHabits')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Carousel className="w-full">
            <CarouselContent>
              {healthyHabitsImages.map((img) => (
                <CarouselItem key={img.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="overflow-hidden">
                    <Image
                      src={img.imageUrl}
                      alt={img.description}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover"
                    />
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </CardContent>
      </Card>

      {/* Upcoming Appointment */}
      {appointmentsLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t('patient.loadingAppointments')}</p>
          </CardContent>
        </Card>
      ) : upcomingAppointment ? (
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-primary" />
                {t('patient.upcomingAppointment')}
              </CardTitle>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${canJoin ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                {canJoin ? t('patient.readyToJoin') : t('patient.scheduled')}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <Image
                src={PlaceHolderImages.find(img => img.id === 'avatar-doctor')?.imageUrl || ''}
                alt="Doctor"
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Dr. {upcomingAppointment.doctor_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {upcomingAppointment.consultation_type} {t('patient.doctorConsultation')}
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {upcomingAppointment.appointment_date ? formatDate(new Date(upcomingAppointment.appointment_date), 'long') : 'Date N/A'}
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    {upcomingAppointment.appointment_time || (upcomingAppointment.appointment_date ? formatDate(new Date(upcomingAppointment.appointment_date), 'short') : 'Time N/A')}
                  </p>
                </div>
              </div>
            </div>

            {countdown && (
              <div className="p-3 sm:p-4 rounded-lg bg-muted">
                <p className="text-sm font-medium text-center">{countdown}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {canJoin && upcomingAppointment.consultation_type === 'Video' && (
                <Link href={`/${locale}/dashboard/patient/video-consultation?appointmentId=${upcomingAppointment.id}`} className="flex-1">
                  <Button className="w-full h-11 sm:h-10">
                    <Video className="mr-2 h-4 w-4" />
                    {t('patient.joinNow')}
                  </Button>
                </Link>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className={`h-11 sm:h-10 ${canJoin ? '' : 'flex-1'}`}>
                    {t('patient.cancelAppointment')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('patient.cancelConfirm')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('patient.cancelConfirmDesc')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('patient.noKeepIt')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelAppointment}>
                      {t('patient.yesCancel')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">{t('patient.noUpcomingAppointments')}</h3>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">{t('patient.bookAppointment')}</p>
            <Link href={`/${locale}/dashboard/patient/appointments`}>
              <Button className="h-11 sm:h-10">{t('patient.bookNow')}</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Calendar className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">{t('patient.bookAppointment')}</CardTitle>
            <CardDescription className="text-sm">{t('patient.scheduleConsultation')}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href={`/${locale}/dashboard/patient/appointments`} className="w-full">
              <Button variant="outline" className="w-full h-11 sm:h-10">{t('patient.bookNow')}</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <FileText className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">{t('patient.viewRecords')}</CardTitle>
            <CardDescription className="text-sm">{t('patient.accessRecords')}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href={`/${locale}/dashboard/patient/records`} className="w-full">
              <Button variant="outline" className="w-full h-11 sm:h-10">{t('patient.viewRecords')}</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Pill className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-lg">{t('patient.pharmacyStock')}</CardTitle>
            <CardDescription className="text-sm">{t('patient.checkMedicines')}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href={`/${locale}/dashboard/patient/pharmacy-stock`} className="w-full">
              <Button variant="outline" className="w-full h-11 sm:h-10">{t('patient.checkStock')}</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Prescriptions & Reports */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Pill className="h-5 w-5" />
              {t('patient.recentPrescriptions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prescriptionsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : prescriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('patient.noPrescriptions')}</p>
            ) : (
              <ul className="space-y-3">
                {prescriptions.slice(0, 3).map(rx => (
                  <li key={rx.id} className="border-b pb-2 last:border-0">
                    <p className="font-medium text-sm">{rx.medication}</p>
                    <p className="text-xs text-muted-foreground">
                      {rx.dosage} • Dr. {rx.doctor_name}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Link href={`/${locale}/dashboard/patient/records`}>
              <Button variant="link" className="w-full mt-2">{t('patient.viewAll')}</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Lab Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              {t('patient.recentLabReports')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : labReports.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t('patient.noLabReports')}</p>
            ) : (
              <ul className="space-y-3">
                {labReports.slice(0, 3).map(report => (
                  <li key={report.id} className="border-b pb-2 last:border-0">
                    <p className="font-medium text-sm">{report.report_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(new Date(report.report_date), 'short')} • {report.status}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Link href={`/${locale}/dashboard/patient/records`}>
              <Button variant="link" className="w-full mt-2">{t('patient.viewAll')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <ChatbotFloatingButton />
    </div>
  );
}
