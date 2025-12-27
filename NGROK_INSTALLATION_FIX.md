# ngrok Installation Fix - Chocolatey Lock Error

## Problem
```
Unable to obtain lock file access on 'C:\ProgramData\chocolatey\lib\...'
Access to the path 'C:\ProgramData\chocolatey\lib-bad' is denied.
```

This happens when Chocolatey has a lock file issue or permission problem.

---

## Solution 1: Use npm (Easiest - No Admin Needed)

### Step 1: Install via npm
```bash
npm install -g ngrok
```

This is the simplest solution and doesn't require Chocolatey.

### Step 2: Verify Installation
```bash
ngrok --version
```

Should show version number like: `ngrok version 3.x.x`

### Step 3: Get Auth Token
1. Go to https://ngrok.com (sign up free)
2. Go to https://dashboard.ngrok.com/auth/your-authtoken
3. Copy your auth token
4. Run:
```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### Step 4: Start Using ngrok
```bash
ngrok http 9002
```

---

## Solution 2: Manual Download (If npm Fails)

### Step 1: Download ngrok
1. Go to https://ngrok.com/download
2. Download Windows version (64-bit)
3. Extract to folder (e.g., `C:\ngrok`)

### Step 2: Add to PATH
1. Right-click "This PC" → Properties
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Under "System variables", click "Path" → Edit
5. Click "New"
6. Add: `C:\ngrok` (or wherever you extracted)
7. Click OK, OK, OK
8. Restart PowerShell

### Step 3: Verify
```bash
ngrok --version
```

### Step 4: Configure Auth Token
```bash
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### Step 5: Use ngrok
```bash
ngrok http 9002
```

---

## Solution 3: Fix Chocolatey (Advanced)

If you want to fix Chocolatey for future use:

### Step 1: Run as Administrator
1. Right-click PowerShell
2. Select "Run as administrator"

### Step 2: Remove Lock File
```powershell
Remove-Item -Path "C:\ProgramData\chocolatey\lib-bad" -Recurse -Force -ErrorAction SilentlyContinue
```

### Step 3: Clean Chocolatey Cache
```powershell
choco cache remove all
```

### Step 4: Try Installation Again
```powershell
choco install ngrok
```

---

## Recommended: Use npm (Solution 1)

### Why npm?
✓ No admin rights needed
✓ No Chocolatey issues
✓ Works on any Windows version
✓ Easy to update
✓ Fastest solution

### Quick Steps
```bash
# 1. Install
npm install -g ngrok

# 2. Verify
ngrok --version

# 3. Get token from https://dashboard.ngrok.com/auth/your-authtoken
# 4. Configure
ngrok config add-authtoken YOUR_TOKEN

# 5. Use
ngrok http 9002
```

---

## Testing After Installation

### Verify ngrok Works
```bash
ngrok --version
```

Should output:
```
ngrok version 3.x.x
```

### Test Connection
```bash
ngrok http 9002
```

Should show:
```
Session Status                online
Forwarding                    https://xxxx-xx-xxx-xxx-xx.ngrok.io -> http://localhost:9002
```

---

## If npm Install Fails

### Try Alternative: Direct Download
1. Go to https://ngrok.com/download
2. Download Windows version
3. Extract to `C:\ngrok`
4. Add to PATH (see Solution 2)
5. Use: `ngrok http 9002`

---

## Quick Reference

| Method | Setup Time | Admin Needed | Recommended |
|--------|-----------|--------------|-------------|
| npm | 1 min | No | ✓ YES |
| Manual Download | 5 min | No | Yes |
| Chocolatey Fix | 10 min | Yes | No |

---

## Next Steps

1. **Try npm first:**
   ```bash
   npm install -g ngrok
   ```

2. **If npm works:**
   ```bash
   ngrok --version
   ngrok config add-authtoken YOUR_TOKEN
   ngrok http 9002
   ```

3. **If npm fails:**
   - Download manually from https://ngrok.com/download
   - Extract to `C:\ngrok`
   - Add to PATH
   - Use: `ngrok http 9002`

---

## Support

If you still have issues:
1. Try npm install (most reliable)
2. Try manual download
3. Check https://ngrok.com/docs for latest instructions
4. Verify internet connection
5. Try different PowerShell window

---

**Status:** ✓ Multiple Solutions Provided
**Recommended:** Use npm (Solution 1)
**Time to Setup:** ~1 minute
