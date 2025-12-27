# Video Call Testing Guide - End Call Functionality

## Overview
This guide walks through testing the complete video consultation system with focus on the end call functionality, ensuring microphone and camera are properly released on both patient and doctor sides.

---

## Pre-Testing Checklist

- [ ] Agora credentials are set in `.env.local`:
  - `NEXT_PUBLIC_AGORA_APP_ID`
  - `AGORA_APP_CERTIFICATE`
- [ ] Database has `appointment_time` column (run `ADD_APPOINTMENT_TIME.sql` if needed)
- [ ] Two browser windows/tabs ready (one for patient, one for doctor)
- [ ] Browser permissions allow camera and microphone access
- [ ] Development server is running: `npm run dev`

---

## Test Scenario 1: Patient Initiates Call and Ends It

### Setup
1. Open browser window 1 (Patient)
2. Open browser window 2 (Doctor)
3. Both logged in with appropriate roles

### Steps

#### Patient Side
1. Navigate to `/dashboard/patient`
2. Find an upcoming appointment
3. Click "Join Now" button
4. Wait for video call interface to load
5. Verify:
   - [ ] Camera is on (you see yourself with mirror effect)
   - [ ] Microphone is on (mic button shows active state)
   - [ ] "Waiting for Doctor..." message appears

#### Doctor Side
1. Navigate to `/dashboard/doctor/appointments`
2. Find the same appointment
3. Click "Start Call" button
4. Wait for video call interface to load
5. Verify:
   - [ ] Camera is on (you see yourself)
   - [ ] Microphone is on (mic button shows active state)
   - [ ] Patient video appears in remote video area

#### Both Sides Connected
6. Verify both sides see each other's video
7. Test microphone toggle:
   - [ ] Patient clicks mic button - doctor sees patient muted
   - [ ] Doctor clicks mic button - patient sees doctor muted
8. Test camera toggle:
   - [ ] Patient clicks camera button - doctor sees "Camera is off"
   - [ ] Doctor clicks camera button - patient sees "Camera is off"

#### Patient Ends Call
9. Patient clicks red "End Call" button
10. Verify on Patient Side:
    - [ ] Page redirects to `/dashboard/patient`
    - [ ] Camera/microphone are completely stopped
    - [ ] No error messages in console
    - [ ] Appointment status shows "Completed" in dashboard

11. Verify on Doctor Side:
    - [ ] Remote video disappears
    - [ ] "Waiting for Patient..." message appears
    - [ ] Doctor can still end call on their side
    - [ ] Doctor clicks "End Call" and redirects to appointments

---

## Test Scenario 2: Doctor Initiates Call and Ends It

### Setup
Same as Scenario 1

### Steps

#### Doctor Side
1. Navigate to `/dashboard/doctor/appointments`
2. Find an upcoming appointment
3. Click "Start Call" button
4. Wait for video call interface to load

#### Patient Side
1. Navigate to `/dashboard/patient`
2. Find the same appointment
3. Click "Join Now" button
4. Wait for video call interface to load

#### Both Sides Connected
5. Verify both sides see each other's video

#### Doctor Ends Call
6. Doctor clicks red "End Call" button
7. Verify on Doctor Side:
   - [ ] Page redirects to `/dashboard/doctor/appointments`
   - [ ] Camera/microphone are completely stopped
   - [ ] No error messages in console
   - [ ] Appointment status shows "Completed"

8. Verify on Patient Side:
   - [ ] Remote video disappears
   - [ ] "Waiting for Doctor..." message appears
   - [ ] Patient can still end call on their side
   - [ ] Patient clicks "End Call" and redirects to dashboard

---

## Test Scenario 3: Rapid End Call Clicks

### Purpose
Ensure the system handles rapid clicks without errors or hanging

### Steps
1. Both sides connected and seeing each other
2. Patient rapidly clicks "End Call" button 3-4 times
3. Verify:
   - [ ] No console errors
   - [ ] Page redirects only once
   - [ ] No hanging or frozen UI
   - [ ] Appointment marked as "Completed" only once

---

## Test Scenario 4: Browser Refresh During Call

### Purpose
Ensure cleanup happens even if user refreshes page

