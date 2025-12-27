'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Video, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { useLanguage } from '@/hooks/useLanguage';

export default function DoctorAppointmentsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en-IN';
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [currentAppointmentId, setCurrentAppointmentId] = useState<string>('');
  const [noteText, setNoteText] = useState('');

  const { profile, loading: authLoading } = useAuth();
  const { appointments, updateAppointment, loading: appointmentsLoading } = useAppointments();
  const { t, formatDate } = useLanguage();

  const openNotesDialog = (appointmentId: string, existingNotes?: string) => {
    setCurrentAppointmentId(appointmentId);
    setNoteText(existingNotes || '');
    setIsNotesDialogOpen(true);
  };

  const handleSaveNote = async () => {
    if (currentAppointmentId) {
      await updateAppointment(currentAppointmentId, { notes: noteText });
    }
    setIsNotesDialogOpen(false);
    setCurrentAppointmentId('');
    setNoteText('');
  };

  const handleStatusChange = async (appointmentId: string, status: 'Upcoming' | 'Completed' | 'Cancelled') => {
    await updateAppointment(appointmentId, { status });
  };

  // Helper to normalize status for display
  const normalizeStatus = (status: string | undefined): 'Upcoming' | 'Completed' | 'Cancelled' => {
    if (!status) return 'Upcoming';
    const s = status.toLowerCase();
    if (s === 'completed') return 'Completed';
    if (s === 'cancelled' || s === 'canceled') return 'Cancelled';
    return 'Upcoming'; // Default to Upcoming for 'upcoming', 'scheduled', or any other value
  };

  // Helper to format time from appointment
  const formatAppointmentTime = (appt: any): string => {
    if (appt.appointment_time) return appt.appointment_time;
    if (appt.appointment_date) {
      return format(new Date(appt.appointment_date), 'hh:mm a');
    }
    return 'N/A';
  };

  // Filter appointments for selected date (compare dates only, ignore time)
  const filteredAppointments = appointments.filter((appt) => {
    const apptDate = new Date(appt.appointment_date);
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const apptDateStr = format(apptDate, 'yyyy-MM-dd');

    return apptDateStr === selectedDateStr;
  });

  const onlineAppointments = filteredAppointments.filter((appt) => appt.consultation_type === 'Video');
  const inPersonAppointments = filteredAppointments.filter((appt) => appt.consultation_type === 'In-Person');

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">{t('dashboard.doctor.todaysAppointmentsPage')}</h1>
          <p className="text-muted-foreground">
            {t('dashboard.doctor.scheduleFor', { date: formatDate(selectedDate, 'long'), name: profile?.full_name || 'Doctor' })}
          </p>
        </div>
        <div className="relative">
          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 md:w-auto"
          />
        </div>
      </div>

      {appointmentsLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.doctor.onlineConsultations')}</CardTitle>
              <CardDescription>
                {t('dashboard.doctor.videoCallsScheduled')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('dashboard.doctor.patientName')}</TableHead>
                    <TableHead>{t('dashboard.doctor.time')}</TableHead>
                    <TableHead>{t('dashboard.doctor.status')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {onlineAppointments.length > 0 ? (
                    onlineAppointments.map((consult) => (
                      <TableRow key={consult.id}>
                        <TableCell className="font-medium">
                          {consult.patient_name}
                        </TableCell>
                        <TableCell>{formatAppointmentTime(consult)}</TableCell>
                        <TableCell>
                          <Select
                            value={normalizeStatus(consult.status)}
                            onValueChange={(value: any) => handleStatusChange(consult.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Upcoming">{t('common.upcoming')}</SelectItem>
                              <SelectItem value="Completed">{t('common.completed')}</SelectItem>
                              <SelectItem value="Cancelled">{t('common.cancelled')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openNotesDialog(consult.id, consult.notes)}>
                            <FileText className="mr-2 h-4 w-4" /> {t('dashboard.doctor.notes')}
                          </Button>
                          <Link href={`/${locale}/dashboard/doctor/video-consultation?appointmentId=${consult.id}`} passHref>
                            <Button variant="outline" size="sm" disabled={normalizeStatus(consult.status) !== 'Upcoming'}>
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
                        {t('dashboard.doctor.noOnlineConsultations')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.doctor.inPersonAppointments')}</CardTitle>
              <CardDescription>
                {t('dashboard.doctor.physicalAppointments')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('dashboard.doctor.patientName')}</TableHead>
                    <TableHead>{t('dashboard.doctor.time')}</TableHead>
                    <TableHead>{t('dashboard.doctor.status')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inPersonAppointments.length > 0 ? (
                    inPersonAppointments.map((consult) => (
                      <TableRow key={consult.id}>
                        <TableCell className="font-medium">
                          {consult.patient_name}
                        </TableCell>
                        <TableCell>{formatAppointmentTime(consult)}</TableCell>
                        <TableCell>
                          <Select
                            value={normalizeStatus(consult.status)}
                            onValueChange={(value: any) => handleStatusChange(consult.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Upcoming">{t('dashboard.doctor.upcomingConsultations')}</SelectItem>
                              <SelectItem value="Completed">{t('common.done')}</SelectItem>
                              <SelectItem value="Cancelled">{t('common.cancel')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openNotesDialog(consult.id, consult.notes)}>
                            <FileText className="mr-2 h-4 w-4" /> {t('dashboard.doctor.notes')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                        {t('dashboard.doctor.noInPersonAppointments')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Notes Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('dashboard.doctor.appointmentNotes')}</DialogTitle>
            <DialogDescription>
              {t('dashboard.doctor.addEditNotes')}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={6}
            placeholder={t('dashboard.doctor.typeNotesHere')}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveNote}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
