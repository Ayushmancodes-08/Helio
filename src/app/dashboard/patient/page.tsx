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
import { useAppointments } from '@/hooks/useAppointments';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { useLabReports } from '@/hooks/useLabReports';

export default function PatientDashboardPage() {
  const { profile, loading: authLoading } = useAuth();
  const { appointments, cancelAppointment, loading: appointmentsLoading } = useAppointments();
  const { prescriptions, loading: prescriptionsLoading } = usePrescriptions();
  const { labReports, loading: reportsLoading } = useLabReports();
  const { toast } = useToast();

  const [canJoin, setCanJoin] = useState(false);
  const [countdown, setCountdown] = useState('');

  // Get upcoming appointment
  const upcomingAppointment = useMemo(() => {
    if (!appointments.length) return null;

    const now = new Date();
    const upcoming = appointments
      .filter(appt => appt.status === 'Upcoming' && new Date(appt.appointment_date) >= now)
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0];

    return upcoming || null;
  }, [appointments]);

  // Countdown timer for upcoming appointment
  useEffect(() => {
    if (!upcomingAppointment) return;

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
        title: 'Appointment Cancelled',
        description: 'Your appointment has been successfully cancelled.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Cancellation Failed',
        description: 'Could not cancel your appointment.',
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="font-headline text-3xl font-bold">
          Welcome back, {profile?.full_name || 'Patient'}!
        </h1>
        <p className="text-muted-foreground">
          Manage your health appointments, records, and wellness journey all in one place.
        </p>
      </div>

      {/* Healthy Habits Carousel */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Health Tips</CardTitle>
          <CardDescription>Simple habits for a healthier you</CardDescription>
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
            <p className="text-muted-foreground">Loading appointments...</p>
          </CardContent>
        </Card>
      ) : upcomingAppointment ? (
        <Card className="border-primary/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-primary" />
                Upcoming Appointment
              </CardTitle>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${canJoin ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                {canJoin ? 'Ready to Join' : 'Scheduled'}
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
                  {upcomingAppointment.consultation_type} Consultation
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(upcomingAppointment.appointment_date), 'PPP')}
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    {upcomingAppointment.appointment_time}
                  </p>
                </div>
              </div>
            </div>

            {countdown && (
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm font-medium text-center">{countdown}</p>
              </div>
            )}

            <div className="flex gap-3">
              {canJoin && upcomingAppointment.consultation_type === 'Video' && (
                <Link href="/dashboard/patient/consultation" className="flex-1">
                  <Button className="w-full">
                    <Video className="mr-2 h-4 w-4" />
                    Join Video Call
                  </Button>
                </Link>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className={canJoin ? '' : 'flex-1'}>
                    Cancel Appointment
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this appointment? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelAppointment}>
                      Yes, Cancel
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
            <h3 className="font-semibold mb-2">No Upcoming Appointments</h3>
            <p className="text-muted-foreground mb-4">Book an appointment to get started</p>
            <Link href="/dashboard/patient/appointments">
              <Button>Book Appointment</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Calendar className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Book Appointment</CardTitle>
            <CardDescription>Schedule a consultation with our doctors</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/dashboard/patient/appointments" className="w-full">
              <Button variant="outline" className="w-full">Book Now</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <FileText className="h-8 w-8 text-primary mb-2" />
            <CardTitle>View Records</CardTitle>
            <CardDescription>Access prescriptions and lab reports</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/dashboard/patient/records" className="w-full">
              <Button variant="outline" className="w-full">View Records</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <Pill className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Pharmacy Stock</CardTitle>
            <CardDescription>Check available medicines</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/dashboard/patient/pharmacy-stock" className="w-full">
              <Button variant="outline" className="w-full">Check Stock</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Recent Prescriptions & Reports */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Recent Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prescriptionsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : prescriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No prescriptions yet</p>
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
            <Link href="/dashboard/patient/records">
              <Button variant="link" className="w-full mt-2">View All</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Lab Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Lab Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reportsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : labReports.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No lab reports yet</p>
            ) : (
              <ul className="space-y-3">
                {labReports.slice(0, 3).map(report => (
                  <li key={report.id} className="border-b pb-2 last:border-0">
                    <p className="font-medium text-sm">{report.report_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(report.report_date), 'PPP')} • {report.status}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/dashboard/patient/records">
              <Button variant="link" className="w-full mt-2">View All</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
