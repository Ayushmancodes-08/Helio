'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Video, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { useLanguage } from '@/hooks/useLanguage';

export default function DoctorConsultationsPage() {
  const { profile, loading: authLoading } = useAuth();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { t, formatDate, formatRelativeTime } = useLanguage();

  // Filter upcoming consultations (today and future, status = Upcoming)
  const upcomingConsultations = useMemo(() => {
    return appointments
      .filter((appt) => {
        const status = (appt.status || '').toLowerCase();
        const isUpcoming = status === 'upcoming' || status === 'scheduled' || !status;
        const appointmentDate = new Date(appt.appointment_date);
        return isUpcoming && appointmentDate >= new Date();
      })
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
  }, [appointments]);

  // Filter past consultations (completed or cancelled)
  const pastConsultations = useMemo(() => {
    return appointments
      .filter((appt) => {
        const status = (appt.status || '').toLowerCase();
        const isPast = status === 'completed' || status === 'cancelled';
        return isPast;
      })
      .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
  }, [appointments]);

  if (authLoading || appointmentsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">
          {t('dashboard.doctor.manageConsultations')}
        </h1>
        <p className="text-muted-foreground">
          {t('dashboard.doctor.joinUpcomingCalls')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.doctor.upcomingConsultations')}</CardTitle>
          <CardDescription>
            {t('dashboard.doctor.videoCallsScheduledToday')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('dashboard.doctor.patientName')}</TableHead>
                <TableHead>{t('dashboard.doctor.time')}</TableHead>
                <TableHead>{t('dashboard.doctor.status')}</TableHead>
                <TableHead className="text-right">{t('dashboard.doctor.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingConsultations.length > 0 ? (
                upcomingConsultations.map((consult) => (
                  <TableRow key={consult.id}>
                    <TableCell className="font-medium">
                      {consult.patient_name}
                    </TableCell>
                    <TableCell>
                      {consult.appointment_time || formatDate(new Date(consult.appointment_date), 'short')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{t('dashboard.doctor.upcomingConsultations')}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/doctor/video-consultation?appointmentId=${consult.id}`} passHref>
                        <Button variant="outline" size="sm">
                          <Video className="mr-2 h-4 w-4" />
                          {t('dashboard.doctor.startCall')}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    {t('dashboard.doctor.noUpcomingConsultations')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.doctor.pastConsultations')}</CardTitle>
          <CardDescription>
            {t('dashboard.doctor.completedCancelledConsultations')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('dashboard.doctor.patientName')}</TableHead>
                <TableHead>{t('dashboard.doctor.date')}</TableHead>
                <TableHead>{t('dashboard.doctor.status')}</TableHead>
                <TableHead className="text-right">{t('dashboard.doctor.action')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pastConsultations.length > 0 ? (
                pastConsultations.map((consult) => (
                  <TableRow key={consult.id}>
                    <TableCell className="font-medium">
                      {consult.patient_name}
                    </TableCell>
                    <TableCell>
                      {formatDate(new Date(consult.appointment_date), 'long')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={consult.status?.toLowerCase() === 'completed' ? 'secondary' : 'destructive'}>
                        {consult.status || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        {t('dashboard.doctor.viewDetails')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    {t('dashboard.doctor.noPastConsultations')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
