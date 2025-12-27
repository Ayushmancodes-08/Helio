# ngrok Quick Setup - 5 Minutes

## What is ngrok?
ngrok creates a secure tunnel from your local machine to the internet. Perfect for testing on mobile devices.

## Installation (Choose One)

### Option 1: Chocolatey (Easiest for Windows)
```powershell
choco install ngrok
```

### Option 2: npm
```bash
npm install -g ngrok
```

### Option 3: Download
1. Go to https://ngrok.com/download
2. Download Windows version
3. Extract to folder
4. Add to PATH

---

## Setup (One Time)

### Step 1: Create Free Account
1. Go to https://ngrok.com
2. Click "Sign Up"
3. Create account (free)
4. Verify email

### Step 2: Get Auth Token
1. Go to https://dashboard.ngrok.com/auth/your-authtoken
2. Copy your auth token
3. Open PowerShell
4. Run:
```powershell
ngrok config add-authtoken YOUR_TOKEN_HERE
```

Replace `YOUR_TOKEN_HERE` with actual token from dashboard.

---

## Usage (Every Time)

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
```bash
ngrok http 9002
```

You'll see:
```
Session Status                online
Forwarding                    https://xxxx-xx-xxx-xxx-xx.ngrok.io -> http://localhost:9002
```

### Mobile: Open Browser
Copy the forwarding URL and open on mobile:
```
https://xxxx-xx-xxx-xxx-xx.ngrok.io
```

---

## Example

### Terminal 1 Output
```
▲ Next.js 15.5.9
- Local:        http://localhost:9002
- Environments: .env.local
```

### Terminal 2 Output
```
ngrok                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        us (United States)
Latency                       xx ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://1234-56-789-012-34.ngrok.io -> http://localhost:9002
```

### Mobile Browser
Open: `https://1234-56-789-012-34.ngrok.io`

---

## Testing Video Call

### Setup
1. Open app on mobile
2. Log in as patient or doctor
3. Grant permissions
4. Join video call

### Test Scenario
- **Device 1 (Laptop):** Doctor logs in, starts call
- **Device 2 (Mobile):** Patient logs in, joins call
- Both see each other's video
- Test mute/camera controls
- Test end call

---

## Troubleshooting

### ngrok command not found
```bash
# Install globally
npm install -g ngrok

# Or use full path
C:\Users\patra\AppData\Local\Programs\npm\ngrok.cmd http 9002
```

### Auth token error
1. Go to https://dashboard.ngrok.com/auth/your-authtoken
2. Copy token
3. Run: `ngrok config add-authtoken YOUR_TOKEN`
4. Restart ngrok

### Mobile can't access
1. Check dev server is running (Terminal 1)
2. Check ngrok is running (Terminal 2)
3. Copy exact URL from ngrok output
4. Check mobile has internet
5. Try different browser

### Connection refused
1. Make sure dev server is running
2. Make sure port 9002 is not blocked
3. Restart both terminals
4. Try: `ngrok http 9002 --region us`

---

## Tips

✓ Keep both terminals open
✓ Copy exact URL from ngrok output
✓ URL changes each time you restart ngrok
✓ Use HTTPS (ngrok provides it)
✓ Test on different networks
✓ Use good WiFi connection
✓ Grant camera/microphone permissions
✓ Use headphones to avoid echo

---

## One-Liner Setup

```bash
# Terminal 1
cd GSS && npm run dev

# Terminal 2
ngrok http 9002

# Mobile
Open: https://[URL-from-ngrok-output]
```

---

## Next Steps

1. Install ngrok: `npm install -g ngrok`
2. Get auth token from https://dashboard.ngrok.com
3. Configure: `ngrok config add-authtoken YOUR_TOKEN`
4. Start dev server: `npm run dev`
5. Start ngrok: `ngrok http 9002`
6. Open URL on mobile
7. Test video call

---

**Status:** ✓ Ready to Use
**Time to Setup:** ~5 minutes
**Cost:** Free
**Last Updated:** December 25, 2025
