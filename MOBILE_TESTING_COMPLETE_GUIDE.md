# Complete Mobile Testing Guide - No Admin Rights

## Overview

Test video consultation on mobile without needing admin rights. Uses ngrok for port forwarding.

---

## Step 1: Download ngrok (5 minutes)

### Download
1. Go to https://ngrok.com/download
2. Click "Windows" (64-bit)
3. Download ZIP file
4. Extract to: `C:\Users\patra\ngrok`

### Verify
Check that you have: `C:\Users\patra\ngrok\ngrok.exe`

---

## Step 2: Get ngrok Auth Token (2 minutes)

### Create Account
1. Go to https://ngrok.com
2. Click "Sign Up"
3. Create free account
4. Verify email

### Get Token
1. Go to https://dashboard.ngrok.com/auth/your-authtoken
2. Copy your auth token (looks like: `2nzqt_...`)

### Configure ngrok
Open PowerShell and run:
```powershell
C:\Users\patra\ngrok\ngrok.exe config add-authtoken YOUR_TOKEN_HERE
```

Replace `YOUR_TOKEN_HERE` with your actual token.

---

## Step 3: Start Development Server (1 minute)

### Terminal 1: Start Dev Server
```bash
cd GSS
npm run dev
```

Wait for:
```
▲ Next.js 15.5.9
- Local:        http://localhost:9002
```

---

## Step 4: Start ngrok (1 minute)

### Terminal 2: Start ngrok
```powershell
C:\Users\patra\ngrok\ngrok.exe http 9002
```

Wait for:
```
Session Status                online
Forwarding                    https://xxxx-xx-xxx-xxx-xx.ngrok.io -> http://localhost:9002
```

**Copy the forwarding URL** (e.g., `https://xxxx-xx-xxx-xxx-xx.ngrok.io`)

---

## Step 5: Test on Mobile (5 minutes)

### Setup: Two Devices

**Device 1 (Laptop - Doctor):**
1. Open: `http://localhost:9002`
2. Log in as doctor (Arpita Mohapatra)
3. Go to Appointments
4. Click "Start Call"
5. Grant permissions
6. See "Waiting for Ayushman Patra..."

**Device 2 (Mobile - Patient):**
1. Open mobile browser
2. Paste ngrok URL: `https://xxxx-xx-xxx-xxx-xx.ngrok.io`
3. Log in as patient (Ayushman Patra)
4. Go to Consultations
5. Click "Join Call"
6. Grant permissions
7. See doctor's video

### Verify Connection

**Doctor's Laptop:**
- Waiting message disappears
- Sees patient's video on right screen
- Both can communicate

**Patient's Mobile:**
- Sees doctor's video on right screen
- Sees "You" on left screen
- Both can communicate

---

## Step 6: Test Controls (2 minutes)

### Mute Test
1. Patient clicks mute button
2. Doctor sees 🔇 indicator on patient's name
3. Patient unmutes
4. Indicator disappears

### Camera Test
1. Patient clicks camera button
2. Doctor sees 📹 indicator on patient's name
3. Patient turns camera back on
4. Indicator disappears

### End Call
1. Either side clicks End Call
2. Both disconnect
3. Both return to dashboard

---

## Complete Testing Checklist

### Setup
- [ ] Downloaded ngrok from https://ngrok.com/download
- [ ] Extracted to `C:\Users\patra\ngrok`
- [ ] Verified `ngrok.exe` exists
- [ ] Got auth token from https://dashboard.ngrok.com
- [ ] Configured: `ngrok.exe config add-authtoken YOUR_TOKEN`

### Servers Running
- [ ] Terminal 1: Dev server running (`npm run dev`)
- [ ] Terminal 2: ngrok running (`ngrok.exe http 9002`)
- [ ] Copied ngrok URL

### Doctor Side (Laptop)
- [ ] Opened `http://localhost:9002`
- [ ] Logged in as doctor
- [ ] Clicked "Start Call"
- [ ] Granted permissions
- [ ] See "Waiting for Ayushman Patra..."

