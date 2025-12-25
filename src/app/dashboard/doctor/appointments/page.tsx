'use client';

import { useState } from 'react';
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
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';

export default function DoctorAppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [currentAppointmentId, setCurrentAppointmentId] = useState<string>('');
  const [noteText, setNoteText] = useState('');

  const { profile, loading: authLoading } = useAuth();
  const { appointments, updateAppointment, loading: appointmentsLoading } = useAppointments();

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

  // Filter appointments for selected date (compare dates only, ignore time)
  const filteredAppointments = appointments.filter((appt) => {
    const apptDate = new Date(appt.appointment_date);
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const apptDateStr = format(apptDate, 'yyyy-MM-dd');

    return apptDateStr === selectedDateStr;
  });

  // Debug logging
  console.log('Selected date:', format(selectedDate, 'yyyy-MM-dd'));
  console.log('All appointments:', appointments.map(a => ({
    id: a.id,
    patient: a.patient_name,
    date: format(new Date(a.appointment_date), 'yyyy-MM-dd'),
    time: a.appointment_time
  })));
  console.log('Filtered appointments for selected date:', filteredAppointments.length);

  const onlineAppointments = filteredAppointments.filter((appt) => appt.consultation_type === 'Video');
  const inPersonAppointments = filteredAppointments.filter((appt) => appt.consultation_type === 'In-Person');

  // Debug logging for consultation type separation
  console.log('Online (Video) appointments:', onlineAppointments.map(a => ({
    patient: a.patient_name,
    type: a.consultation_type,
    time: a.appointment_time
  })));
  console.log('In-Person appointments:', inPersonAppointments.map(a => ({
    patient: a.patient_name,
    type: a.consultation_type,
    time: a.appointment_time
  })));

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
          <h1 className="font-headline text-3xl font-bold">Today's Appointments</h1>
          <p className="text-muted-foreground">
            Here is your schedule for {selectedDate ? format(selectedDate, "PPP") : 'today'}, {profile?.full_name || 'Doctor'}.
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
            <p className="text-muted-foreground">Loading appointments...</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Online Consultations</CardTitle>
              <CardDescription>
                Video calls scheduled for the selected date.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {onlineAppointments.length > 0 ? (
                    onlineAppointments.map((consult) => (
                      <TableRow key={consult.id}>
                        <TableCell className="font-medium">
                          {consult.patient_name}
                        </TableCell>
                        <TableCell>{consult.appointment_time}</TableCell>
                        <TableCell>
                          <Select value={consult.status} onValueChange={(value: any) => handleStatusChange(consult.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Upcoming">Upcoming</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openNotesDialog(consult.id, consult.notes)}>
                            <FileText className="mr-2 h-4 w-4" /> Notes
                          </Button>
                          <Link href="/dashboard/doctor/consultations" passHref>
                            <Button variant="outline" size="sm" disabled={consult.status !== 'Upcoming'}>
                              <Video className="mr-2 h-4 w-4" />
                              Start Call
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                        No online consultations scheduled for this date.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>In-Person Appointments</CardTitle>
              <CardDescription>
                Physical appointments at the clinic for the selected date.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inPersonAppointments.length > 0 ? (
                    inPersonAppointments.map((consult) => (
                      <TableRow key={consult.id}>
                        <TableCell className="font-medium">
                          {consult.patient_name}
                        </TableCell>
                        <TableCell>{consult.appointment_time}</TableCell>
                        <TableCell>
                          <Select value={consult.status} onValueChange={(value: any) => handleStatusChange(consult.id, value)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Upcoming">Upcoming</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => openNotesDialog(consult.id, consult.notes)}>
                            <FileText className="mr-2 h-4 w-4" /> Notes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                        No in-person appointments scheduled for this date.
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
            <DialogTitle>Appointment Notes</DialogTitle>
            <DialogDescription>
              Add or edit notes for this appointment.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={6}
            placeholder="Type your notes here..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
