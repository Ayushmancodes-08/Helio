# Mobile Access Guide - Video Consultation App

## Problem
Cannot forward localhost:9002 to mobile. Error: `spawn c:\Users\patra\AppData\Local\Programs\Kiro\bin\code-tunnel.exe ENOENT`

## Solution: Use ngrok for Port Forwarding

### Step 1: Install ngrok

**Option A: Using Chocolatey (Recommended for Windows)**
```powershell
choco install ngrok
```

**Option B: Download from Website**
1. Go to https://ngrok.com/download
2. Download for Windows
3. Extract to a folder
4. Add to PATH or use full path

**Option C: Using npm**
```bash
npm install -g ngrok
```

### Step 2: Get ngrok Auth Token

1. Go to https://dashboard.ngrok.com/auth/your-authtoken
2. Sign up (free account)
3. Copy your auth token
4. Run in PowerShell:
```powershell
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### Step 3: Start Development Server

In one PowerShell window:
```bash
cd GSS
npm run dev
```

Wait for: `▲ Next.js 15.5.9`

### Step 4: Start ngrok Tunnel

In another PowerShell window:
```bash
ngrok http 9002
```

You'll see:
```
Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        us (United States)
Latency                       xx ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xxxx-xx-xxx-xxx-xx.ngrok.io -> http://localhost:9002
```

### Step 5: Access on Mobile

1. Copy the forwarding URL (e.g., `https://xxxx-xx-xxx-xxx-xx.ngrok.io`)
2. On mobile phone, open browser
3. Paste URL in address bar
4. Press Enter
5. App loads on mobile

**Example:**
```
https://xxxx-xx-xxx-xxx-xx.ngrok.io/dashboard/doctor/appointments
```

---

## Alternative: Using Local Network IP

### Step 1: Find Your Computer's Local IP

**Windows PowerShell:**
```powershell
ipconfig
```

Look for "IPv4 Address" under your WiFi adapter (e.g., `192.168.x.x`)

### Step 2: Update Next.js Config (Optional)

Edit `GSS/next.config.ts`:
```typescript
const nextConfig = {
  // ... existing config
  experimental: {
    // Allow access from other devices
  }
}
```

### Step 3: Start Development Server

```bash
npm run dev -- -H 0.0.0.0
```

Or modify `package.json`:
```json
{
  "scripts": {
    "dev": "next dev --turbopack -p 9002 -H 0.0.0.0"
  }
}
```

### Step 4: Access on Mobile

1. On mobile, open browser
2. Enter: `http://192.168.x.x:9002` (replace x.x with your IP)
3. Press Enter
4. App loads on mobile

**Example:**
```
http://192.168.1.100:9002/dashboard/doctor/appointments
```

---

## Recommended: ngrok (Best for Testing)

### Why ngrok?
✓ Works over internet (not just local network)
✓ HTTPS by default (secure)
✓ Easy to share URL with others
✓ Works on any network
✓ No firewall issues
✓ Free tier available

### Why Local IP?
✓ No external service needed
✓ Faster (local network only)
✓ Works without internet
✓ Good for local testing only

---

## Quick Start (ngrok Method)

### Terminal 1: Start Dev Server
```bash
cd GSS
npm run dev
```

### Terminal 2: Start ngrok
```bash
ngrok http 9002
```

### Mobile: Open Browser
```
https://xxxx-xx-xxx-xxx-xx.ngrok.io
```

---

## Troubleshooting

### ngrok Not Found
**Solution:**
```bash
# Install globally
npm install -g ngrok

# Or use full path
C:\Users\patra\AppData\Local\Programs\npm\ngrok.cmd http 9002
```

### ngrok Auth Token Error
**Solution:**
1. Go to https://dashboard.ngrok.com/auth/your-authtoken
2. Copy token
3. Run: `ngrok config add-authtoken YOUR_TOKEN`
4. Restart ngrok

### Mobile Can't Access
**Solution:**
1. Verify ngrok is running (check Terminal 2)
2. Verify dev server is running (check Terminal 1)
3. Copy exact URL from ngrok output
4. Check mobile has internet
5. Try incognito mode on mobile

### CORS Errors
**Solution:**
Add to `GSS/next.config.ts`:
```typescript
const nextConfig = {
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
}
```

### SSL Certificate Error
**Solution:**
- ngrok provides valid SSL certificate
- If error persists, try: `ngrok http --scheme=http 9002`
- Or use local IP method instead

---

## Testing Video Call on Mobile

### Setup
1. Open app on mobile (via ngrok or local IP)
2. Log in as patient or doctor
3. Grant camera/microphone permissions
4. Join video call

### Expected
- Camera feed shows on mobile
- Real-time video/audio works
- Controls responsive
- No lag or delays

### Tips
- Use good WiFi connection
- Ensure good lighting
- Hold phone steady
- Use headphones to avoid echo
- Close other apps to free memory

---

## Sharing with Others

### Using ngrok
1. Start ngrok: `ngrok http 9002`
2. Copy URL: `https://xxxx-xx-xxx-xxx-xx.ngrok.io`
3. Share URL with others
4. They can access from anywhere

### Using Local IP
1. Find your IP: `ipconfig`
2. Share: `http://192.168.x.x:9002`
3. Others must be on same WiFi
4. Works only on local network

---

## Production Deployment

For production, use proper hosting:
- Vercel (recommended for Next.js)
- AWS
- Google Cloud
- Azure
- DigitalOcean

Don't use ngrok for production (rate limits, URL changes).

---

## Quick Reference

| Method | Setup | Speed | Range | Cost |
|--------|-------|-------|-------|------|
| ngrok | 5 min | Fast | Internet | Free |
| Local IP | 2 min | Faster | Local WiFi | Free |
| Vercel | 10 min | Very Fast | Internet | Free/Paid |

---

## Next Steps

1. Install ngrok (if not already)
2. Get auth token from ngrok dashboard
3. Start dev server: `npm run dev`
4. Start ngrok: `ngrok http 9002`
5. Copy URL from ngrok output
6. Open on mobile browser
7. Test video call

---

**Status:** ✓ Ready to Access on Mobile
**Last Updated:** December 25, 2025