### Patient Side (Mobile)
- [ ] Opened ngrok URL on mobile
- [ ] Logged in as patient
- [ ] Clicked "Join Call"
- [ ] Granted permissions
- [ ] See doctor's video

### Real-Time Sync
- [ ] Patient mutes - doctor sees indicator
- [ ] Patient unmutes - indicator disappears
- [ ] Patient turns off camera - doctor sees indicator
- [ ] Patient turns on camera - indicator disappears
- [ ] Doctor mutes - patient sees indicator
- [ ] Doctor turns off camera - patient sees indicator

### End Call
- [ ] Either side clicks End Call
- [ ] Both disconnect
- [ ] Both return to dashboard
- [ ] Appointment marked as completed

---

## Troubleshooting

### ngrok.exe not found
**Solution:**
- Check extraction path: `C:\Users\patra\ngrok\ngrok.exe`
- Re-download and extract if needed
- Use full path: `C:\Users\patra\ngrok\ngrok.exe http 9002`

### Auth token error
**Solution:**
1. Go to https://dashboard.ngrok.com/auth/your-authtoken
2. Copy exact token
3. Run: `C:\Users\patra\ngrok\ngrok.exe config add-authtoken YOUR_TOKEN`

### Can't access on mobile
**Solution:**
1. Check dev server is running (Terminal 1)
2. Check ngrok is running (Terminal 2)
3. Copy exact URL from ngrok output
4. Check mobile has internet
5. Try different browser on mobile

### Connection refused
**Solution:**
1. Make sure dev server is running
2. Make sure port 9002 is not blocked
3. Restart both terminals
4. Try: `C:\Users\patra\ngrok\ngrok.exe http 9002 --region us`

### Mobile can't see doctor's video
**Solution:**
1. Check doctor's camera is on
2. Check permissions granted on both sides
3. Check network connection
4. Try refreshing mobile page

### Real-time sync not working
**Solution:**
1. Verify both sides connected
2. Check network stability
3. Try toggling control again
4. Check console for errors

---

## Performance Tips

✓ Use good WiFi connection
✓ Close other apps on mobile
✓ Ensure good lighting
✓ Use headphones to avoid echo
✓ Hold phone steady
✓ Keep both terminals open

---

## Quick Reference

### Download
https://ngrok.com/download → Windows 64-bit → Extract to `C:\Users\patra\ngrok`

### Get Token
https://dashboard.ngrok.com/auth/your-authtoken → Copy token

### Configure
```powershell
C:\Users\patra\ngrok\ngrok.exe config add-authtoken YOUR_TOKEN
```

### Terminal 1: Dev Server
```bash
cd GSS
npm run dev
```

### Terminal 2: ngrok
```powershell
C:\Users\patra\ngrok\ngrok.exe http 9002
```

### Mobile
Open: `https://[URL-from-ngrok]`

---

## Expected Results

✓ Doctor sees "Waiting for Patient..." when patient hasn't joined
✓ Doctor sees patient's video when patient joins
✓ Patient sees doctor's video
✓ Real-time mute/camera sync works
✓ Both can end call
✓ Appointment marked as completed
✓ No console errors
✓ Smooth video/audio streaming

---

## Next Steps

1. Download ngrok from https://ngrok.com/download
2. Extract to `C:\Users\patra\ngrok`
3. Get token from https://dashboard.ngrok.com/auth/your-authtoken
4. Configure: `C:\Users\patra\ngrok\ngrok.exe config add-authtoken YOUR_TOKEN`
5. Start dev server: `npm run dev`
6. Start ngrok: `C:\Users\patra\ngrok\ngrok.exe http 9002`
7. Open URL on mobile
8. Test video call
9. Verify all features work

---

## Support

If you have issues:
1. Check troubleshooting section above
2. Verify all setup steps completed
3. Check console for errors
4. Try different browser on mobile
5. Restart both terminals
6. Check network connection

---

**Status:** ✓ Ready for Mobile Testing
**Time to Setup:** ~10 minutes
**Cost:** Free
**Admin Rights:** Not needed
**Last Updated:** December 25, 2025
