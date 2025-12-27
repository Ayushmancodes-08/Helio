# Video Call Implementation Summary

## System Architecture

```
Patient Dashboard
    ↓
    └─→ Appointment Card with "Join Now" button
        ↓
        └─→ /dashboard/patient/video-consultation?appointmentId=[id]
            ↓
            └─→ useAgoraCall hook (initializes Agora client)
                ↓
                └─→ VideoCallInterface component (renders video UI)
                    ↓
                    └─→ End Call → Updates appointment status → Redirects

Doctor Dashboard
    ↓
    └─→ Appointments page with "Start Call" button
        ↓
        └─→ /dashboard/doctor/video-consultation?appointmentId=[id]
            ↓
            └─→ useAgoraCall hook (initializes Agora client)
                ↓
                └─→ VideoCallInterface component (renders video UI)
                    ↓
                    └─→ End Call → Updates appointment status → Redirects
```

---

## Key Components

### 1. useAgoraCall Hook (`src/hooks/useAgoraCall.ts`)

**Purpose:** Manages Agora SDK initialization, track management, and call lifecycle

**Key Features:**
- Low-bandwidth optimization (640x480, 15fps, 400-800kbps)
- Automatic track creation (video + audio)
- Remote user subscription
- Comprehensive cleanup on unmount

**State Management:**
```typescript
{
  client: IAgoraRTCClient | null,
  localVideoTrack: ICameraVideoTrack | null,
  localAudioTrack: IMicrophoneAudioTrack | null,
  remoteUsers: IAgoraRTCRemoteUser[],
  isJoined: boolean,
  isMicOn: boolean,
  isCameraOn: boolean,
  error: string | null,
  loading: boolean,
}
```

**Methods:**
- `toggleMic()` - Enable/disable microphone
- `toggleCamera()` - Enable/disable camera
- `leaveCall()` - Stop all tracks and leave channel

**Cleanup Logic:**
```
1. Disable audio track
2. Close audio track
3. Disable video track
4. Close video track
5. Unpublish tracks from channel
6. Leave channel
7. Set state flags to false
```

### 2. VideoCallInterface Component (`src/components/video-call-interface.tsx`)

**Purpose:** Renders video UI with controls

**Features:**
- Local video with mirror effect (selfie camera)
- Remote video display
- Mic/Camera/End Call buttons
- Status indicators
- Loading state

**Props:**
```typescript
{
  client: IAgoraRTCClient | null,
  localVideoTrack: ICameraVideoTrack | null,
  localAudioTrack: IMicrophoneAudioTrack | null,
  remoteUsers: IAgoraRTCRemoteUser[],
  isMicOn: boolean,
  isCameraOn: boolean,
  patientName: string,
  doctorName: string,
  onToggleMic: () => void,
  onToggleCamera: () => void,
  onEndCall: () => void,
  isLoading: boolean,
}
```

### 3. Patient Video Consultation Page (`src/app/dashboard/patient/video-consultation/page.tsx`)

**Purpose:** Patient-side video call interface

**Flow:**
1. Get appointment ID from URL params
2. Initialize Agora call with channel name: `consultation-[appointmentId]`
3. Render video interface
4. On end call:
   - Call `leaveCall()` to stop all tracks
   - Update appointment status to "Completed"
   - Redirect to `/dashboard/patient`

### 4. Doctor Video Consultation Page (`src/app/dashboard/doctor/video-consultation/page.tsx`)

**Purpose:** Doctor-side video call interface

**Flow:**
1. Get appointment ID from URL params
2. Initialize Agora call with channel name: `consultation-[appointmentId]`
3. Render video interface
4. On end call:
   - Call `leaveCall()` to stop all tracks
   - Update appointment status to "Completed"
   - Redirect to `/dashboard/doctor/appointments`

---

## Data Flow

### Appointment Booking
```
Patient selects time slot
    ↓
Stores in appointment_time column (e.g., "09:00 AM")
    ↓
Status set to "Upcoming"
    ↓
Appears in patient dashboard
```

