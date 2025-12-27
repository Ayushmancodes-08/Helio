'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useAppointments } from '@/hooks/useAppointments';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export default function VideoConsultationPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { t, formatDate, formatRelativeTime, formatCurrency } = useLanguage();

  const appointmentId = searchParams.get('appointmentId');
  const doctor = searchParams.get('doctor') || 'Dr. Anjali Sharma';
  const time = searchParams.get('time') || 'Tomorrow, 10:30 AM';
  const isInCall = !!appointmentId;

  useEffect(() => {
    if (!isInCall) return;

    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: true
        });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: t('patient.cameraAccessRequired'),
          description: t('patient.cameraAccessDenied'),
        });
      }
    };

    getCameraPermission();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast, isInCall, t]);

  const toggleMute = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
  };

  const toggleCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
        setIsCameraOff(!track.enabled);
      });
    }
  };

  const endCall = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    toast({
      title: 'Call Ended',
      description: 'Your consultation has ended.',
    });
    router.push('/dashboard/patient/consultation');
  };

  const handleJoinCall = (appointmentId: string) => {
    router.push(`/dashboard/patient/video-consultation?appointmentId=${appointmentId}`);
  };

  // Show all appointments
  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.consultation_type === 'Video'
  );

  // Debug: log all appointments
  console.log('All appointments:', appointments);
  console.log('Filtered video consultations:', upcomingAppointments);

  // If in call, show video interface
  if (isInCall) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-headline text-3xl font-bold">{t('patient.videoConsultation')}</h1>
          <p className="text-muted-foreground">
            {t('patient.youAreNowInCall')}
          </p>
        </div>

        {hasCameraPermission === false && (
          <Alert variant="destructive">
            <VideoOff className="h-4 w-4" />
            <AlertTitle>{t('patient.cameraAccessRequired')}</AlertTitle>
            <AlertDescription>
              {t('patient.cameraAccessDenied')}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t('patient.consultationWith', { doctor })}</CardTitle>
            <CardDescription>{t('patient.appointmentTime', { time })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative aspect-video rounded-lg bg-muted flex items-center justify-center">
                <div className="absolute inset-0 bg-black rounded-lg">
                  <video
                    ref={videoRef}
                    className="h-full w-full object-cover rounded-md"
                    style={{ transform: 'scaleX(-1)' }}
                    autoPlay
                    muted
                  />
                  {isCameraOff && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <p className="text-white">{t('patient.cameraOff')}</p>
                    </div>
                  )}
                </div>
                <p className="absolute bottom-2 left-2 rounded-sm bg-black/50 px-2 py-1 text-xs text-white">{t('patient.youAreInCall')}</p>
              </div>
              <div className="relative aspect-video rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                <p>{t('patient.waitingForDoctor', { doctor })}</p>
                <p className="absolute bottom-2 left-2 rounded-sm bg-black/50 px-2 py-1 text-xs text-white">{doctor}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-center gap-4">
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={toggleMute}>
                {isMuted ? <MicOff /> : <Mic />}
              </Button>
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={toggleCamera}>
                {isCameraOff ? <VideoOff /> : <Video />}
              </Button>
              <Button variant="destructive" size="icon" className="h-12 w-12 rounded-full" onClick={endCall}>
                <PhoneOff />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show appointments list with join buttons
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">{t('patient.videoConsultations')}</h1>
        <p className="text-muted-foreground">
          {t('patient.joinUpcomingConsultations')}
        </p>
      </div>

      {appointmentsLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : upcomingAppointments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {t('patient.noUpcomingConsultations')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {upcomingAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Dr. {appointment.doctor_name}</CardTitle>
                    <CardDescription>
                      {appointment.appointment_date ? formatDate(new Date(appointment.appointment_date), 'long') : 'Date not set'} at {appointment.appointment_time || 'Time not set'}
                    </CardDescription>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                    {appointment.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p>{t('patient.consultationType')}: <span className="font-medium">{appointment.consultation_type}</span></p>
                  </div>
                  <Button
                    onClick={() => handleJoinCall(appointment.id)}
                    className="gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    {t('patient.joinCall')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
