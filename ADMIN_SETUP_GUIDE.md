# 🔐 Admin Account Setup - Complete Guide

## 📋 Predefined Accounts

### Health Official
- **User ID**: `HO001`
- **Email**: `healthofficial@hospital.com`
- **Password**: `HealthOfficial@2024`

### Data Entry Operator
- **User ID**: `DEO001`
- **Email**: `dataentry@hospital.com`
- **Password**: `DataEntry@2024`

---

## 🚀 Setup Instructions (5 Minutes)

### Step 1: Open Supabase Dashboard
1. Go to your Supabase project: https://supabase.com
2. Click on your project
3. Navigate to **SQL Editor** (left sidebar)

### Step 2: Run the Setup Script
1. Click **"New Query"**
2. Open the file `SETUP_ADMIN_ACCOUNTS.sql` from your project
3. Copy the ENTIRE contents
4. Paste into the SQL Editor
5. Click **"Run"** button (or press Ctrl+Enter)

### Step 3: Verify Accounts Created
After running the script, you should see a table with 2 rows:

| Login UserID | Role | Name | Email | Password |
|--------------|------|------|-------|----------|
| DEO001 | data-entry-operator | Data Entry Operator | dataentry@hospital.com | DataEntry@2024 |
| HO001 | health-official | Health Official | healthofficial@hospital.com | HealthOfficial@2024 |

✅ If you see this table with 2 rows, **SUCCESS!** The accounts are ready.

❌ If you see 0 rows, scroll up in the SQL Editor output to see error messages.

---

## 🧪 Testing the Login

### Test Health Official Login:
1. Open your app: `http://localhost:3000/login`
2. Select **"Health Official"** from dropdown
3. Click **"Continue"**
4. Enter credentials:
   - **User ID**: `HO001`
   - **Password**: `HealthOfficial@2024`
5. Click **"Login"**
6. You should be redirected to: `/dashboard/health-official`

### Test Data Entry Operator Login:
1. Open your app: `http://localhost:3000/login`
2. Select **"Data Entry Operator"** from dropdown
3. Click **"Continue"**
4. Enter credentials:
   - **User ID**: `DEO001`
   - **Password**: `DataEntry@2024`
5. Click **"Login"**
6. You should be redirected to: `/dashboard/data-entry-operator`

---

## 🔧 Troubleshooting

### Issue: "Invalid Credentials" Error

**Solution 1: Verify in Supabase Dashboard**
1. Go to **Authentication** → **Users**
2. Look for emails:
   - `healthofficial@hospital.com`
   - `dataentry@hospital.com`
3. Check if "Email Confirmed" column shows green checkmark
4. If users don't exist, run `SETUP_ADMIN_ACCOUNTS.sql` again

**Solution 2: Check Profiles Table**
1. Go to **Table Editor** → **profiles**
2. Look for rows with `user_id` = `HO001` or `DEO001`
3. Verify `auth_user_id` column has a value
4. If rows missing, run `SETUP_ADMIN_ACCOUNTS.sql` again

**Solution 3: Reset Everything**
1. Uncomment lines 8-11 in `SETUP_ADMIN_ACCOUNTS.sql`
2. Run the entire script again
3. This will delete and recreate the accounts

### Issue: Accounts Already Exist

The script uses `ON CONFLICT` clauses, so it's **safe to run multiple times**. It will:
- Update existing accounts with the new password
- Create new profiles if missing
- Link existing auth users to profiles

---

## 🔒 Security Notes

1. **Change Passwords in Production**
   - These are test credentials
   - Use strong, unique passwords for production

2. **No Password Reset**
   - Health Officials and Data Entry Operators **cannot** use "Forgot Password"
   - To change password, re-run the SQL script with new password

3. **Admin Access Only**
   - Only create these accounts for trusted administrators
   - They have elevated permissions in the system

---

## ✅ Quick Reference Card

```
╔════════════════════════════════════════════════╗
║         ADMIN LOGIN CREDENTIALS                ║
╠════════════════════════════════════════════════╣
║                                                ║
║  HEALTH OFFICIAL:                              ║
║  UserID:   HO001                               ║
║  Password: HealthOfficial@2024                 ║
║                                                ║
║  DATA ENTRY OPERATOR:                          ║
║  UserID:   DEO001                              ║
║  Password: DataEntry@2024                      ║
║                                                ║
╚════════════════════════════════════════════════╝
```

**Login URL**: `http://localhost:3000/login`

---

## 📞 Need Help?

If you're still having issues:
1. Check browser console (F12) for errors
2. Check Supabase logs for authentication errors
3. Verify the `profiles` table has the correct RLS policies
4. Make sure `supabase-schema.sql` was run to create all tables
