# Complete Video Call Testing Guide - Patient & Doctor

## Pre-Testing Checklist

### Environment Setup
- [ ] `.env.local` has both Agora credentials
- [ ] Development server running (`npm run dev`)
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] Two different devices available (laptop + phone, or two computers)
- [ ] Both devices have internet access

### Browser Setup
- [ ] Using Chrome, Firefox, Safari, or Edge
- [ ] Browser is up to date
- [ ] No browser extensions interfering
- [ ] JavaScript enabled
- [ ] Cookies enabled

### Device Setup
- [ ] Camera working (test in browser settings)
- [ ] Microphone working (test in browser settings)
- [ ] System volume not muted
- [ ] Good lighting for video
- [ ] Stable internet connection

## Testing Scenario

### Setup: Two Devices

**Device 1 (Patient):** Laptop or Phone A
**Device 2 (Doctor):** Laptop or Phone B

Both must be on same network or have internet access.

---

## Test 1: Patient Joins Call

### Step 1: Patient Logs In (Device 1)
1. Open browser on Device 1
2. Navigate to application
3. Log in as patient (Ayushman Patra)
4. Go to Dashboard → Consultations

**Expected Result:**
- List of appointments appears
- Appointments show doctor name and time
- "Join Call" button visible

### Step 2: Patient Clicks Join Call
1. Find appointment with Dr. Arpita Mohapatra
2. Click "Join Call" button
3. Browser prompts for camera/microphone permissions
4. **IMPORTANT:** Click "Allow" for both camera and microphone

**Expected Result:**
- "Initializing video call..." message appears
- Loading spinner shows
- Console shows: "Fetching token from server..."

### Step 3: Monitor Console Logs (Device 1)
1. Open DevTools (F12)
2. Go to Console tab
3. Look for these logs:
   ```
   ✓ Video track created successfully
   ✓ Audio track created successfully
   ✓ Tracks published successfully
   ✓ Video call initialized successfully
   ```

**Expected Result:**
- All logs appear in order
- No error messages
- Video interface loads

