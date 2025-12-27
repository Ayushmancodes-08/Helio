# Video Consultation Testing Guide

## Overview
This guide helps you test the real-time video consultation system with proper permission handling and synchronized controls.

## Key Improvements Made

### 1. **Real-Time Layout Synchronization**
- **Patient Side**: Left screen = "You" (patient), Right screen = "Doctor" (Arpita Mohapatra)
- **Doctor Side**: Left screen = "You" (doctor), Right screen = "Patient" (Ayushman Patra)
- Both sides show correct names and control states in real-time

### 2. **Control State Indicators**
- 🔇 = Microphone muted
- 📹 = Camera off
- Indicators appear on both local and remote video feeds
- Updates in real-time when controls are toggled

### 3. **Improved Error Handling**
- Better permission error messages
- Graceful degradation (works with camera OR audio, not requiring both)
- Detailed console logging for debugging

## Testing Steps

### Prerequisites
1. **Two Different Devices** (IMPORTANT)
   - Same device testing won't show real-time video streaming
   - Use laptop + phone, or two different computers
   - Both must be on the same network or have internet access

2. **Browser Permissions**
   - Browser must prompt for camera/microphone access
   - User must explicitly grant permissions
   - Check browser settings if permissions are blocked

3. **Agora Credentials**
   - Verify `.env.local` has correct `NEXT_PUBLIC_AGORA_APP_ID`
   - Verify `AGORA_APP_CERTIFICATE` is set

### Test Scenario: Patient-Doctor Video Call

#### Step 1: Create an Appointment
1. Log in as patient (Ayushman Patra)
2. Go to Dashboard → Appointments
3. Create a video consultation appointment with Dr. Arpita Mohapatra
4. Note the appointment ID

#### Step 2: Patient Joins Call
1. Patient logs in on **Device 1**
2. Navigate to Dashboard → Consultations
3. Find the appointment with Dr. Arpita Mohapatra
4. Click "Join Call" button
5. **Grant camera and microphone permissions** when browser prompts
6. Wait for "Initializing video call..." to complete

**Expected Result:**
- Left screen shows "You" (patient's camera feed)
- Right screen shows "Waiting for Arpita Mohapatra..."
- Mute/Camera/End Call buttons are visible and functional

#### Step 3: Doctor Joins Call
1. Doctor logs in on **Device 2** (different device)
2. Navigate to Dashboard → Appointments
3. Find the appointment with Ayushman Patra
4. Click "Start Call" or "Join Call" button
5. **Grant camera and microphone permissions** when browser prompts
6. Wait for connection to establish

**Expected Result:**
- Doctor's left screen shows "You" (doctor's camera feed)
- Doctor's right screen shows patient's video feed
- Patient's right screen now shows doctor's video feed
- Both can see each other in real-time

#### Step 4: Test Mute Control
1. Patient clicks Mute button (microphone icon)
2. Patient's screen shows 🔇 indicator on "You" label
3. Doctor's screen shows 🔇 indicator on patient's name
4. Patient unmutes
5. Indicators disappear on both screens

**Expected Result:**
- Mute state synchronizes in real-time across both devices
- Visual indicators appear/disappear immediately

#### Step 5: Test Camera Control
1. Patient clicks Camera Off button (video icon)
2. Patient's screen shows "Camera is off" overlay
3. Patient's screen shows 📹 indicator on "You" label
4. Doctor's screen shows 📹 indicator on patient's name
5. Patient turns camera back on
6. Video feed resumes on both screens

**Expected Result:**
- Camera state synchronizes in real-time
- Visual indicators appear/disappear immediately
- Video feed shows/hides appropriately

#### Step 6: Test End Call
1. Either participant clicks End Call button (phone icon)
2. Call ends and both are redirected to their respective dashboards
3. Appointment status changes to "Completed"

**Expected Result:**
- Both participants are disconnected
- Both return to their dashboards
- No errors in console

## Troubleshooting

### Issue: "Permission denied" Error
**Solution:**
- Check browser permissions settings
- Allow camera and microphone for the application
- Try in a different browser
- Restart browser and try again

### Issue: "Waiting for..." message never resolves
**Solution:**
- Verify both devices are on same network or have internet
- Check Agora App ID in `.env.local`
- Check browser console for detailed error messages
- Ensure both are using same appointment ID

### Issue: Video feed not showing
**Solution:**
- Verify camera is working (test in browser settings)
- Check that permissions were granted
- Try toggling camera off/on
- Refresh page and rejoin

### Issue: Audio not working
**Solution:**
- Verify microphone is working (test in browser settings)
- Check that permissions were granted
- Try toggling mute off/on
- Check system volume settings

### Issue: Real-time sync not working
**Solution:**
- Ensure you're testing on **different devices**
- Same device won't show real-time video streaming
- Check network connectivity
- Verify Agora credentials are correct

## Console Logging

The system includes detailed console logging. Open browser DevTools (F12) and check Console tab for:

```
✓ Video track created successfully
✓ Audio track created successfully
✓ Tracks published successfully
✓ Video call initialized successfully
Remote user joined: [uid]
Remote user published: [uid] video
User info updated: [uid] mute-audio
```

These logs indicate successful initialization and real-time events.

## Performance Notes

- Video resolution: 640x480 at 15 FPS (optimized for bandwidth)
- Audio bitrate: 32 kbps (optimized for quality)
- Recommended bandwidth: 1 Mbps minimum per participant

## Next Steps

1. Test on different devices with explicit permission grants
2. Verify real-time video streaming works
3. Test all control synchronization (mute/camera)
4. Monitor console for any errors
5. Check network connectivity if issues occur
