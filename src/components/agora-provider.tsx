'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { AgoraRTCProvider } from 'agora-rtc-react';

interface AgoraProviderProps {
    children: ReactNode;
    appId: string;
    channelName: string;
    uid?: string | number | null;
    userName?: string;
    token?: string | null;
}

export const AgoraProvider = ({
    children,
    appId,
    channelName,
    uid,
    userName,
    token
}: AgoraProviderProps) => {
    const [client] = useState<IAgoraRTCClient>(() =>
        AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    );

    useEffect(() => {
        if (!appId || !channelName) return;

        // Low bandwidth optimization: Enable low-stream fallback
        client.enableDualStream().catch(console.warn);

        return () => {
            // Cleanup on unmount
            if (client.connectionState === 'CONNECTED') {
                client.leave();
            }
        };
    }, [client, appId, channelName]);

    return (
        <AgoraRTCProvider client={client as unknown as any}>
            {children}
        </AgoraRTCProvider>
    );
};
