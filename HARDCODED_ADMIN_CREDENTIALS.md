# 🔐 Admin Login: Hardcoded + Supabase Hybrid

## Credentials

```
Health Official:
User ID:   HO001
Password:  HealthOfficial@2024

Data Entry Operator:
User ID:   DEO001
Password:  DataEntry@2024
```

---

## 🎯 How It Works

The system uses a **smart hybrid approach**:

### 1. You enter credentials: HO001 / HealthOfficial@2024

### 2. System checks Supabase FIRST:
```
✅ If account exists in Supabase → Uses real database
   → All changes are SAVED
   → Full data persistence
   → Message: "Welcome back, [Name]! (Using Supabase)"
```

### 3. If Supabase authentication fails:
```
⚠️  Falls back to local testing mode
   → Uses sessionStorage only
   → Changes are NOT saved
   → Message: "Welcome, [Name]! (Local mode - changes won't be saved)"
```

---

## 💡 Best of Both Worlds

**If you've run `SETUP_ADMIN_ACCOUNTS.sql`:**
- ✅ Login with HO001/DEO001
- ✅ Data is saved to Supabase
- ✅ Full production workflow
- ✅ Database operations work

**If you haven't set up Supabase yet:**
- ✅ Login with HO001/DEO001  
- ⚠️ Data stored in sessionStorage only
- ⚠️ For UI testing only
- ⚠️ Changes lost on logout

---

## 📝 To Enable Full Database Mode

Run this in Supabase SQL Editor:

```sql
-- Copy content from SETUP_ADMIN_ACCOUNTS.sql and run it
```

This creates the accounts in Supabase with the same credentials.

---

## 🔍 How to Tell Which Mode You're In

**Look at the login success message:**

- **"Using Supabase"** = Real database, changes saved ✅
- **"Local mode - changes won't be saved"** = Testing only ⚠️

---

## 🎯 Login Steps

1. Go to `/en-IN/login`
2. Click "Professional Login"
3. Select role (Health Official OR Data Entry Operator)
4. Enter: `HO001` / `HealthOfficial@2024` OR `DEO001` / `DataEntry@2024`
5. Click Login
6. Check the success message to see which mode you're in!
