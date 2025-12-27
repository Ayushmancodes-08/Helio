# Agora Video Call Troubleshooting

## Error: CAN_NOT_GET_GATEWAY_SERVER

### Cause
Your Agora App ID requires token-based authentication. The system now automatically fetches tokens.

### Solution
1. Verify `.env.local` has both credentials:
   ```
   NEXT_PUBLIC_AGORA_APP_ID=c3ceb71fabed47ff8da856af62ea9add
   AGORA_APP_CERTIFICATE=7fcb9bf598754a559a1ba7f57ff711de
   ```

2. Restart development server:
   ```bash
   npm run dev
   ```

3. Clear browser cache:
   - Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Clear all cache
   - Refresh page

4. Test again on different devices

### Check Console Logs
Open browser DevTools (F12) and look for:
- "Fetching token from server..." - Token fetch started
- "Token fetched: valid" - Token successfully obtained
- "Successfully joined channel" - Channel join successful

If you see errors, note them and check below.

---

## Error: Token Fetch Failed

### Cause
The `/api/agora/token` endpoint is not accessible or not working.

### Solution
1. Check network connectivity
2. Verify endpoint is accessible:
   - Open browser console
   - Run: `fetch('/api/agora/token', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({channelName: 'test', uid: 123, role: 'publisher'})})`
   - Check response

3. Verify Agora credentials are correct:
   - Go to Agora Console
   - Copy exact App ID and Certificate
   - Update `.env.local`
   - Restart server

4. Check server logs for errors

---

## Error: Permission Denied (Camera/Microphone)

### Cause
Browser permissions not granted or blocked.

### Solution
1. Check browser permissions:
   - Click lock icon in address bar
   - Find Camera and Microphone settings
   - Set to "Allow"

2. Try in incognito/private mode:
   - Open new incognito window
   - Navigate to app
   - Grant permissions when prompted

3. Check system permissions:
   - Windows: Settings → Privacy → Camera/Microphone
   - Mac: System Preferences → Security & Privacy
   - Linux: Check application permissions

4. Try different browser:
   - Chrome, Firefox, Safari, Edge
   - Some browsers have different permission handling

---

## Error: Waiting for Remote User (Never Connects)

### Cause
- Different devices not on same network
- Agora channel name mismatch
- Token generation failed silently

### Solution
1. Verify both devices can access internet
2. Check channel name is same:
   - Should be: `consultation-{appointmentId}`
   - Both sides must use same appointment ID

3. Check browser console for errors:
   - Look for token fetch errors
   - Look for channel join errors
   - Note any error messages

4. Verify Agora App ID is correct:
   - Check `.env.local`
   - Verify in Agora Console
   - Restart server if changed

5. Try on same network:
   - Connect both devices to same WiFi
   - Test again

---

## Error: No Video/Audio Showing

### Cause
- Tracks not created successfully
- Permission denied for camera/microphone
- Tracks not published to channel

### Solution
1. Check browser console for track creation errors:
   - "Video track created successfully" - should appear
   - "Audio track created successfully" - should appear
   - If missing, permission was denied

2. Grant permissions:
   - Check browser settings
   - Allow camera and microphone
   - Refresh page

3. Test camera/microphone:
   - Go to browser settings
   - Test camera and microphone
   - Verify they work

4. Check network:
   - Verify internet connection
   - Try on different network
   - Check firewall settings

---

## Error: Real-Time Sync Not Working

### Cause
Testing on same device (browser limitation).

### Solution
**IMPORTANT**: Test on different devices
- Same device won't show real-time video streaming
- Use laptop + phone, or two different computers
- Both must have internet access

Real-time sync works correctly when tested on different devices.

---

## Debugging Steps

### Step 1: Check Console Logs
1. Open browser DevTools (F12)
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

### Step 2: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Look for `/api/agora/token` request
4. Check response:
   - Status should be 200
   - Response should have `token` field
   - Token should not be null

### Step 3: Check Agora Console
1. Go to https://console.agora.io
2. Verify App ID is correct
3. Check usage statistics
4. Verify certificate is set

### Step 4: Test Credentials
1. Open browser console
2. Run:
   ```javascript
   console.log('App ID:', process.env.NEXT_PUBLIC_AGORA_APP_ID)
   ```
3. Verify it shows your App ID
4. If empty, restart server

---

## Common Issues Checklist

- [ ] `.env.local` has both `NEXT_PUBLIC_AGORA_APP_ID` and `AGORA_APP_CERTIFICATE`
- [ ] Development server restarted after changing `.env.local`
- [ ] Browser cache cleared
- [ ] Camera and microphone permissions granted
- [ ] Testing on different devices (not same device)
- [ ] Both devices have internet access
- [ ] Same appointment ID used on both sides
- [ ] Browser console shows no errors
- [ ] Network tab shows successful `/api/agora/token` request
- [ ] Agora Console shows correct credentials

---

## Still Having Issues?

1. Check all items in checklist above
2. Note exact error message from console
3. Check browser console logs
4. Check network tab for failed requests
5. Verify Agora credentials in console
6. Try in different browser
7. Try on different network
8. Restart development server
9. Clear browser cache completely
10. Try in incognito/private mode

If still not working, provide:
- Exact error message
- Console logs
- Network tab screenshot
- `.env.local` credentials (verify they're correct)
