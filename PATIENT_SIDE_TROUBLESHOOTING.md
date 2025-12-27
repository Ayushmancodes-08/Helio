# Patient Side Video Call - Troubleshooting Guide

## Enhanced Error Handling

The patient side now includes:
- ✓ Automatic token generation and authentication
- ✓ Better error messages with troubleshooting steps
- ✓ Retry button for connection failures
- ✓ Detailed console logging
- ✓ Graceful fallback to null token if needed

## Common Issues & Solutions

### Issue 1: "CAN_NOT_GET_GATEWAY_SERVER" Error

**What it means:** Agora authentication failed

**Solutions:**
1. **Verify credentials in `.env.local`:**
   ```
   NEXT_PUBLIC_AGORA_APP_ID=c3ceb71fabed47ff8da856af62ea9add
   AGORA_APP_CERTIFICATE=7fcb9bf598754a559a1ba7f57ff711de
   ```

2. **Restart development server:**
   ```bash
   npm run dev
   ```

3. **Clear browser cache:**
   - Press Ctrl+Shift+Delete
   - Select "All time"
   - Clear cache
   - Refresh page

4. **Try in incognito/private mode:**
   - Open new incognito window
   - Navigate to app
   - Test again

5. **Check network connectivity:**
   - Verify internet connection
   - Try on different network
   - Check firewall settings

### Issue 2: "Permission denied" Error

**What it means:** Browser permissions not granted for camera/microphone

**Solutions:**
1. **Grant permissions when prompted:**
   - Browser should ask for camera/microphone access
   - Click "Allow" when prompted
   - Don't click "Block"

2. **Check browser settings:**
   - Click lock icon in address bar
   - Find Camera and Microphone
   - Set to "Allow"

3. **Check system permissions:**
   - **Windows:** Settings → Privacy → Camera/Microphone
   - **Mac:** System Preferences → Security & Privacy
   - **Linux:** Check application permissions

4. **Try different browser:**
   - Chrome, Firefox, Safari, Edge
   - Some browsers handle permissions differently

5. **Test camera/microphone:**
   - Go to browser settings
   - Test camera and microphone
   - Verify they work

### Issue 3: "Waiting for..." Never Resolves

**What it means:** Doctor hasn't joined or connection is unstable

**Solutions:**
1. **Verify doctor is joining:**
   - Ask doctor to check their screen
   - Verify they're using same appointment ID
   - Check if doctor got same error

2. **Check network connectivity:**
   - Verify internet connection
   - Try on different network
   - Check WiFi signal strength

3. **Check channel name:**
   - Should be: `consultation-{appointmentId}`
   - Both sides must use same appointment ID
   - Check browser console for channel name

4. **Retry connection:**
   - Click "Retry Connection" button
   - Wait 3-5 seconds
   - Try again

5. **Check Agora status:**
   - Go to https://status.agora.io
   - Verify Agora services are running
   - Check for any outages

### Issue 4: No Video Showing

**What it means:** Video track not created or not playing

**Solutions:**
1. **Check permissions:**
   - Verify camera permission granted
   - Check browser settings
   - Check system settings

2. **Test camera:**
   - Go to browser settings
   - Test camera
   - Verify it works

3. **Toggle camera:**
   - Click camera icon to turn off
   - Click again to turn on
   - Video should appear

4. **Check console logs:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for "Video track created successfully"
   - If missing, permission was denied

5. **Try different browser:**
   - Chrome, Firefox, Safari, Edge
   - Some browsers have better camera support

### Issue 5: No Audio

**What it means:** Audio track not created or not working

**Solutions:**
1. **Check permissions:**
   - Verify microphone permission granted
   - Check browser settings
   - Check system settings

2. **Test microphone:**
   - Go to browser settings
   - Test microphone
   - Verify it works

3. **Toggle mute:**
   - Click microphone icon to mute
   - Click again to unmute
   - Audio should work

4. **Check system volume:**
   - Verify system volume is not muted
   - Check application volume
   - Increase volume if needed

5. **Check console logs:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for "Audio track created successfully"
   - If missing, permission was denied

### Issue 6: Real-Time Sync Not Working

**What it means:** Mute/camera state not syncing in real-time

**Solutions:**
1. **Test on different devices:**
   - Same device won't show real-time video
   - Use laptop + phone, or two different computers
   - Both must have internet access

2. **Check network:**
   - Verify stable internet connection
   - Try on different network
   - Check WiFi signal strength

3. **Check console logs:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for "User info updated" messages
   - These indicate real-time sync events

4. **Verify both sides connected:**
   - Check if doctor's video appears
   - Check if doctor can see your video
   - Verify both are in same channel

## Console Debugging

### Expected Logs

When everything works correctly, you should see:

```
✓ Video track created successfully
✓ Audio track created successfully
✓ Tracks published successfully
✓ Video call initialized successfully
Remote user joined: [uid]
Remote user published: [uid] video
User info updated: [uid] mute-audio
```

### Error Logs

If you see these errors, check the solutions above:

```
⚠ Camera access denied or unavailable
⚠ Microphone access denied or unavailable
✗ Channel join failed
✗ Publish error
✗ Init error
```

## Retry Button

If connection fails:
1. Error message appears with troubleshooting steps
2. After 3 seconds, "Retry Connection" button appears
3. Click button to refresh and retry
4. Button shows attempt number (Attempt 1, 2, 3, etc.)

## Network Tab Debugging

1. Open DevTools (F12)
2. Go to Network tab
3. Look for `/api/agora/token` request
4. Check response:
   - Status should be 200
   - Response should have `token` field
   - Token should not be null

## Troubleshooting Checklist

- [ ] `.env.local` has both credentials
- [ ] Development server restarted
- [ ] Browser cache cleared
- [ ] Camera and microphone permissions granted
- [ ] Testing on different device (not same device)
- [ ] Internet connection stable
- [ ] Same appointment ID used
- [ ] Browser console shows no errors
- [ ] Network tab shows successful token request
- [ ] Doctor is also joining the call

## Still Having Issues?

1. Check all items in checklist above
2. Note exact error message from console
3. Check browser console logs
4. Check network tab for failed requests
5. Verify Agora credentials
6. Restart development server
7. Clear browser cache completely
8. Try in incognito/private mode
9. Try on different device
10. Try on different network

## Performance Tips

- Close other browser tabs to free up resources
- Disable browser extensions that might interfere
- Use wired internet if possible (more stable than WiFi)
- Ensure good lighting for video quality
- Use headphones to avoid echo

## Security Notes

- Never share your Agora App ID or Certificate
- Tokens are generated server-side (secure)
- Tokens expire after 1 hour
- Each token is channel-specific
- Permissions are browser-level (user controls)

## Next Steps

1. Verify all checklist items
2. Check console logs
3. Try retry button if error appears
4. Follow troubleshooting steps for specific error
5. Contact support if still not working

---

**Status:** ✓ Enhanced with better error handling and retry logic
**Last Updated:** December 25, 2025
