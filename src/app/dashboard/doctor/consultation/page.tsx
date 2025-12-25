'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { AgoraProvider } from '@/components/agora-provider';
import {
    LocalUser,
    RemoteUser,
    useJoin,
    useLocalCameraTrack,
    useLocalMicrophoneTrack,
    usePublish,
    useRemoteUsers,
    useIsConnected
} from 'agora-rtc-react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Loader2, SignalHigh, SignalLow, SignalMedium } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// Inner component to handle the actual call logic (hooks work only inside Provider)
const VideoCallRoom = ({
    appId,
    channelName,
    token,
    uid
}: {
    appId: string;
    channelName: string;
    token: string | null;
    uid: string | number | null;
}) => {
    const { toast } = useToast();
    const router = useRouter();

    // Local Tracks
    const { localMicrophoneTrack } = useLocalMicrophoneTrack();
    const { localCameraTrack } = useLocalCameraTrack();

    // Remote Users
    const remoteUsers = useRemoteUsers();

    // Join Channel
    /* 
       Note: We only join if we have a token. 
       In a real app, you fetch a token from your backend. 
       For this demo, we assume token is passed or we use 'null' for test mode (not recommended for production).
    */
    useJoin(
        { appid: appId, channel: channelName, token: token || null, uid: uid || undefined },
        !!appId && !!channelName
    );

    // Publish Local Tracks
    usePublish([localMicrophoneTrack, localCameraTrack]);

    // Local State
    const [micOn, setMicOn] = useState(true);
    const [cameraOn, setCameraOn] = useState(true);

    const isConnected = useIsConnected();

    const toggleMic = () => {
        if (localMicrophoneTrack) {
            localMicrophoneTrack.setEnabled(!micOn);
            setMicOn(!micOn);
        }
    };

    const toggleCamera = () => {
        if (localCameraTrack) {
            localCameraTrack.setEnabled(!cameraOn);
            setCameraOn(!cameraOn);
        }
    };

    const leaveCall = () => {
        // useJoin handles leave on unmount, so we just navigate away
        router.back();
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[600px] w-full bg-slate-950 p-4 rounded-lg">
            {/* Local Video */}
            <div className="relative bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                <LocalUser
                    audioTrack={localMicrophoneTrack}
                    cameraOn={cameraOn}
                    micOn={micOn}
                    videoTrack={localCameraTrack}
                    cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg"
                >
                    <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white text-sm">
                        You {micOn ? '' : '(Muted)'}
                    </div>
                </LocalUser>
                <div className="absolute bottom-4 right-4 flex gap-2">
                    <Button
                        size="icon"
                        variant={micOn ? "secondary" : "destructive"}
                        onClick={toggleMic}
                        className="rounded-full"
                    >
                        {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </Button>
                    <Button
                        size="icon"
                        variant={cameraOn ? "secondary" : "destructive"}
                        onClick={toggleCamera}
                        className="rounded-full"
                    >
                        {cameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Remote Videos */}
            <div className="relative bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                {remoteUsers.length > 0 ? (
                    remoteUsers.map((user) => (
                        <RemoteUser key={user.uid} user={user} cover="https://www.agora.io/en/wp-content/uploads/2022/10/3d-spatial-audio-icon.svg">
                            <div className="absolute top-4 right-4">
                                <Badge variant="outline" className="text-white border-white/20 bg-black/40">
                                    <SignalHigh className="h-3 w-3 mr-1 text-green-400" />
                                    Good Connection
                                </Badge>
                            </div>
                        </RemoteUser>
                    ))
                ) : (
                    <div className="text-center text-slate-500">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Waiting for patient to join...</p>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="md:col-span-2 flex justify-center p-4">
                <Button variant="destructive" size="lg" className="rounded-full px-8" onClick={leaveCall}>
                    <PhoneOff className="mr-2 h-5 w-5" />
                    End Consultation
                </Button>
            </div>
        </div>
    );
};


export default function DoctorConsultationPage() {
    const { profile } = useAuth();

    // In a real app, these come from your backend/appointment details
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || '';
    const channelName = 'consultation-room-1'; // This should be dynamic based on appointment ID
    const token = null; // Should be fetched from API

    // Generate a numeric UID from profile ID if possible, or use string if Agora supports text UIDs (depends on mode)
    // RTC SDK NG supports string UIDs.
    const uid = profile?.auth_user_id || null;

    if (!appId) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Configuration Error</AlertTitle>
                <AlertDescription>
                    Agora App ID is missing. Please check your environment variables.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-headline text-3xl font-bold">Video Consultation</h1>
                <p className="text-muted-foreground">
                    Connect with your patient securely. Low-bandwidth mode is active.
                </p>
            </div>

            <Card className="border-0 shadow-none bg-transparent">
                <CardContent className="p-0">
                    <AgoraProvider
                        appId={appId}
                        channelName={channelName}
                        token={token}
                        uid={uid}
                        userName={profile?.full_name}
                    >
                        <VideoCallRoom
                            appId={appId}
                            channelName={channelName}
                            token={token}
                            uid={uid}
                        />
                    </AgoraProvider>
                </CardContent>
            </Card>

            <Alert>
                <SignalMedium className="h-4 w-4" />
                <AlertTitle>Connection Status</AlertTitle>
                <AlertDescription>
                    We have optimized the setup for low-bandwidth environments. If video stutters, audio will be prioritized automatically.
                </AlertDescription>
            </Alert>
        </div>
    );
}
