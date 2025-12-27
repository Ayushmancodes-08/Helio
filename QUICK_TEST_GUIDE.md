# Quick Test Guide - Video Call End Call Functionality

## 5-Minute Quick Test

### Prerequisites
- Development server running: `npm run dev`
- Two browser windows/tabs ready
- Both logged in (patient in one, doctor in another)
- Agora credentials in `.env.local`

---

## Test 1: Patient Ends Call (2 minutes)

### Patient Side
1. Go to `/dashboard/patient`
2. Find an upcoming appointment
3. Click "Join Now"
4. Wait for video interface to load

### Doctor Side
1. Go to `/dashboard/doctor/appointments`
2. Find the same appointment
3. Click "Start Call"
4. Wait for video interface to load

### Both Connected
5. Verify both see each other's video
6. Patient clicks red "End Call" button
7. Check:
   - [ ] Patient page redirects to dashboard
   - [ ] Doctor sees remote video disappear
   - [ ] No console errors

---

## Test 2: Doctor Ends Call (2 minutes)

### Doctor Side
1. Go to `/dashboard/doctor/appointments`
2. Find an upcoming appointment
3. Click "Start Call"
4. Wait for video interface to load

### Patient Side
1. Go to `/dashboard/patient`
2. Find the same appointment
3. Click "Join Now"
4. Wait for video interface to load

### Both Connected
5. Verify both see each other's video
6. Doctor clicks red "End Call" button
7. Check:
   - [ ] Doctor page redirects to appointments
   - [ ] Patient sees remote video disappear
   - [ ] No console errors

---

## Test 3: Verify Database Update (1 minute)

### After Either Test
1. Open Supabase Dashboard
2. Go to `appointments` table
3. Find the appointment used in test
4. Check:
   - [ ] `status` column = "Completed"
   - [ ] `updated_at` is recent

---

## Console Check

### Open DevTools (F12)
1. Go to Console tab
2. Look for these logs when ending call:
   ```
   Audio track stopped and closed
   Video track stopped and closed
   Tracks unpublished
   Left channel
   ```
3. Check for any red error messages
   - Warnings are OK
   - Errors should not appear

---

## Success Criteria

All of these should be true:

- [ ] End call button is visible and red
- [ ] Clicking it stops the video
- [ ] Microphone and camera stop
- [ ] Page redirects to appropriate dashboard
- [ ] Remote user sees disconnect
- [ ] Appointment marked as "Completed"
- [ ] No console errors
- [ ] No hanging or frozen UI

---

## If Something Fails

### Issue: "Waiting for Doctor..." never connects
**Solution:** Check Agora credentials in `.env.local`

### Issue: End call button doesn't work
**Solution:** Check browser console for errors

### Issue: Appointment not marked as "Completed"
**Solution:** Check Supabase connection and RLS policies

### Issue: Remote user doesn't see disconnect
**Solution:** Verify `leaveCall()` is being called (check console logs)

---

## Next Steps

- ✅ All tests pass → System is ready
- ❌ Some tests fail → Check troubleshooting
- 📖 Need details → Read `VIDEO_CALL_TESTING_GUIDE.md`
- 📋 Need implementation details → Read `VIDEO_CALL_IMPLEMENTATION_SUMMARY.md`

