import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { channelName, uid, role = 'publisher' } = await request.json();

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      console.error('Agora credentials not configured');
      return NextResponse.json(
        { error: 'Agora credentials not configured' },
        { status: 500 }
      );
    }

    // Validate UID
    if (typeof uid !== 'number' || uid < 0 || uid > 4294967295) {
      console.error('Invalid UID:', uid);
      return NextResponse.json(
        { error: 'Invalid UID. Must be a number between 0 and 4294967295' },
        { status: 400 }
      );
    }

    // Generate token using Agora access token
    try {
      const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
      
      // Use longer expiration time (2 hours) to prevent rejoin token issues
      const expirationTimeInSeconds = 7200; // 2 hours
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      const token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        uid,
        role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER,
        privilegeExpiredTs
      );

      console.log('✓ Token generated for channel:', channelName, 'UID:', uid, 'Expires in:', expirationTimeInSeconds, 'seconds');

      return NextResponse.json({
        token,
        appId,
        channelName,
        uid,
        expiresIn: expirationTimeInSeconds,
      });
    } catch (err) {
      console.error('Token builder error:', err);
      // Fallback: return null token for development
      return NextResponse.json({
        token: null,
        appId,
        channelName,
        uid,
        warning: 'Token generation failed, using null token',
      });
    }
  } catch (error) {
    console.error('Error generating Agora token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
