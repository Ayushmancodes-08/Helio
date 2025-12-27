'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

interface VideoCallInterfaceProps {
  client: any | null;
  localVideoTrack: any | null;
  localAudioTrack: any | null;
  remoteUsers: any[];
  remoteUserStates: Record<string, { audioOn: boolean; videoOn: boolean }>;
  isMicOn: boolean;
  isCameraOn: boolean;
  patientName: string;
  doctorName: string;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
  isLoading: boolean;
  isDoctor?: boolean;
}

export function VideoCallInterface({
  client,
  localVideoTrack,
  localAudioTrack,
  remoteUsers,
  remoteUserStates,
  isMicOn,
  isCameraOn,
  patientName,
  doctorName,
  onToggleMic,
  onToggleCamera,
  onEndCall,
  isLoading,
  isDoctor = false,
}: VideoCallInterfaceProps) {
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  // Play local video
  useEffect(() => {
    if (localVideoTrack && localVideoRef.current && isCameraOn) {
      try {
        localVideoTrack.play(localVideoRef.current);
        console.log('Local video playing');
      } catch (err) {
        console.error('Error playing local video:', err);
      }
      return () => {
        try {
          localVideoTrack.stop();
        } catch (err) {
          console.error('Error stopping local video:', err);
        }
      };
    }
  }, [localVideoTrack, isCameraOn]);

  // Play remote video
  useEffect(() => {
    if (remoteUsers.length > 0 && remoteVideoRef.current) {
      const remoteUser = remoteUsers[0];
      console.log('Attempting to play remote video for user:', remoteUser.uid, 'Has video track:', !!remoteUser.videoTrack);
      
      if (remoteUser.videoTrack) {
        try {
          remoteUser.videoTrack.play(remoteVideoRef.current);
          console.log('✓ Remote video playing for user:', remoteUser.uid);
        } catch (err) {
          console.error('Error playing remote video:', err);
        }
        return () => {
          try {
            remoteUser.videoTrack?.stop();
          } catch (err) {
            console.error('Error stopping remote video:', err);
          }
        };
      } else {
        console.warn('⚠ Remote user has no video track yet');
      }
    }
  }, [remoteUsers]);

  // Determine local and remote names based on role
  const localName = isDoctor ? doctorName : patientName;
  const remoteName = isDoctor ? patientName : doctorName;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Local Video (You) */}
          <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center border-2 border-slate-700">
            <div
              ref={localVideoRef}
              className="w-full h-full"
              style={{ transform: 'scaleX(-1)' }}
            />
            {!isCameraOn && (
              <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                <p className="text-white text-sm">Camera is off</p>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded text-white text-sm font-medium">
              You
              {!isMicOn && <span className="ml-2">🔇</span>}
              {!isCameraOn && <span className="ml-2">📹</span>}
            </div>
          </div>

          {/* Remote Video (Doctor/Patient) */}
          <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center border-2 border-slate-700">
            {remoteUsers.length > 0 ? (
              <>
                <div ref={remoteVideoRef} className="w-full h-full" />
                <div className="absolute bottom-3 left-3 bg-black/70 px-3 py-1 rounded text-white text-sm font-medium">
                  {remoteName}
                  {remoteUsers[0] && remoteUserStates[remoteUsers[0].uid] && (
                    <>
                      {!remoteUserStates[remoteUsers[0].uid].audioOn && <span className="ml-2">🔇</span>}
                      {!remoteUserStates[remoteUsers[0].uid].videoOn && <span className="ml-2">📹</span>}
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center text-slate-400">
                <p className="mb-2 text-sm">Waiting for {remoteName}...</p>
                {isLoading && <p className="text-xs">Connecting...</p>}
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            size="icon"
            variant={isMicOn ? 'secondary' : 'destructive'}
            onClick={onToggleMic}
            className="rounded-full h-12 w-12"
            title={isMicOn ? 'Mute' : 'Unmute'}
          >
            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          <Button
            size="icon"
            variant={isCameraOn ? 'secondary' : 'destructive'}
            onClick={onToggleCamera}
            className="rounded-full h-12 w-12"
            title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={onEndCall}
            className="rounded-full h-12 w-12"
            title="End call"
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
