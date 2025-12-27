'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAppointments } from '@/hooks/useAppointments';
import { useAgoraCall } from '@/hooks/useAgoraCall';
import { VideoCallInterface } from '@/components/video-call-interface';

export function VideoConsultationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');

  const { profile } = useAuth();
  const { appointments, updateAppointment } = useAppointments();
  const [appointment, setAppointment] = useState<any>(null);
  const [isEndingCall, setIsEndingCall] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showRetry, setShowRetry] = useState(false);

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';
  const channelName = appointmentId ? `consultation-${appointmentId}` : '';
  const uid = profile?.id ? parseInt(profile.id.replace(/\D/g, '').slice(0, 10)) || Math.random() * 1000000 : 0;

  const { 
    isCallActive,
    error: callError,
    startCall,
    endCall,
  } = useAgoraCall({
    appId,
    channelName,
    uid,
  });

  useEffect(() => {
    if (!appointmentId) {
      router.push('/dashboard/doctor/appointments');
      return;
    }

    const foundAppointment = appointments.find((apt) => apt.id === appointmentId);
    if (foundAppointment) {
      setAppointment(foundAppointment);
    }
  }, [appointmentId, appointments, router]);

  const handleEndCall = async () => {
    setIsEndingCall(true);
    try {
      await endCall();
      
      if (appointment) {
        await updateAppointment(appointment.id, {
          status: 'completed',
          ended_at: new Date().toISOString(),
        });
      }

      router.push('/dashboard/doctor/appointments');
    } catch (error) {
      console.error('Error ending call:', error);
      setShowRetry(true);
      setRetryCount((prev) => prev + 1);
    } finally {
      setIsEndingCall(false);
    }
  };

  if (!appointmentId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Appointment Selected</CardTitle>
            <CardDescription>Please select an appointment to start a video consultation.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard/doctor/appointments')} className="w-full">
              Back to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {callError && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Call Error</AlertTitle>
          <AlertDescription>{callError}</AlertDescription>
        </Alert>
      )}

      {showRetry && retryCount > 0 && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to End Call</AlertTitle>
          <AlertDescription>
            Retry attempt {retryCount}. 
            <Button 
              variant="link" 
              size="sm" 
              onClick={handleEndCall}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-1 flex flex-col">
        <VideoCallInterface
          appointmentId={appointmentId}
          patientName={appointment.patient_name}
          onEndCall={handleEndCall}
          isEndingCall={isEndingCall}
        />
      </div>
    </div>
  );
}
