# Data Entry Operator (DEO) RLS Setup Guide

## Problem
You're getting error `42501: new row violates row-level security policy for table "districts"` when trying to add districts.

## Root Cause
Your user account doesn't have the `data-entry-operator` role in the `profiles` table, so the RLS policies are blocking the insert.

---

## Solution: Step-by-Step

### Step 1: Verify Your User's Role

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query:
```sql
SELECT id, auth_user_id, role, full_name, email 
FROM profiles 
WHERE auth_user_id = auth.uid();
```

**Expected Result:** You should see a row with `role = 'data-entry-operator'`

**If you see NULL or a different role:** Go to Step 2

---

### Step 2: Fix Your User's Role

If your role is wrong or missing, run this:

```sql
-- Update your profile to have data-entry-operator role
UPDATE profiles 
SET role = 'data-entry-operator'
WHERE auth_user_id = auth.uid();

-- Verify it worked
SELECT id, auth_user_id, role, full_name 
FROM profiles 
WHERE auth_user_id = auth.uid();
```

---

### Step 3: Apply the Proper RLS Policies

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy the entire content from `PROPER_DEO_RLS_POLICIES.sql`
3. Paste it into the SQL Editor
4. Click **Run**

This will:
- Enable RLS on `districts` and `hospitals` tables
- Create policies that allow DEO users to INSERT, UPDATE, DELETE
- Allow everyone to VIEW (read-only)

---

### Step 4: Verify Everything Works

Run the diagnostic script:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy the entire content from `VERIFY_DEO_SETUP.sql`
3. Paste it into the SQL Editor
4. Click **Run**

Check the results:
- ✅ `rowsecurity` should be `true` for both tables
- ✅ You should see 4 policies for `districts` and 4 for `hospitals`
- ✅ Your profile should show `role = 'data-entry-operator'`

---

### Step 5: Test in Your App

1. Go back to your app
2. Hard refresh: **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
3. Try adding a district
4. Check browser console for any errors

---

## What the RLS Policies Do

### Districts Table
| Action | Who | Allowed? |
|--------|-----|----------|
| SELECT (View) | Anyone logged in | ✅ Yes |
| INSERT (Create) | Data Entry Operator | ✅ Yes |
| UPDATE (Edit) | Data Entry Operator | ✅ Yes |
| DELETE (Remove) | Data Entry Operator | ✅ Yes |

### Hospitals Table
| Action | Who | Allowed? |
|--------|-----|----------|
| SELECT (View) | Anyone logged in | ✅ Yes |
| INSERT (Create) | Data Entry Operator | ✅ Yes |
| UPDATE (Edit) | Data Entry Operator | ✅ Yes |
| DELETE (Remove) | Data Entry Operator | ✅ Yes |

---

## Troubleshooting

### Still getting 42501 error?

**Check 1:** Verify your role is correct
```sql
SELECT role FROM profiles WHERE auth_user_id = auth.uid();
```
Should return: `data-entry-operator`

**Check 2:** Verify policies exist
```sql
SELECT policyname FROM pg_policies WHERE tablename = 'districts';
```
Should return 4 policies

**Check 3:** Check if RLS is enabled
```sql
SELECT rowsecurity FROM pg_tables WHERE tablename = 'districts';
```
Should return: `true`

**Check 4:** Clear browser cache and restart dev server
```bash
npm run dev
```

### Still stuck?

Run this to temporarily disable RLS (for testing only):
```sql
ALTER TABLE districts DISABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals DISABLE ROW LEVEL SECURITY;
```

Then test if your app works. If it does, the issue is definitely RLS policies.

---

## For Cities (if you add them later)

If you add a `cities` table, apply the same pattern:

```sql
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- View policy
CREATE POLICY "Anyone can view cities" ON cities FOR SELECT TO authenticated USING (true);

-- Insert policy
CREATE POLICY "DEO can insert cities" ON cities FOR INSERT TO authenticated 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));

-- Update policy
CREATE POLICY "DEO can update cities" ON cities FOR UPDATE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));

-- Delete policy
CREATE POLICY "DEO can delete cities" ON cities FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE auth_user_id = auth.uid() AND role = 'data-entry-operator'));
```

---

## Summary

1. ✅ Make sure your user has `role = 'data-entry-operator'` in profiles
2. ✅ Apply the RLS policies from `PROPER_DEO_RLS_POLICIES.sql`
3. ✅ Verify with `VERIFY_DEO_SETUP.sql`
4. ✅ Hard refresh your browser
5. ✅ Test adding a district

That's it! Your DEO should now be able to add, edit, and delete districts and hospitals.
