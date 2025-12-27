# End Call Code Flow - Detailed Walkthrough

## Complete Flow Diagram

```
User clicks "End Call" button
    ↓
VideoCallInterface.onEndCall() triggered
    ↓
Patient/Doctor Page: handleEndCall() called
    ↓
    ├─→ setIsEndingCall(true)
    │
    ├─→ leaveCall() from useAgoraCall hook
    │   ├─→ localAudioTrackRef.current.setEnabled(false)
    │   ├─→ localAudioTrackRef.current.close()
    │   ├─→ localVideoTrackRef.current.setEnabled(false)
    │   ├─→ localVideoTrackRef.current.close()
    │   ├─→ clientRef.current.unpublish([...])
    │   ├─→ clientRef.current.leave()
    │   ├─→ setIsJoined(false)
    │   ├─→ setIsMicOn(false)
    │   └─→ setIsCameraOn(false)
    │
    ├─→ updateAppointment(appointmentId, { status: 'Completed' })
    │   ├─→ supabase.from('appointments').update(...)
    │   ├─→ fetchAppointments() [refresh list]
    │   └─→ return data
    │
    ├─→ router.push('/dashboard/patient' or '/dashboard/doctor/appointments')
    │
    └─→ setIsEndingCall(false)
```

---

## Step-by-Step Code Execution

### Step 1: User Clicks End Call Button

**File:** `src/components/video-call-interface.tsx`

```typescript
<Button
  size="icon"
  variant="destructive"
  onClick={onEndCall}  // ← Calls handleEndCall from parent
  className="rounded-full h-12 w-12"
>
  <PhoneOff className="h-5 w-5" />
</Button>
```

**What Happens:**
- Button click event fires
- `onEndCall` prop is called
- This is `handleEndCall` from the page component

---

### Step 2: Handle End Call (Patient Side)

**File:** `src/app/dashboard/patient/video-consultation/page.tsx`

```typescript
const handleEndCall = async () => {
  try {
    setIsEndingCall(true);  // ← Disable button to prevent double-clicks
    
    await leaveCall();      // ← Stop all tracks (see Step 3)
    
    if (appointmentId) {
      await updateAppointment(appointmentId, { status: 'Completed' });
      // ↑ Update database (see Step 4)
    }
    
    router.push('/dashboard/patient');  // ← Redirect to dashboard
  } catch (err) {
    console.error('Error ending call:', err);
  } finally {
    setIsEndingCall(false);
  }
};
```

**What Happens:**
1. Set `isEndingCall` to true (prevents rapid clicks)
2. Call `leaveCall()` to stop all media tracks
3. Update appointment status to "Completed"
4. Redirect to patient dashboard
5. Set `isEndingCall` to false

---

### Step 3: Leave Call (Stop All Tracks)

**File:** `src/hooks/useAgoraCall.ts`

```typescript
const leaveCall = async () => {
  try {
    // Stop and close audio track
    if (localAudioTrackRef.current) {
      try {
        await localAudioTrackRef.current.setEnabled(false);
        // ↑ Disable microphone input
        
        localAudioTrackRef.current.close();
        // ↑ Release microphone hardware
        
        console.log('Audio track stopped and closed');
      } catch (err) {
        console.error('Error closing audio track:', err);
      }
    }

    // Stop and close video track
    if (localVideoTrackRef.current) {
      try {
        await localVideoTrackRef.current.setEnabled(false);
        // ↑ Disable camera input
        
        localVideoTrackRef.current.close();
        // ↑ Release camera hardware
        
        console.log('Video track stopped and closed');
      } catch (err) {
        console.error('Error closing video track:', err);
      }
    }

    // Unpublish and leave channel
    if (clientRef.current) {
      try {
        // Unpublish tracks first
        if (localAudioTrackRef.current || localVideoTrackRef.current) {
          await clientRef.current.unpublish([
            localAudioTrackRef.current,
            localVideoTrackRef.current
          ]);
          // ↑ Remove tracks from channel
          
          console.log('Tracks unpublished');
        }

        // Leave the channel
        await clientRef.current.leave();
        // ↑ Disconnect from Agora channel
        
        console.log('Left channel');
      } catch (err) {
        console.error('Error leaving channel:', err);
      }
    }

    // Update state
    setIsJoined(false);
    setIsMicOn(false);
    setIsCameraOn(false);
    // ↑ Mark call as ended
  } catch (err) {
    console.error('Error leaving call:', err);
    setIsJoined(false);
  }
};
```

**What Happens:**
1. **Audio Track:**
   - `setEnabled(false)` - Stops microphone input
   - `close()` - Releases microphone hardware
   - Logs success or error

2. **Video Track:**
   - `setEnabled(false)` - Stops camera input
   - `close()` - Releases camera hardware
   - Logs success or error

3. **Channel:**
   - `unpublish()` - Removes tracks from channel
   - `leave()` - Disconnects from Agora
   - Logs success or error

4. **State:**
   - `isJoined = false` - Marks call as ended
   - `isMicOn = false` - Updates UI
   - `isCameraOn = false` - Updates UI

**Result:** All media resources are released

---

### Step 4: Update Appointment Status

**File:** `src/hooks/useAppointments.ts`