### Steps
1. Both sides connected
2. Patient refreshes page (F5 or Ctrl+R)
3. Verify on Doctor Side:
   - [ ] Remote video disappears within 5 seconds
   - [ ] "Waiting for Patient..." message appears
   - [ ] No error messages

4. Verify on Patient Side:
   - [ ] Page reloads
   - [ ] Can rejoin the same appointment if still upcoming
   - [ ] Or redirects if appointment is completed

---

## Test Scenario 5: Network Disconnection

### Purpose
Ensure graceful handling of network issues

### Steps
1. Both sides connected
2. Disconnect internet on patient side (or use DevTools to throttle)
3. Verify on Doctor Side:
   - [ ] Remote video freezes or disappears
   - [ ] Doctor can still end call
   - [ ] No console errors

4. Reconnect internet on Patient Side
5. Verify:
   - [ ] Can rejoin if appointment still upcoming
   - [ ] Or shows error if appointment completed

---

## Console Logging Verification

### Expected Logs When Joining Call
```
Joined channel: consultation-[appointmentId]
Published local tracks
Remote user joined: [doctorUid]
Remote user published: [doctorUid] video
```

### Expected Logs When Ending Call
```
Audio track stopped and closed
Video track stopped and closed
Tracks unpublished
Left channel
```

### Check for Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Look for any red error messages
4. Expected warnings are OK, but no errors should appear

---

## Database Verification

### After Call Ends
1. Open Supabase Dashboard
2. Go to `appointments` table
3. Find the appointment used in test
4. Verify:
   - [ ] `status` column = "Completed"
   - [ ] `updated_at` timestamp is recent

---

## Microphone & Camera Release Verification

### Windows
1. Open Task Manager
2. Go to Performance tab
3. Click "Open Resource Monitor"
4. Go to Network tab
5. Before call: Note Agora process
6. During call: Agora process should be active
7. After call: Agora process should stop using resources

### macOS
1. Open Activity Monitor
2. Search for "Agora" or "Chrome"
3. Before call: Note CPU/Memory usage
4. During call: Should increase
5. After call: Should return to baseline

### Linux
```bash
# Monitor process
ps aux | grep -i agora
# Or check audio devices
pactl list sources
```

---

## Troubleshooting

### Issue: "Waiting for Doctor..." never connects
**Solution:**
- Verify Agora credentials in `.env.local`
- Check browser console for errors
- Ensure both users are in same channel name
- Try refreshing page

### Issue: Camera/Mic still on after end call
**Solution:**
- Check browser permissions
- Try revoking and re-granting camera/mic permissions
- Restart browser
- Check if other tabs have camera/mic active

### Issue: Appointment not marked as "Completed"
**Solution:**
- Check database connection
- Verify `updateAppointment` function works
- Check Supabase RLS policies
- Look for errors in console

### Issue: Remote user doesn't see disconnect
**Solution:**
- Ensure `leaveCall()` is being called
- Check Agora SDK version
- Verify channel leave is completing
- Check network connectivity

---

## Success Criteria

All of these should be true after testing:

- [ ] Patient can join call and see doctor
- [ ] Doctor can join call and see patient
- [ ] Both can toggle mic and camera
- [ ] Patient can end call and redirect properly
- [ ] Doctor can end call and redirect properly
- [ ] Remote user sees immediate disconnect
- [ ] Appointment marked as "Completed" in database
- [ ] No console errors during call
- [ ] No console errors when ending call
- [ ] Camera/microphone fully released after call
- [ ] Rapid clicks don't cause issues
- [ ] Browser refresh handled gracefully

---

## Next Steps After Testing

1. ✅ All tests pass → System is production-ready
2. ❌ Some tests fail → Check troubleshooting section
3. 🔧 Need adjustments → Update `useAgoraCall.ts` or video pages
4. 📊 Performance issues → Optimize Agora encoder config

---

## Notes

- Agora SDK handles most cleanup automatically
- `leaveCall()` function ensures explicit cleanup
- Both patient and doctor pages have identical end call logic
- Appointment status update happens after `leaveCall()` completes
- Mirror effect on local video is intentional (selfie camera)

