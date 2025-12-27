'use client';

import { useEffect, useState, useRef } from 'react';

interface UseAgoraCallProps {
  appId: string;
  channelName: string;
  token?: string | null;
  uid: string | number;
  userName?: string;
}

export function useAgoraCall({ appId, channelName, token, uid, userName }: UseAgoraCallProps) {
  const clientRef = useRef<any>(null);
  const localVideoTrackRef = useRef<any>(null);
  const localAudioTrackRef = useRef<any>(null);
  const AgoraRTCRef = useRef<any>(null);
  const subscriptionMapRef = useRef<Map<number, boolean>>(new Map());
  const cleanupRef = useRef<boolean>(false);

  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  const [remoteUserStates, setRemoteUserStates] = useState<Record<string, { audioOn: boolean; videoOn: boolean }>>({});
  const [isJoined, setIsJoined] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Agora client
  useEffect(() => {
    if (typeof window === 'undefined') return;

    cleanupRef.current = false;
    let initAborted = false;

    const initClient = async () => {
      try {
        setLoading(true);
        setError(null);

        // Import Agora dynamically
        const { default: AgoraRTCModule } = await import('agora-rtc-sdk-ng');
        AgoraRTCRef.current = AgoraRTCModule;

        if (initAborted) return;

        // Generate valid UID - ensure it's a number between 1 and 2^32-1
        let validUid: number;
        if (typeof uid === 'number') {
          validUid = Math.max(1, Math.min(uid, 4294967295));
        } else {
          const parsed = parseInt(String(uid).replace(/\D/g, ''), 10);
          validUid = isNaN(parsed) ? Math.floor(Math.random() * 1000000) + 1 : Math.max(1, Math.min(parsed, 4294967295));
        }

        console.log('🔧 Initializing Agora with UID:', validUid, 'Channel:', channelName);

        // Create client with optimized settings
        const client = AgoraRTCModule.createClient({
          mode: 'rtc',
          codec: 'vp8',
        });

        if (initAborted) return;

        clientRef.current = client;

        // Event handlers
        client.on('user-joined', (user: any) => {
          console.log('👤 Remote user joined:', user.uid);
          setRemoteUsers((prev: any[]) => {
            const exists = prev.find((u: any) => u.uid === user.uid);
            return exists ? prev : [...prev, user];
          });
        });

        client.on('user-left', (user: any) => {
          console.log('👤 Remote user left:', user.uid);
          subscriptionMapRef.current.delete(user.uid);
          setRemoteUsers((prev: any[]) => prev.filter((u: any) => u.uid !== user.uid));
        });

        client.on('user-published', async (user: any, mediaType: string) => {
          console.log('📢 Remote user published:', user.uid, 'mediaType:', mediaType);
          
          // Prevent duplicate subscriptions
          if (subscriptionMapRef.current.get(user.uid)) {
            console.log('⏭️  Already subscribed to user:', user.uid);
            return;
          }

          try {
            console.log('🔗 Subscribing to user:', user.uid, 'mediaType:', mediaType);
            await client.subscribe(user, mediaType);
            subscriptionMapRef.current.set(user.uid, true);
            console.log('✓ Successfully subscribed to', mediaType, 'from user:', user.uid);
            
            // Update remote users with the subscribed user
            setRemoteUsers((prev: any[]) => {
              const exists = prev.find((u: any) => u.uid === user.uid);
              if (exists) {
                return prev.map((u: any) => u.uid === user.uid ? user : u);
              }
              return [...prev, user];
            });
          } catch (err: any) {
            console.error('❌ Subscribe error for user', user.uid, ':', err.message);
            // Retry subscription after a delay
            setTimeout(() => {
              if (!initAborted && clientRef.current) {
                client.subscribe(user, mediaType).catch((retryErr: any) => {
                  console.error('❌ Retry subscribe failed:', retryErr.message);
                });
              }
            }, 1000);
          }
        });

        client.on('user-unpublished', (user: any, mediaType: string) => {
          console.log('📴 Remote user unpublished:', user.uid, 'mediaType:', mediaType);
          if (mediaType === 'video') {
            subscriptionMapRef.current.delete(user.uid);
          }
        });

        client.on('user-info-updated', (uid: string | number, msg: string) => {
          console.log('ℹ️  User info updated:', uid, msg);
          setRemoteUserStates((prev) => {
            const newState = { ...prev };
            if (!newState[uid]) {
              newState[uid] = { audioOn: true, videoOn: true };
            }
            if (msg === 'mute-audio') newState[uid].audioOn = false;
            else if (msg === 'unmute-audio') newState[uid].audioOn = true;
            else if (msg === 'mute-video') newState[uid].videoOn = false;
            else if (msg === 'unmute-video') newState[uid].videoOn = true;
            return newState;
          });
        });

        // Get token from server if not provided
        let tokenToUse = token;
        if (!tokenToUse) {
          console.log('🔑 Fetching token from server...');
          try {
            const response = await fetch('/api/agora/token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                channelName,
                uid: validUid,
                role: 'publisher',
              }),
            });
            
            if (!response.ok) {
              throw new Error(`Token fetch failed with status ${response.status}`);
            }
            
            const data = await response.json();
            tokenToUse = data.token;
            console.log('✓ Token fetched successfully');
          } catch (err: any) {
            console.warn('⚠️  Token fetch failed:', err.message);
            tokenToUse = null;
          }
        }

        if (initAborted) return;

        // Join channel with retry logic
        console.log('🚪 Joining channel...');
        let joinAttempts = 0;
        const maxJoinAttempts = 3;

        const attemptJoin = async (): Promise<void> => {
          try {
            joinAttempts++;
            console.log(`📍 Join attempt ${joinAttempts}/${maxJoinAttempts}`);
            await client.join(appId, channelName, tokenToUse || null, validUid);
            console.log('✓ Successfully joined channel');
          } catch (joinErr: any) {
            console.error(`❌ Join attempt ${joinAttempts} failed:`, joinErr.message);
            
            if (joinAttempts < maxJoinAttempts && !initAborted) {
              console.log(`⏳ Retrying join in 2 seconds...`);
              await new Promise(resolve => setTimeout(resolve, 2000));
              return attemptJoin();
            }
            
            throw new Error(`Failed to join channel after ${maxJoinAttempts} attempts: ${joinErr.message}`);
          }
        };

        await attemptJoin();

        if (initAborted) {
          await client.leave();
          return;
        }

        // Create video track with conservative settings for mobile
        let videoTrack: any = null;
        try {
          console.log('📹 Requesting camera access...');
          videoTrack = await AgoraRTCModule.createCameraVideoTrack({
            facingMode: 'user',
            encoderConfig: {
              width: { ideal: 960 },
              height: { ideal: 540 },
              frameRate: { ideal: 20 },
              bitrateMin: 500,
              bitrateMax: 1500,
            },
          });
          console.log('✓ Video track created successfully');
        } catch (err: any) {
          console.warn('⚠️  Camera access denied or unavailable:', err.message);
          setError(`Camera error: ${err.message}`);
        }

        // Create audio track
        let audioTrack: any = null;
        try {
          console.log('🎤 Requesting microphone access...');
          audioTrack = await AgoraRTCModule.createMicrophoneAudioTrack({
            encoderConfig: {
              opus: {
                useinbandfec: true,
                maxaveragebitrate: 32000,
                maxplaybackrate: 48000,
                stereo: false,
                usedtx: true,
              },
            },
          });
          console.log('✓ Audio track created successfully');
        } catch (err: any) {
          console.warn('⚠️  Microphone access denied or unavailable:', err.message);
          setError(`Microphone error: ${err.message}`);
        }

        // Must have at least video or audio
        if (!videoTrack && !audioTrack) {
          const errorMsg = 'Please allow camera or microphone access in your browser settings';
          console.error('❌ ' + errorMsg);
          setError(errorMsg);
          setLoading(false);
          try {
            await client.leave();
          } catch (e) {
            console.error('Error leaving channel:', e);
          }
          return;
        }

        if (initAborted) {
          videoTrack?.close();
          audioTrack?.close();
          await client.leave();
          return;
        }

        localVideoTrackRef.current = videoTrack;
        localAudioTrackRef.current = audioTrack;

        // Publish tracks
        const tracksToPublish = [videoTrack, audioTrack].filter(Boolean);
        if (tracksToPublish.length > 0) {
          console.log('📤 Publishing', tracksToPublish.length, 'track(s)...');
          try {
            await client.publish(tracksToPublish);
            console.log('✓ Tracks published successfully');
          } catch (pubErr: any) {
            console.error('❌ Publish error:', pubErr.message);
            throw new Error(`Failed to publish tracks: ${pubErr.message}`);
          }
        }

        if (initAborted) return;

        setIsJoined(true);
        setLoading(false);
        console.log('✓ Video call initialized successfully');
      } catch (err: any) {
        if (!initAborted) {
          console.error('❌ Init error:', err);
          const errorMessage = err.message || 'Connection failed. Please check your internet connection and try again.';
          setError(errorMessage);
          setLoading(false);
        }
      }
    };

    if (appId && channelName) {
      initClient();
    }

    return () => {
      initAborted = true;
      cleanupRef.current = true;
      const cleanup = async () => {
        try {
          if (localAudioTrackRef.current) {
            localAudioTrackRef.current.close();
          }
          if (localVideoTrackRef.current) {
            localVideoTrackRef.current.close();
          }
          if (clientRef.current) {
            await clientRef.current.leave();
          }
          subscriptionMapRef.current.clear();
        } catch (err) {
          console.error('Cleanup error:', err);
        }
      };
      cleanup();
    };
  }, [appId, channelName, token, uid]);

  const toggleMic = async () => {
    try {
      if (localAudioTrackRef.current) {
        await localAudioTrackRef.current.setEnabled(!isMicOn);
        setIsMicOn(!isMicOn);
      }
    } catch (err: any) {
      console.error('Toggle mic error:', err);
    }
  };

  const toggleCamera = async () => {
    try {
      if (localVideoTrackRef.current) {
        await localVideoTrackRef.current.setEnabled(!isCameraOn);
        setIsCameraOn(!isCameraOn);
      }
    } catch (err: any) {
      console.error('Toggle camera error:', err);
    }
  };

  const leaveCall = async () => {
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.close();
      }
      if (clientRef.current) {
        await clientRef.current.leave();
      }
      setIsJoined(false);
    } catch (err) {
      console.error('Leave error:', err);
    }
  };

  return {
    client: clientRef.current,
    localVideoTrack: localVideoTrackRef.current,
    localAudioTrack: localAudioTrackRef.current,
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
  };
}
