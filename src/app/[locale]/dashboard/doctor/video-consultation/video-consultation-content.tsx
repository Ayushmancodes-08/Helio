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
import { useLanguage } from '@/hooks/useLanguage';

export function VideoConsultationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');

  const { profile } = useAuth();
  const { appointments, updateAppointment } = useAppointments();
  const { t } = useLanguage();
  const [appointment, setAppointment] = useState<any>(null);
  const [isEndingCall, setIsEndingCall] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [showRetry, setShowRetry] = useState(false);

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';
  const channelName = appointmentId ? `consultation-${appointmentId}` : '';
  const uid = profile?.id ? parseInt(profile.id.replace(/\D/g, '').slice(0, 10)) || Math.random() * 1000000 : 0;

  const {
    error: callError,
    remoteUsers,
    leaveCall,
  } = useAgoraCall({
    appId,
    channelName,
    uid,
  });

  // Waiting room state - show until patient joins
  const [isWaitingForPatient, setIsWaitingForPatient] = useState(true);

  // Detect when patient joins
  useEffect(() => {
    if (remoteUsers && remoteUsers.length > 0) {
      setIsWaitingForPatient(false);
    }
  }, [remoteUsers]);

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
      await leaveCall();

      // Only update appointment to completed if patient actually joined
      // If still in waiting room (no remote users), don't update status
      if (appointment && !isWaitingForPatient) {
        await updateAppointment(appointment.id, {
          status: 'Completed',
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
            <CardTitle>{t('doctor.videoConsultation.noAppointmentSelected')}</CardTitle>
            <CardDescription>{t('doctor.videoConsultation.pleaseSelectAppointment')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/dashboard/doctor/appointments')} className="w-full">
              {t('doctor.videoConsultation.backToAppointments')}
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
          <AlertTitle>{t('doctor.videoConsultation.callError')}</AlertTitle>
          <AlertDescription>{callError}</AlertDescription>
        </Alert>
      )}

      {showRetry && retryCount > 0 && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('doctor.videoConsultation.failedToEndCall')}</AlertTitle>
          <AlertDescription>
            {t('doctor.videoConsultation.retryAttempt', { count: retryCount })}
            <Button
              variant="link"
              size="sm"
              onClick={handleEndCall}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              {t('doctor.videoConsultation.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-1 flex flex-col">
        {isWaitingForPatient ? (
          <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md mx-4">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
                <CardTitle className="text-2xl">
                  {t('doctor.videoConsultation.waitingForPatient', { patientName: appointment.patient_name })}
                </CardTitle>
                <CardDescription className="mt-2">
                  {t('doctor.videoConsultation.callWillStart')}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  variant="outline"
                  onClick={handleEndCall}
                  disabled={isEndingCall}
                >
                  {isEndingCall ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {t('common.cancel')}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <VideoCallInterface
            appointmentId={appointmentId}
            patientName={appointment.patient_name}
            onEndCall={handleEndCall}
            isEndingCall={isEndingCall}
          />
        )}
      </div>
    </div>
  );
}
