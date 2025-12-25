# Quick Setup Guide

## ⚠️ Critical Supabase Configuration

After creating your Supabase project, you MUST configure these settings:

### 1. Disable Email Confirmation (IMPORTANT!)

**Why**: To allow doctors/staff to sign up and login immediately without clicking confirmation emails.

**Steps**:
1. Go to Supabase Dashboard → **Authentication** → **Providers**
2. Click on **Email** provider
3. **Disable** "Confirm email"
4. Click **Save**

![Disable Email Confirmation](https://supabase.com/docs/img/guides/auth/auth-email-confirmation.png)

### 2. Configure Phone Auth (For Patients)

**Steps**:
1. Go to **Authentication** → **Providers**
2. Enable **Phone** provider
3. Choose SMS provider (Twilio recommended):
   - Add your Twilio Account SID
   - Add your Twilio Auth Token
   - Add your Twilio phone number
4. Click **Save**

### 3. Configure Email Templates (For Password Reset)

**Steps**:
1. Go to **Authentication** → **Email Templates**
2. Click **Reset Password** template
3. The default template works, but you can customize:
   ```
   Subject: Reset your password
   
   Click this link to reset your password:
   {{ .ConfirmationURL }}
   
   If you didn't request this, ignore this email.
   ```

### 4. Run Database Schema

1. Go to **SQL Editor**
2. Click **New Query**
3. Copy contents of `supabase-schema.sql`
4. Click **Run**
5. Verify `profiles` table appears in **Table Editor**

### 5. Add Environment Variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Get these values**:
- Dashboard → **Settings** → **API**
- Copy "Project URL" and "anon public" key

## 🚀 Start Development

```bash
npm install
npm run dev
```

Visit http://localhost:9002

## ✅ Test Authentication

### Test Doctor Signup (No Email Confirmation!)
1. Navigate to `/signup/professional?role=doctor`
2. Fill form:
   - UserID: `DOC001`
   - Email: `test@example.com`
   - Password: `test123456`
3. Click "Create Account"
4. **You should be able to login immediately!** (no email confirmation needed)

### Test Password Reset
1. Navigate to `/login/forgot-password`
2. Enter email: `test@example.com`
3. Check email inbox
4. Click reset link
5. Set new password
6. Login with new password

## 🔍 Troubleshooting

**Problem**: "Email not confirmed" error on login  
**Solution**: Make sure you disabled "Confirm email" in Authentication → Providers → Email

**Problem**: Phone OTP not sending  
**Solution**: Verify Twilio credentials in Authentication → Providers → Phone

**Problem**: Password reset email not received  
**Solution**: Check Supabase logs in Dashboard → Logs → Auth
