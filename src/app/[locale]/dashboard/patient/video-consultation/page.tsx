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

export default function PatientVideoConsultationPage() {
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
    remoteUsers,
    remoteUserStates,
    isJoined,
    isMicOn,
    isCameraOn,
    error,
    loading,
    toggleMic,
    toggleCamera,
    leaveCall,
    client,
    localVideoTrack,
    localAudioTrack,
  } = useAgoraCall({
    appId,
    channelName,
    uid,
    userName: profile?.full_name,
  });

  // Show retry button after 10 seconds of loading with error
  useEffect(() => {
    if (loading && error) {
      const timer = setTimeout(() => {
        setShowRetry(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loading, error]);

  // Find appointment details
  useEffect(() => {
    if (appointmentId && appointments.length > 0) {
      const found = appointments.find(a => a.id === appointmentId);
      setAppointment(found);
    }
  }, [appointmentId, appointments]);

  const handleEndCall = async () => {
    try {
      setIsEndingCall(true);
      await leaveCall();

      // Mark appointment as completed
      if (appointmentId) {
        await updateAppointment(appointmentId, { status: 'Completed' });
      }

      router.push('/dashboard/patient');
    } catch (err) {
      console.error('Error ending call:', err);
    } finally {
      setIsEndingCall(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setShowRetry(false);
    // Refresh page to retry connection
    window.location.reload();
  };

  if (!appointment) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Video Consultation</h1>
        <p className="text-muted-foreground">
          Connected with Dr. {appointment.doctor_name}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{error}</p>
            <div className="text-sm space-y-2">
              <p><strong>Troubleshooting steps:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your internet connection</li>
                <li>Ensure camera and microphone permissions are granted</li>
                <li>Try refreshing the page</li>
                <li>Clear browser cache (Ctrl+Shift+Delete)</li>
                <li>Try in incognito/private mode</li>
              </ul>
            </div>
            {showRetry && (
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="gap-2 mt-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Connection (Attempt {retryCount + 1})
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Consultation with Dr. {appointment.doctor_name}</CardTitle>
          <CardDescription>
            Appointment Time: {appointment.appointment_time || 'N/A'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Initializing video call...</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {error ? 'Attempting to reconnect...' : 'Please wait while we connect you...'}
                </p>
              </div>
            </div>
          ) : remoteUsers.length === 0 ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👨‍⚕️</span>
                  </div>
                </div>
                <p className="text-lg font-medium text-muted-foreground">Waiting for Dr. {appointment.doctor_name}...</p>
                <p className="text-sm text-muted-foreground mt-2">Doctor hasn't joined yet</p>
                <p className="text-xs text-muted-foreground mt-4">Your video is ready. Doctor will see you when they join.</p>
              </div>
            </div>
          ) : (
            <VideoCallInterface
              client={client}
              localVideoTrack={localVideoTrack}
              localAudioTrack={localAudioTrack}
              remoteUsers={remoteUsers}
              remoteUserStates={remoteUserStates}
              isMicOn={isMicOn}
              isCameraOn={isCameraOn}
              patientName={profile?.full_name || 'Patient'}
              doctorName={appointment.doctor_name}
              onToggleMic={toggleMic}
              onToggleCamera={toggleCamera}
              onEndCall={handleEndCall}
              isLoading={!isJoined}
              isDoctor={false}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
