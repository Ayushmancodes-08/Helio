# Video Call Issues - Fixes Applied

## Issues Reported

1. **ERR_REJOIN_TOKEN_INVALID** - Token becoming invalid on rejoin attempts
2. **Both sides showing same video** - Remote video not displaying correctly
3. **Doctor side lagging** - Slow video loading on doctor dashboard

## Root Causes Identified

### Issue 1: Token Expiration on Rejoin
- **Cause**: Token expiration time was too short (1 hour), causing rejoin failures
- **Fix**: Increased token expiration to 2 hours (7200 seconds)
- **File**: `src/app/api/agora/token/route.ts`

### Issue 2: Remote Video Not Displaying
- **Cause**: Remote video track not being properly subscribed or the subscription wasn't updating the UI
- **Fix**: 
  - Improved `user-published` event handler to properly update remote users state
  - Added better logging to track subscription status
  - Enhanced remote video rendering with fallback states
- **Files**: 
  - `src/hooks/useAgoraCall.ts`
  - `src/components/video-call-interface.tsx`

### Issue 3: UID Generation Issues
- **Cause**: UID was being generated as string or invalid number, causing Agora SDK issues
- **Fix**: 
  - Ensure UID is always a valid number between 0 and 4294967295
  - Added proper validation in token generation endpoint
  - Improved UID parsing logic
- **Files**: 
  - `src/hooks/useAgoraCall.ts`
  - `src/app/api/agora/token/route.ts`

### Issue 4: Video Quality/Lagging
- **Cause**: Low bitrate and frame rate settings causing poor quality
- **Fix**: 
  - Increased video resolution from 640x480 to 1280x720
  - Increased frame rate from 15fps to 24fps
  - Increased bitrate from 400-800 to 600-2500 kbps
- **File**: `src/hooks/useAgoraCall.ts`

## Changes Made

### 1. `src/hooks/useAgoraCall.ts`
- **UID Generation**: Improved to ensure valid number between 0 and 4294967295
- **Video Quality**: Enhanced encoder config with better resolution and bitrate
- **Subscription Handling**: Better logging and state updates when remote users publish media
- **Error Handling**: More detailed console logging for debugging

### 2. `src/app/api/agora/token/route.ts`
- **Token Expiration**: Increased from 1 hour to 2 hours
- **UID Validation**: Added validation to ensure UID is within valid range
- **Error Logging**: Enhanced logging for debugging token generation issues

### 3. `src/components/video-call-interface.tsx`
- **Remote Video Logging**: Added detailed logging to track video track availability
- **Fallback States**: Better handling when remote video track is not yet available

## Testing Recommendations

### Test Scenario 1: Basic Connection
1. Doctor logs in and joins video call
2. Patient logs in and joins same video call
3. Verify:
   - Doctor sees patient video on right side
   - Patient sees doctor video on right side
   - Both see "You" label on left side

### Test Scenario 2: Waiting State
1. Doctor joins first
2. Verify doctor sees "Waiting for [patient_name]..." message
3. Patient joins
4. Verify doctor now sees patient video
5. Verify patient sees "Waiting for Dr. [doctor_name]..." initially, then doctor video

### Test Scenario 3: Controls
1. Both users in call
2. Test mute/unmute - verify 🔇 indicator appears/disappears
3. Test camera on/off - verify 📹 indicator appears/disappears
4. Verify indicators sync in real-time

### Test Scenario 4: Rejoin
1. Both users in call
2. Refresh page (simulates disconnect/rejoin)
3. Verify no "ERR_REJOIN_TOKEN_INVALID" error
4. Verify video reconnects properly

### Test Scenario 5: Network Quality
1. Both users in call
2. Verify video quality is clear (not lagging)
3. Verify audio is clear
4. Test on different network speeds if possible

## Console Logging

The system now includes detailed console logging with visual indicators:
- ✓ = Success
- ⚠ = Warning
- ✗ = Error

Check browser console (F12) for detailed debugging information.

## Environment Variables

Ensure these are set in `.env.local`:
```
NEXT_PUBLIC_AGORA_APP_ID=c3ceb71fabed47ff8da856af62ea9add
AGORA_APP_CERTIFICATE=7fcb9bf598754a559a1ba7f57ff711de
```

## Next Steps if Issues Persist

1. **Check browser console** for detailed error messages
2. **Verify camera/microphone permissions** are granted
3. **Check network connectivity** - ensure both users have stable internet
4. **Clear browser cache** - Ctrl+Shift+Delete
5. **Try in incognito mode** to rule out browser extensions
6. **Check Agora dashboard** for any account/quota issues

## Performance Optimization Notes

- Video resolution increased to 1280x720 for better quality
- Frame rate set to 24fps for smooth video
- Bitrate range 600-2500 kbps adapts to network conditions
- Token expiration extended to 2 hours to prevent rejoin issues
- Improved subscription handling for faster remote video display
