# Quick Video Call Testing Checklist

## Pre-Test Setup
- [ ] Both users have stable internet connection
- [ ] Camera and microphone permissions are granted in browser
- [ ] Browser console is open (F12) to monitor for errors
- [ ] Using two different devices or browsers (not same device)

## Test 1: Doctor Joins First
- [ ] Doctor navigates to video consultation page
- [ ] Doctor sees "Initializing video call..." loading state
- [ ] Doctor sees "Waiting for [patient_name]..." message with patient avatar (👤)
- [ ] Doctor's own video appears on left side labeled "You"
- [ ] No errors in console

## Test 2: Patient Joins
- [ ] Patient navigates to video consultation page
- [ ] Patient sees "Initializing video call..." loading state
- [ ] Patient sees "Waiting for Dr. [doctor_name]..." message with doctor avatar (👨‍⚕️)
- [ ] Patient's own video appears on left side labeled "You"
- [ ] Doctor's waiting state disappears and shows patient video on right side
- [ ] Patient's waiting state disappears and shows doctor video on right side
- [ ] No errors in console

## Test 3: Video Quality
- [ ] Doctor video is clear and not lagging
- [ ] Patient video is clear and not lagging
- [ ] Both videos update in real-time
- [ ] No "ERR_REJOIN_TOKEN_INVALID" errors in console

## Test 4: Audio Controls
- [ ] Click mute button on doctor side
- [ ] Verify 🔇 indicator appears on doctor's video (left side)
- [ ] Verify 🔇 indicator appears on doctor's video on patient's screen (right side)
- [ ] Click unmute button
- [ ] Verify 🔇 indicator disappears on both sides
- [ ] Repeat for patient side

## Test 5: Camera Controls
- [ ] Click camera off button on doctor side
- [ ] Verify 📹 indicator appears on doctor's video (left side)
- [ ] Verify 📹 indicator appears on doctor's video on patient's screen (right side)
- [ ] Verify "Camera is off" message appears on doctor's video
- [ ] Click camera on button
- [ ] Verify 📹 indicator disappears and video resumes
- [ ] Repeat for patient side

## Test 6: End Call
- [ ] Click "End Call" button on doctor side
- [ ] Verify doctor is redirected to appointments page
- [ ] Verify appointment status is marked as "Completed"
- [ ] Repeat for patient side

## Test 7: Rejoin Scenario
- [ ] Both users in active call
- [ ] Refresh page on doctor side (F5)
- [ ] Verify no "ERR_REJOIN_TOKEN_INVALID" error
- [ ] Verify doctor reconnects to call
- [ ] Verify patient still sees doctor video
- [ ] Repeat for patient side

## Test 8: Network Interruption
- [ ] Both users in active call
- [ ] Simulate network interruption (disable WiFi/network)
- [ ] Wait 5-10 seconds
- [ ] Restore network connection
- [ ] Verify automatic reconnection
- [ ] Verify video resumes without manual intervention

## Console Checks
- [ ] No red error messages (✗)
- [ ] Check for ✓ indicators showing successful operations
- [ ] Check for ⚠ warnings (should be minimal)
- [ ] Look for "Successfully joined channel" message
- [ ] Look for "Tracks published successfully" message
- [ ] Look for "Remote video playing" message

## Common Issues & Solutions

### Issue: Both sides showing same video
- **Solution**: Refresh page and rejoin. Check console for subscription errors.

### Issue: Remote video not appearing
- **Solution**: 
  1. Check browser console for errors
  2. Verify camera permissions are granted
  3. Refresh page
  4. Try in incognito mode

### Issue: ERR_REJOIN_TOKEN_INVALID
- **Solution**: This should be fixed. If still occurring:
  1. Clear browser cache
  2. Check that AGORA_APP_CERTIFICATE is set correctly in .env.local
  3. Restart development server

### Issue: Video lagging
- **Solution**:
  1. Check internet connection speed
  2. Close other bandwidth-heavy applications
  3. Try reducing video quality (if option available)
  4. Check Agora dashboard for any issues

### Issue: No audio/video
- **Solution**:
  1. Check browser permissions (Settings > Privacy > Camera/Microphone)
  2. Verify device is not muted
  3. Check if another app is using camera/microphone
  4. Restart browser

## Success Criteria
- ✅ Both users can see each other's video
- ✅ Audio works in both directions
- ✅ Mute/camera controls sync in real-time
- ✅ No token errors on rejoin
- ✅ Video quality is clear (not lagging)
- ✅ Waiting state shows correctly before other user joins
- ✅ End call properly marks appointment as completed
