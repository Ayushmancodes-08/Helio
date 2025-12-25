'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function VideoConsultationPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const doctor = searchParams.get('doctor') || 'Dr. Anjali Sharma';
  const time = searchParams.get('time') || 'Tomorrow, 10:30 AM';

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
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
  }, [toast]);

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
    router.push('/dashboard/patient');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Video Consultation</h1>
        <p className="text-muted-foreground">
          You are now in a video call with your doctor.
        </p>
      </div>

      {hasCameraPermission === false && (
        <Alert variant="destructive">
          <VideoOff className="h-4 w-4" />
          <AlertTitle>Camera Access Required</AlertTitle>
          <AlertDescription>
            Please allow camera access in your browser to use this feature.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Consultation with {doctor}</CardTitle>
          <CardDescription>Appointment Time: {time}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative aspect-video rounded-lg bg-muted flex items-center justify-center">
              <div className="absolute inset-0 bg-black rounded-lg">
                <video ref={videoRef} className="h-full w-full object-cover rounded-md" autoPlay muted />
                {isCameraOff && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <p className="text-white">Camera is off</p>
                  </div>
                )}
              </div>
              <p className="absolute bottom-2 left-2 rounded-sm bg-black/50 px-2 py-1 text-xs text-white">Aarav Sharma (You)</p>
            </div>
            <div className="relative aspect-video rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
              <p>Waiting for {doctor}...</p>
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