```typescript
const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
  setLoading(true);
  setError(null);

  try {
    const { data, error: updateError } = await supabase
      .from('appointments')
      .update(updates)  // ← { status: 'Completed' }
      .eq('id', id)     // ← Match appointment ID
      .select()
      .single();

    if (updateError) throw updateError;

    await fetchAppointments();  // ← Refresh appointment list
    return data;
  } catch (err: any) {
    setError(err.message);
    console.error('Error updating appointment:', err);
    return null;
  } finally {
    setLoading(false);
  }
};
```

**What Happens:**
1. Set loading state
2. Update appointment in database:
   - Find appointment by ID
   - Set status to "Completed"
   - Get updated record
3. Refresh appointment list
4. Return updated data
5. Handle errors if any

**Database Change:**
```sql
UPDATE appointments 
SET status = 'Completed', updated_at = NOW()
WHERE id = '[appointmentId]';
```

---

### Step 5: Redirect to Dashboard

**File:** `src/app/dashboard/patient/video-consultation/page.tsx`

```typescript
router.push('/dashboard/patient');
// ↑ Redirect to patient dashboard
```

**What Happens:**
1. Next.js router navigates to new page
2. Page component unmounts
3. useEffect cleanup runs (if any)
4. User sees patient dashboard

---

## What Happens on Remote Side

### When Patient Ends Call (Doctor's Perspective)

```
Patient clicks "End Call"
    ↓
Patient's leaveCall() unpublishes tracks
    ↓
Agora detects patient left channel
    ↓
Doctor's client receives "user-unpublished" event
    ↓
Doctor's remoteUsers state updates
    ↓
Remote video disappears from UI
    ↓
Doctor sees "Waiting for Patient..." message
```

**Code in Doctor's Page:**
```typescript
client.on('user-unpublished', (user, mediaType) => {
  console.log('Remote user unpublished:', user.uid, mediaType);
  // ↑ This fires when patient leaves
});
```

---

## Error Handling

### If Audio Track Close Fails

```typescript
if (localAudioTrackRef.current) {
  try {
    await localAudioTrackRef.current.setEnabled(false);
    localAudioTrackRef.current.close();
  } catch (err) {
    console.error('Error closing audio track:', err);
    // ↑ Logs error but continues
  }
}
```

**Result:** Continues to close video track and leave channel

### If Channel Leave Fails

```typescript
if (clientRef.current) {
  try {
    await clientRef.current.leave();
  } catch (err) {
    console.error('Error leaving channel:', err);
    // ↑ Logs error but continues
  }
}
```

**Result:** Still sets state flags to false and redirects

### If Appointment Update Fails

```typescript
try {
  const { data, error: updateError } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (updateError) throw updateError;
} catch (err: any) {
  setError(err.message);
  console.error('Error updating appointment:', err);
  // ↑ Logs error but doesn't block redirect
}
```

**Result:** User still redirected even if database update fails

---

## State Changes During End Call

### Before End Call
```typescript
{
  isJoined: true,
  isMicOn: true,
  isCameraOn: true,
  remoteUsers: [{ uid: 123, videoTrack: {...} }],
  error: null,
  loading: false,
}
```

### After End Call
```typescript
{
  isJoined: false,
  isMicOn: false,
  isCameraOn: false,
  remoteUsers: [],  // ← Cleared when channel left
  error: null,
  loading: false,
}
```

---

## Console Output During End Call

### Expected Logs (In Order)

```
Audio track stopped and closed
Video track stopped and closed
Tracks unpublished
Left channel
```

### If Everything Works

```
✓ Audio track stopped and closed
✓ Video track stopped and closed
✓ Tracks unpublished
✓ Left channel
✓ Appointment updated: { status: 'Completed' }
✓ Redirecting to /dashboard/patient
```

### If There's an Error

```
✓ Audio track stopped and closed
✓ Video track stopped and closed
✗ Error leaving channel: Network error
✓ State flags set to false
✓ Redirecting to /dashboard/patient
```

---

## Timing

### Typical End Call Sequence

```
T+0ms:   User clicks "End Call"
T+10ms:  handleEndCall() starts
T+20ms:  Audio track disabled
T+30ms:  Audio track closed
T+40ms:  Video track disabled
T+50ms:  Video track closed
T+100ms: Tracks unpublished
T+150ms: Channel left
T+200ms: Appointment update starts
T+300ms: Appointment updated in database
T+350ms: Router.push() called
T+400ms: Page redirect begins
T+500ms: New page loaded
```

**Total Time:** ~500ms from click to redirect

---

## Testing Checklist

- [ ] Audio track logs appear
- [ ] Video track logs appear
- [ ] Unpublish log appears
- [ ] Leave channel log appears
- [ ] No error logs appear
- [ ] Redirect happens
- [ ] Appointment status is "Completed"
- [ ] Remote user sees disconnect

---

## Summary

The end call flow is:

1. **User clicks button** → `handleEndCall()` triggered
2. **Stop tracks** → `leaveCall()` disables and closes all media
3. **Update database** → Appointment marked as "Completed"
4. **Redirect** → User sent to appropriate dashboard
5. **Remote user** → Sees disconnect and "Waiting..." message

All steps include error handling and logging for debugging.

