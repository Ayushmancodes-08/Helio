# 🔐 Local Admin Login Credentials

## Health Official Login
```
User ID:   HO001
Password:  HealthOfficial@2024
```

## Data Entry Operator Login
```
User ID:   DEO001
Password:  DataEntry@2024
```

---

## 📝 How to Login

1. **Open the login page**: 
   - Go to `http://localhost:3000/en-IN/login` (or your deployed URL)

2. **Select "Professional Login"**:
   - Click on the "Professional Login" button

3. **Choose your role**:
   - For Health Official: Select "Health Official" from the dropdown
   - For Data Entry Operator: Select "Data Entry Operator" from the dropdown

4. **Enter credentials**:
   - User ID: `HO001` (Health Official) or `DEO001` (Data Entry Operator)
   - Password: See above

5. **Click "Login"**

6. **You will be redirected to**:
   - Health Official → `/en-IN/dashboard/health-official`
   - Data Entry Operator → `/en-IN/dashboard/data-entry-operator`

---

## ✅ Features

- **No Supabase Required**: These accounts work entirely locally without database
- **Session Persistence**: Your session is stored in `sessionStorage`
- **Auto-Redirect**: If you visit the homepage while logged in, you'll be redirected to your dashboard
- **Logout**: Click the logout button in the sidebar to clear your session

---

## 🔒 Security Notes

⚠️ **These are DEVELOPMENT credentials only!**

- Do NOT use these in production
- Passwords are hardcoded in the frontend code
- For production, create real accounts in Supabase using the `SETUP_ADMIN_ACCOUNTS.sql` script

---

## 🎯 Quick Test

**Test Health Official:**
```bash
1. Go to: http://localhost:3000/en-IN/login
2. Click "Professional Login"
3. Select "Health Official"
4. User ID: HO001
5. Password: HealthOfficial@2024
6. Click Login
```

**Test Data Entry Operator:**
```bash
1. Go to: http://localhost:3000/en-IN/login
2. Click "Professional Login"  
3. Select "Data Entry Operator"
4. User ID: DEO001
5. Password: DataEntry@2024
6. Click Login
```