### Step 4: Verify Patient Video Interface
1. Left screen shows "You" (patient's camera)
2. Right screen shows "Waiting for Arpita Mohapatra..."
3. Mute, Camera, and End Call buttons visible
4. All controls are clickable

**Expected Result:**
- Patient's camera feed visible on left
- Right side shows waiting message
- Controls are responsive

---

## Test 2: Doctor Joins Call

### Step 1: Doctor Logs In (Device 2)
1. Open browser on Device 2
2. Navigate to application
3. Log in as doctor (Arpita Mohapatra)
4. Go to Dashboard → Appointments

**Expected Result:**
- List of appointments appears
- Appointments show patient name and time
- "Start Call" or "Join Call" button visible

### Step 2: Doctor Clicks Join Call
1. Find appointment with Ayushman Patra
2. Click "Start Call" or "Join Call" button
3. Browser prompts for camera/microphone permissions
4. **IMPORTANT:** Click "Allow" for both camera and microphone

**Expected Result:**
- "Initializing video call..." message appears
- Loading spinner shows
- Console shows: "Fetching token from server..."

### Step 3: Monitor Console Logs (Device 2)
1. Open DevTools (F12)
2. Go to Console tab
3. Look for these logs:
   ```
   ✓ Video track created successfully
   ✓ Audio track created successfully
   ✓ Tracks published successfully
   ✓ Video call initialized successfully
   Remote user joined: [uid]
   Remote user published: [uid] video
   ```

**Expected Result:**
- All logs appear in order
- "Remote user joined" appears
- "Remote user published" appears
- No error messages

### Step 4: Verify Doctor Video Interface
1. Left screen shows "You" (doctor's camera)
2. Right screen shows patient's video feed
3. Mute, Camera, and End Call buttons visible
4. All controls are clickable

**Expected Result:**
- Doctor's camera feed visible on left
- Patient's video feed visible on right
- Controls are responsive

### Step 5: Verify Patient Side Updated
1. Check Device 1 (Patient)
2. Right screen should now show doctor's video feed
3. "Waiting for..." message should be gone
4. Doctor's name should appear on right screen

**Expected Result:**
- Patient sees doctor's video on right
- Both sides connected
- Real-time video streaming working

---

## Test 3: Control Synchronization

### Test 3.1: Mute Control

**Patient Side (Device 1):**
1. Click microphone icon to mute
2. Observe "You" label shows 🔇 indicator
3. Check console for "User info updated: mute-audio"

**Doctor Side (Device 2):**
1. Observe patient's name shows 🔇 indicator
2. Verify indicator appears immediately
3. Check console for "User info updated: mute-audio"

**Expected Result:**
- Mute indicator appears on both sides
- Appears in real-time (< 1 second)
- Console shows update event

**Patient Unmutes (Device 1):**
1. Click microphone icon again to unmute
2. Observe 🔇 indicator disappears
3. Check console for "User info updated: unmute-audio"

**Doctor Side (Device 2):**
1. Observe 🔇 indicator disappears from patient's name
2. Verify indicator disappears immediately
3. Check console for "User info updated: unmute-audio"

**Expected Result:**
- Mute indicator disappears on both sides
- Disappears in real-time (< 1 second)
- Console shows update event

### Test 3.2: Camera Control

**Patient Side (Device 1):**
1. Click camera icon to turn off
2. Observe "Camera is off" message on left screen
3. Observe 📹 indicator on "You" label
4. Check console for "User info updated: mute-video"

**Doctor Side (Device 2):**
1. Observe patient's video disappears
2. Observe 📹 indicator on patient's name
3. Verify changes appear immediately
4. Check console for "User info updated: mute-video"

**Expected Result:**
- Camera off state syncs in real-time
- Visual indicators appear on both sides
- Console shows update event

**Patient Turns Camera On (Device 1):**
1. Click camera icon again to turn on
2. Observe camera feed resumes on left screen
3. Observe 📹 indicator disappears
4. Check console for "User info updated: unmute-video"

**Doctor Side (Device 2):**
1. Observe patient's video feed resumes
2. Observe 📹 indicator disappears
3. Verify changes appear immediately
4. Check console for "User info updated: unmute-video"

**Expected Result:**
- Camera on state syncs in real-time
- Video feed resumes on both sides
- Console shows update event

### Test 3.3: Doctor Controls

**Doctor Side (Device 2):**
1. Click microphone icon to mute
2. Observe "You" label shows 🔇 indicator
3. Check console for "User info updated: mute-audio"

**Patient Side (Device 1):**
1. Observe doctor's name shows 🔇 indicator
2. Verify indicator appears immediately
3. Check console for "User info updated: mute-audio"

**Expected Result:**
- Doctor's mute state syncs to patient
- Indicator appears in real-time
- Console shows update event

---

## Test 4: End Call

### Step 1: Patient Ends Call (Device 1)
1. Click red phone icon (End Call button)
2. Observe call ends
3. Redirected to patient dashboard

**Expected Result:**
- Call ends immediately
- Both sides disconnect
- Patient returns to dashboard

### Step 2: Verify Doctor Side (Device 2)
1. Observe call ends on doctor side too
2. Doctor is redirected to appointments page
3. Appointment status changes to "Completed"

**Expected Result:**
- Both sides disconnect simultaneously
- Both return to respective dashboards
- Appointment marked as completed

---

## Test 5: Error Handling

### Test 5.1: Permission Denied

**Scenario:** User denies camera/microphone permissions

1. Click "Join Call"
2. When browser prompts, click "Block" or "Deny"
3. Observe error message appears

**Expected Result:**
- Error message: "Please allow camera or microphone access..."
- Retry button appears after 3 seconds
- Console shows permission error

### Test 5.2: Network Failure

**Scenario:** Internet connection drops

1. During call, disconnect internet
2. Observe connection error appears
3. Reconnect internet
4. Click "Retry Connection" button

**Expected Result:**
- Error message appears
- Retry button available
- Can reconnect after internet restored

### Test 5.3: Token Fetch Failure

**Scenario:** Token endpoint not responding

1. Check console for token fetch errors
2. System should fall back to null token
3. Call should still work (if Agora allows)

**Expected Result:**
- Console shows token fetch attempt
- Fallback to null token
- Call continues or shows appropriate error

---

## Console Logs Checklist

### Patient Side Expected Logs
```
✓ Video track created successfully
✓ Audio track created successfully
✓ Tracks published successfully
✓ Video call initialized successfully
Remote user joined: [doctor-uid]
Remote user published: [doctor-uid] video
User info updated: [doctor-uid] mute-audio
User info updated: [doctor-uid] unmute-audio
User info updated: [doctor-uid] mute-video
User info updated: [doctor-uid] unmute-video
```

### Doctor Side Expected Logs
```
✓ Video track created successfully
✓ Audio track created successfully
✓ Tracks published successfully
✓ Video call initialized successfully
Remote user joined: [patient-uid]
Remote user published: [patient-uid] video
User info updated: [patient-uid] mute-audio
User info updated: [patient-uid] unmute-audio
User info updated: [patient-uid] mute-video
User info updated: [patient-uid] unmute-video
```

---

## Performance Metrics

### Expected Performance
- Token fetch: ~100-200ms
- Channel join: ~500-1000ms
- Total connection time: ~1-2 seconds
- Real-time sync latency: <100ms
- Video quality: 640x480 at 15 FPS
- Audio quality: 32 kbps

### Network Requirements
- Minimum bandwidth: 1 Mbps per participant
- Recommended bandwidth: 2-5 Mbps
- Stable connection required
- WiFi or wired internet

---

## Troubleshooting During Testing

### If Patient Can't Join
1. Check `.env.local` credentials
2. Restart development server
3. Clear browser cache
4. Check console for errors
5. Try in incognito mode

### If Doctor Can't Join
1. Verify same appointment ID
2. Check network connectivity
3. Verify Agora credentials
4. Check console for errors
5. Try retry button

### If Video Not Showing
1. Check camera permissions
2. Test camera in browser settings
3. Toggle camera off/on
4. Try different browser
5. Check console logs

### If Audio Not Working
1. Check microphone permissions
2. Test microphone in browser settings
3. Toggle mute off/on
4. Check system volume
5. Check console logs

### If Real-Time Sync Not Working
1. Verify testing on different devices
2. Check network stability
3. Check console for update events
4. Verify both sides connected
5. Try refreshing page

---

## Test Results Template

```
Test Date: _______________
Patient Device: _______________
Doctor Device: _______________
Network: _______________

Test 1: Patient Joins Call
- [ ] Appointment list loads
- [ ] Join Call button works
- [ ] Permissions granted
- [ ] Video interface loads
- [ ] Console logs correct

Test 2: Doctor Joins Call
- [ ] Appointment list loads
- [ ] Join Call button works
- [ ] Permissions granted
- [ ] Video interface loads
- [ ] Console logs correct
- [ ] Patient sees doctor video

Test 3: Control Synchronization
- [ ] Mute syncs in real-time
- [ ] Camera syncs in real-time
- [ ] Indicators appear/disappear
- [ ] Console shows update events

Test 4: End Call
- [ ] Call ends immediately
- [ ] Both sides disconnect
- [ ] Both return to dashboard
- [ ] Appointment marked completed

Test 5: Error Handling
- [ ] Permission errors handled
- [ ] Network errors handled
- [ ] Retry button works

Overall Status: _______________
Issues Found: _______________
```

---

## Success Criteria

✓ All tests pass
✓ No console errors
✓ Real-time video/audio working
✓ Real-time control sync working
✓ Error handling working
✓ Both sides can end call
✓ Appointment marked completed

---

**Status:** ✓ Ready for comprehensive testing
**Last Updated:** December 25, 2025
