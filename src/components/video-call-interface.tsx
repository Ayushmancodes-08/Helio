'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, Minimize2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('good');

  // Auto-hide controls after 3 seconds of no mouse movement
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  // Play local video with optimization
  useEffect(() => {
    if (localVideoTrack && localVideoRef.current && isCameraOn) {
      try {
        // Optimize video settings for better performance
        localVideoTrack.setEncoderConfiguration({
          width: 1280,
          height: 720,
          frameRate: 30,
          bitrateMin: 600,
          bitrateMax: 1000,
        });
        localVideoTrack.play(localVideoRef.current);
        console.log('Local video playing with optimizations');
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

  // Play remote video with optimization
  useEffect(() => {
    if (remoteUsers.length > 0 && remoteVideoRef.current) {
      const remoteUser = remoteUsers[0];

      if (remoteUser.videoTrack) {
        try {
          remoteUser.videoTrack.play(remoteVideoRef.current);
          console.log('✓ Remote video playing');
          setConnectionQuality('excellent');
        } catch (err) {
          console.error('Error playing remote video:', err);
          setConnectionQuality('poor');
        }
        return () => {
          try {
            remoteUser.videoTrack?.stop();
          } catch (err) {
            console.error('Error stopping remote video:', err);
          }
        };
      }
    }
  }, [remoteUsers]);

  // Monitor connection quality
  useEffect(() => {
    if (client && remoteUsers.length > 0) {
      const interval = setInterval(() => {
        const stats = client.getRTCStats();
        if (stats) {
          // Simple quality estimation based on packet loss
          const quality = stats.RecvPacketLossRate < 1 ? 'excellent' :
            stats.RecvPacketLossRate < 5 ? 'good' : 'poor';
          setConnectionQuality(quality);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [client, remoteUsers]);

  const localName = isDoctor ? doctorName : patientName;
  const remoteName = isDoctor ? patientName : doctorName;

  const getQualityColor = () => {
    switch (connectionQuality) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
    }
  };

  return (
    <div className={cn(
      "relative w-full h-screen bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden",
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Remote Video (Main/Large) */}
      <div className="relative w-full h-full">
        {remoteUsers.length > 0 ? (
          <>
            <div
              ref={remoteVideoRef}
              className="w-full h-full object-cover"
              style={{ filter: 'brightness(1.1)' }}
            />

            {/* Remote user name tag */}
            <div className="absolute top-6 left-6">
              <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                      {remoteName.charAt(0).toUpperCase()}
                    </div>
                    <div className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900", getQualityColor())} />
                  </div>
                  <div className="text-white">
                    <p className="font-semibold text-sm">{remoteName}</p>
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      {remoteUsers[0] && remoteUserStates[remoteUsers[0].uid] && (
                        <>
                          {!remoteUserStates[remoteUsers[0].uid].audioOn && <MicOff className="h-3 w-3" />}
                          {!remoteUserStates[remoteUsers[0].uid].videoOn && <VideoOff className="h-3 w-3" />}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection quality indicator */}
            <div className="absolute top-6 right-6">
              <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", getQualityColor())} />
                  <span className="text-white text-xs font-medium capitalize">{connectionQuality}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center mx-auto animate-pulse">
                  <Users className="h-12 w-12 text-blue-400" />
                </div>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-white text-xl font-semibold mb-1">Waiting for {remoteName}</p>
                <p className="text-white/60 text-sm">{isLoading ? 'Connecting...' : 'They will join soon'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Local Video (Picture-in-Picture) */}
      <div className="absolute bottom-24 right-6 w-64 h-48 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-slate-800">
        <div
          ref={localVideoRef}
          className="w-full h-full"
          style={{ transform: 'scaleX(-1)', filter: 'brightness(1.05)' }}
        />
        {!isCameraOn && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col items-center justify-center">
            <VideoOff className="h-10 w-10 text-white/40 mb-2" />
            <p className="text-white/60 text-sm">Camera Off</p>
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center justify-between">
            <span className="text-white text-xs font-medium">You ({localName.split(' ')[0]})</span>
            <div className="flex items-center gap-1">
              {!isMicOn && <MicOff className="h-3 w-3 text-red-400" />}
              {!isCameraOn && <VideoOff className="h-3 w-3 text-red-400" />}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Control Bar */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 transition-all duration-300 ease-in-out",
        showControls ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      )}>
        <div className="bg-gradient-to-t from-black/80 via-black/60 to-transparent backdrop-blur-xl pt-8 pb-6 px-6">
          <div className="max-w-2xl mx-auto flex items-center justify-center gap-4">
            {/* Microphone Control */}
            <Button
              size="lg"
              variant={isMicOn ? 'secondary' : 'destructive'}
              onClick={onToggleMic}
              className={cn(
                "rounded-full h-14 w-14 shadow-lg transition-all hover:scale-110",
                isMicOn ? "bg-white/20 hover:bg-white/30" : "bg-red-500 hover:bg-red-600"
              )}
              title={isMicOn ? 'Mute' : 'Unmute'}
            >
              {isMicOn ? <Mic className="h-6 w-6 text-white" /> : <MicOff className="h-6 w-6" />}
            </Button>

            {/* Camera Control */}
            <Button
              size="lg"
              variant={isCameraOn ? 'secondary' : 'destructive'}
              onClick={onToggleCamera}
              className={cn(
                "rounded-full h-14 w-14 shadow-lg transition-all hover:scale-110",
                isCameraOn ? "bg-white/20 hover:bg-white/30" : "bg-red-500 hover:bg-red-600"
              )}
              title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {isCameraOn ? <Video className="h-6 w-6 text-white" /> : <VideoOff className="h-6 w-6" />}
            </Button>

            {/* End Call */}
            <Button
              size="lg"
              onClick={onEndCall}
              className="rounded-full h-16 w-16 bg-red-600 hover:bg-red-700 shadow-xl transition-all hover:scale-110"
              title="End call"
            >
              <PhoneOff className="h-7 w-7" />
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-full h-14 w-14 bg-white/20 hover:bg-white/30 shadow-lg transition-all hover:scale-110"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-6 w-6 text-white" /> : <Maximize2 className="h-6 w-6 text-white" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
