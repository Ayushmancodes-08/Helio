# Quick Start: Video Consultations

## What's New

✓ **Real-time video streaming** between patient and doctor
✓ **Real-time control synchronization** (mute/camera state)
✓ **Role-based layout** - each side sees correct names
✓ **Visual indicators** - 🔇 for mute, 📹 for camera off
✓ **Better error handling** - graceful permission management

## How to Test

### 1. Prepare Two Devices
- Use different devices (laptop + phone, or two computers)
- Both must have internet access
- Both must be able to access your application

### 2. Patient Side (Device 1)
1. Log in as patient (Ayushman Patra)
2. Go to **Dashboard → Consultations**
3. Find appointment with Dr. Arpita Mohapatra
4. Click **"Join Call"** button
5. **Grant camera and microphone permissions** when browser asks
6. Wait for "Initializing video call..." to complete
7. You'll see:
   - Left screen: "You" (your camera)
   - Right screen: "Waiting for Arpita Mohapatra..."

### 3. Doctor Side (Device 2)
1. Log in as doctor (Arpita Mohapatra)
2. Go to **Dashboard → Appointments**
3. Find appointment with Ayushman Patra
4. Click **"Start Call"** or **"Join Call"** button
5. **Grant camera and microphone permissions** when browser asks
6. Wait for connection to establish
7. You'll see:
   - Left screen: "You" (your camera)
   - Right screen: Patient's video feed

### 4. Test Controls

**Mute Test:**
- Click microphone icon to mute
- See 🔇 indicator on your name
- Other side sees 🔇 on your name too
- Click again to unmute

**Camera Test:**
- Click camera icon to turn off
- See "Camera is off" message
- See 📹 indicator on your name
- Other side sees 📹 on your name too
- Click again to turn on

**End Call:**
- Click phone icon to end call
- Both sides disconnect
- Both return to dashboard

## Troubleshooting

### "Permission denied" Error
→ Check browser settings and allow camera/microphone access

### "Waiting for..." never resolves
→ Make sure both devices are on same network or have internet
→ Check browser console (F12) for error messages

### No video showing
→ Verify camera works in browser settings
→ Try toggling camera off/on
→ Refresh page and rejoin

### No audio
→ Verify microphone works in browser settings
→ Try toggling mute off/on
→ Check system volume

### Real-time sync not working
→ **IMPORTANT**: Test on different devices, not same device
→ Same device won't show real-time video streaming

## Console Debugging

Open browser DevTools (F12) and check Console tab. You should see:

```
✓ Video track created successfully
✓ Audio track created successfully
✓ Tracks published successfully
✓ Video call initialized successfully
Remote user joined: [uid]
Remote user published: [uid] video
User info updated: [uid] mute-audio
```

If you see errors, check the error messages for specific issues.

## Key Points

1. **Different Devices Required** - Same device won't work for real-time testing
2. **Grant Permissions** - Browser must prompt and you must allow access
3. **Real-Time Sync** - Mute/camera state updates instantly on both sides
4. **Visual Feedback** - Indicators show control states clearly
5. **Error Messages** - Check console if something doesn't work

## Files Modified

- `src/components/video-call-interface.tsx` - Enhanced UI with role-based layout
- `src/hooks/useAgoraCall.ts` - Better error handling and logging
- `src/app/dashboard/patient/video-consultation/page.tsx` - Patient side
- `src/app/dashboard/doctor/video-consultation/page.tsx` - Doctor side

## Next Steps

1. Test on different devices
2. Verify real-time video streaming
3. Test all controls (mute, camera, end call)
4. Check console for any errors
5. Adjust video quality if needed

For detailed testing guide, see `VIDEO_CONSULTATION_TESTING_GUIDE.md`