### Video Call Initiation
```
Patient clicks "Join Now" or Doctor clicks "Start Call"
    ↓
Navigate to video consultation page with appointmentId
    ↓
useAgoraCall initializes Agora client
    ↓
Creates local video/audio tracks
    ↓
Joins channel: consultation-[appointmentId]
    ↓
Publishes local tracks
    ↓
Subscribes to remote user when they join
    ↓
VideoCallInterface renders both videos
```

### Call Termination
```
User clicks "End Call" button
    ↓
handleEndCall() called
    ↓
leaveCall() stops all tracks
    ↓
updateAppointment() sets status to "Completed"
    ↓
Router redirects to appropriate dashboard
```

---

## Environment Variables Required

```env
NEXT_PUBLIC_AGORA_APP_ID=your_app_id
AGORA_APP_CERTIFICATE=your_app_certificate
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Database Schema

### Appointments Table
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES profiles(id),
  doctor_id UUID REFERENCES profiles(id),
  appointment_date DATE,
  appointment_time TEXT,  -- Stores selected time slot (e.g., "09:00 AM")
  status VARCHAR(50),     -- "Upcoming", "Completed", "Cancelled"
  consultation_type VARCHAR(50),
  channel_name VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Agora Configuration

### Encoder Settings (Low-Bandwidth)
```typescript
{
  width: { ideal: 640 },
  height: { ideal: 480 },
  frameRate: { ideal: 15 },
  bitrateMin: 400,
  bitrateMax: 800,
}
```

### Audio Settings
```typescript
{
  opus: {
    useinbandfec: true,
    maxaveragebitrate: 32000,
    maxplaybackrate: 48000,
    stereo: false,
    usedtx: true,
  }
}
```

---

## Error Handling

### Connection Errors
- Displayed in Alert component
- Logged to console with context
- User can retry or go back

### Track Errors
- Logged with specific track type
- Graceful fallback (video/audio can work independently)
- Call can continue with degraded quality

### Channel Leave Errors
- Logged but don't block redirect
- State flags set to false regardless
- User redirected to dashboard

---

## Performance Optimizations

1. **Low Bandwidth:** 640x480 @ 15fps, 400-800kbps
2. **Audio Codec:** Opus with DTX (discontinuous transmission)
3. **Lazy Loading:** Video tracks only created when needed
4. **Cleanup:** Explicit track closure prevents memory leaks
5. **Channel Naming:** Unique per appointment prevents conflicts

---

## Security Considerations

1. **Token Generation:** Currently null (test mode)
   - Production: Generate server-side with Agora SDK
   - Include user ID and channel name
   - Set expiration time

2. **RLS Policies:** Ensure only appointment participants can join
   - Patient can only join their own appointments
   - Doctor can only join their own appointments

3. **Channel Naming:** Prevents unauthorized access
   - Format: `consultation-[appointmentId]`
   - Appointment ID is UUID (hard to guess)

---

## Testing Checklist

- [ ] Patient can join call
- [ ] Doctor can join call
- [ ] Both see each other's video
- [ ] Mic toggle works
- [ ] Camera toggle works
- [ ] End call stops all tracks
- [ ] Appointment marked as "Completed"
- [ ] Redirect works on both sides
- [ ] No console errors
- [ ] Remote user sees disconnect

---

## Known Limitations

1. **Token Generation:** Currently returns null (test mode only)
   - Need to implement server-side token generation for production

2. **Single Remote User:** Only supports 1-on-1 calls
   - Would need array handling for group calls

3. **No Recording:** Agora recording not implemented
   - Can be added if needed

4. **No Screen Sharing:** Not implemented
   - Can be added if needed

---

## Future Enhancements

1. Implement server-side token generation
2. Add call recording capability
3. Add screen sharing for doctor
4. Add chat during call
5. Add call history/notes
6. Add call quality indicators
7. Add call timeout (auto-end after X minutes)
8. Add call waiting room

---

## Deployment Checklist

- [ ] Agora credentials configured in production `.env`
- [ ] Token generation endpoint implemented
- [ ] Database migrations applied
- [ ] RLS policies configured
- [ ] Error logging configured
- [ ] Performance monitoring enabled
- [ ] Load testing completed
- [ ] Security audit completed

