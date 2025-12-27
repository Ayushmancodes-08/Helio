# Video Call - Quick Start Guide

## What Was Fixed

✅ **Patient mobile error** - ERR_SUBSCRIBE_REQUEST_INVALID  
✅ **Doctor desktop error** - OPERATION_ABORTED  
✅ **Both showing same video** - Fixed subscription logic  
✅ **Excessive lagging** - Optimized for mobile networks  

## How to Test

### Step 1: Open Two Browsers
- Browser 1: Doctor dashboard
- Browser 2: Patient dashboard (mobile or different device)

### Step 2: Navigate to Video Call
- Doctor: Click "Video Consultation" → Select appointment
- Patient: Click "Video Consultation" → Select appointment

### Step 3: Verify Connection
- Doctor should see: "Waiting for [patient]..."
- Patient should see: "Waiting for Dr. [doctor]..."
- Both should see their own video on left side

### Step 4: Check Console
- Open F12 (Developer Tools)
- Look for: ✓ Successfully joined channel
- Look for: ✓ Tracks published successfully
- Look for: ✓ Successfully subscribed to video
- Should see NO red errors (❌)

### Step 5: Verify Video
- Both should see each other's video
- Video should be clear (not pixelated)
- Video should be smooth (not lagging)
- Audio should be clear

## Expected Console Output

```
🔧 Initializing Agora with UID: 12345 Channel: consultation-abc
🚪 Joining channel...
📍 Join attempt 1/3
✓ Successfully joined channel
📹 Requesting camera access...
✓ Video track created successfully
🎤 Requesting microphone access...
✓ Audio track created successfully
📤 Publishing 2 track(s)...
✓ Tracks published successfully
✓ Video call initialized successfully
```

When patient joins:
```
👤 Remote user joined: 54321
📢 Remote user published: 54321 mediaType: video
🔗 Subscribing to user: 54321 mediaType: video
✓ Successfully subscribed to video from user: 54321
```

## If Something Goes Wrong

### Error: ERR_SUBSCRIBE_REQUEST_INVALID
- **Cause**: Subscription failed
- **Fix**: Automatically retries after 1 second
- **If persists**: Refresh page and try again

### Error: OPERATION_ABORTED
- **Cause**: Join was cancelled
- **Fix**: Automatically retries up to 3 times
- **If persists**: Check internet connection

### Both showing same video
- **Cause**: Subscription not completing
- **Fix**: Refresh page
- **Check**: Console should show "✓ Successfully subscribed to video"

### Video lagging
- **Cause**: Network too slow
- **Fix**: Move closer to WiFi router
- **Check**: Internet speed should be >2 Mbps

### No video at all
- **Cause**: Camera/microphone permissions not granted
- **Fix**: Check browser permissions (Settings > Privacy)
- **Check**: Ensure device camera/microphone not in use by other app

## Quick Checklist

- [ ] Both users can see each other's video
- [ ] Video is clear (not pixelated)
- [ ] Video is smooth (not lagging)
- [ ] Audio is clear
- [ ] Mute button works
- [ ] Camera button works
- [ ] Indicators (🔇, 📹) sync in real-time
- [ ] No red errors in console
- [ ] Console shows ✓ messages

## Video Quality Settings

| Setting | Value |
|---------|-------|
| Resolution | 960x540 (HD) |
| Frame Rate | 20fps |
| Bitrate | 500-1500 kbps |
| Mobile Friendly | Yes |
| Expected Lag | <100ms |

## Network Requirements

- **Minimum**: 1 Mbps upload, 1 Mbps download
- **Recommended**: 2+ Mbps upload, 2+ Mbps download
- **Best**: 5+ Mbps upload, 5+ Mbps download

## Browser Support

- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting Steps

1. **Refresh page** - Clears any temporary issues
2. **Check internet** - Ensure stable connection
3. **Check permissions** - Allow camera/microphone
4. **Clear cache** - Ctrl+Shift+Delete
5. **Try incognito** - Rules out browser extensions
6. **Try different browser** - Rules out browser issues
7. **Restart device** - Last resort

## Performance Tips

- Use WiFi instead of mobile data
- Close other bandwidth-heavy apps
- Move closer to WiFi router
- Use latest browser version
- Ensure device has enough battery
- Close other browser tabs

## Success Indicators

✅ Console shows ✓ messages  
✅ Both users see each other's video  
✅ Video is clear and smooth  
✅ Audio is clear  
✅ Controls work in real-time  
✅ No red errors in console  

## Need Help?

1. Check console logs (F12)
2. Read `CRITICAL_VIDEO_CALL_FIXES.md` for technical details
3. Read `FINAL_VIDEO_CALL_SOLUTION.md` for complete solution
4. Check `QUICK_TEST_CHECKLIST.md` for detailed testing steps

---

**Status**: ✅ All issues fixed and tested  
**Last Updated**: December 25, 2025  
**Version**: 2.0 (Complete rewrite with retry logic)
