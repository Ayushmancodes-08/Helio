# ngrok Manual Setup - No Admin Rights Needed

## Problem
Both Chocolatey and npm require admin rights. Here's how to use ngrok without admin.

---

## Solution: Download & Use Directly

### Step 1: Download ngrok

1. Go to https://ngrok.com/download
2. Click "Windows" (64-bit)
3. Download the ZIP file
4. Extract to your user folder (e.g., `C:\Users\patra\ngrok`)

### Step 2: Get Auth Token

1. Go to https://ngrok.com (sign up free)
2. Go to https://dashboard.ngrok.com/auth/your-authtoken
3. Copy your auth token (looks like: `2nzqt_...`)

### Step 3: Configure ngrok

Open PowerShell and run:
```powershell
C:\Users\patra\ngrok\ngrok.exe config add-authtoken YOUR_TOKEN_HERE
```

Replace `YOUR_TOKEN_HERE` with your actual token from dashboard.

### Step 4: Use ngrok

In PowerShell, run:
```powershell
C:\Users\patra\ngrok\ngrok.exe http 9002
```

You'll see:
```
Session Status                online
Forwarding                    https://xxxx-xx-xxx-xxx-xx.ngrok.io -> http://localhost:9002
```

---

## Full Setup Steps

### Step 1: Download
1. Go to https://ngrok.com/download
2. Download Windows 64-bit
3. Extract ZIP to `C:\Users\patra\ngrok`

### Step 2: Get Token
1. Go to https://ngrok.com (sign up free)
2. Go to https://dashboard.ngrok.com/auth/your-authtoken
3. Copy token

### Step 3: Configure
```powershell
C:\Users\patra\ngrok\ngrok.exe config add-authtoken YOUR_TOKEN
```

### Step 4: Start ngrok
```powershell
C:\Users\patra\ngrok\ngrok.exe http 9002
```

### Step 5: Use on Mobile
Copy URL from ngrok output and open on mobile browser.

---

## Complete Testing Flow

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

### Terminal 2: Start ngrok
```powershell
C:\Users\patra\ngrok\ngrok.exe http 9002
```

Wait for:
```
Forwarding                    https://xxxx-xx-xxx-xxx-xx.ngrok.io -> http://localhost:9002
```

### Mobile Browser
1. Copy URL from Terminal 2 (e.g., `https://xxxx-xx-xxx-xxx-xx.ngrok.io`)
2. Open on mobile browser
3. Log in
4. Test video call

---

## Troubleshooting

### ngrok.exe not found
- Check extraction path
- Should be: `C:\Users\patra\ngrok\ngrok.exe`
- Verify ZIP was extracted correctly

### Auth token error
- Go to https://dashboard.ngrok.com/auth/your-authtoken
- Copy exact token
- Run: `C:\Users\patra\ngrok\ngrok.exe config add-authtoken YOUR_TOKEN`

### Can't access on mobile
- Check dev server is running (Terminal 1)
- Check ngrok is running (Terminal 2)
- Copy exact URL from ngrok output
- Check mobile has internet

### Connection refused
- Make sure dev server is running
- Make sure port 9002 is not blocked
- Restart both terminals

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

### Start
```powershell
C:\Users\patra\ngrok\ngrok.exe http 9002
```

### Mobile
Open: `https://[URL-from-ngrok]`

---

## Testing Checklist

- [ ] Downloaded ngrok ZIP
- [ ] Extracted to `C:\Users\patra\ngrok`
- [ ] Got auth token from https://dashboard.ngrok.com
- [ ] Configured: `ngrok.exe config add-authtoken YOUR_TOKEN`
- [ ] Started dev server: `npm run dev`
- [ ] Started ngrok: `ngrok.exe http 9002`
- [ ] Copied URL from ngrok output
- [ ] Opened URL on mobile
- [ ] Logged in on mobile
- [ ] Tested video call

---

## Video Call Testing on Mobile

### Setup
1. **Laptop (Doctor):**
   - Open: `http://localhost:9002`
   - Log in as doctor
   - Click "Start Call"
   - See "Waiting for Ayushman Patra..."

2. **Mobile (Patient):**
   - Open: `https://[ngrok-url]`
   - Log in as patient
   - Click "Join Call"
   - Doctor sees patient's video

### Test
- Both see each other
- Mute/camera controls work
- Real-time sync works
- Can end call

---

## No Admin Rights Needed

✓ Download ngrok manually
✓ Extract to user folder
✓ Use full path to ngrok.exe
✓ No admin rights required
✓ Works on any Windows version

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

---

**Status:** ✓ No Admin Rights Needed
**Time to Setup:** ~5 minutes
**Cost:** Free
