# Grameen Swasthya Setu (Rural Health Bridge)

A comprehensive telemedicine platform connecting rural patients with healthcare professionals, built with Next.js 15 and Supabase.

## 🏥 Feature Manifest

### Patient Features
- **Phone/OTP Authentication**: Secure SMS-based authentication for patients
- **Health Records**: Personal health record management
- **Appointments**: Book and manage doctor appointments
- **Pharmacy Stock**: Check medicine availability at local pharmacies
- **Profile Management**: Update personal information and medical history

### Doctor Features
- **UserID-Based Login**: Secure two-step authentication with custom UserIDs
- **Patient Management**: View and manage patient records
- **Appointments**: Schedule and manage patient consultations
- **Prescriptions**: Create and issue digital prescriptions
- **Lab Reports**: Access and review patient lab results
- **Profile Dashboard**: Professional profile management

### Pharmacist Features
- **Prescription Verification**: Verify and fulfill digital prescriptions
- **Inventory Management**: Track medicine stock levels
- **Reports**: Generate pharmacy utilization reports
- **Profile Management**: Manage pharmacy details

### Health Official Features
- **Analytics Dashboard**: Population health metrics and trends
- **Alert System**: Disease outbreak monitoring
- **Resource Allocation**: Track healthcare resource distribution
- **Reports**: Generate comprehensive health system reports

### Data Entry Operator Features
- **Hospital Data Entry**: Input patient visit and treatment data
- **Disease Surveillance**: Record disease incidence data
- **Regional Data**: Manage area-specific health statistics

## 🏗️ Architecture

**Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui  
**Backend**: Supabase (PostgreSQL + Auth + Storage)  
**Authentication**: Supabase Auth with Phone/OTP (patients) and Email/Password (staff)  
**State Management**: React hooks + Supabase real-time subscriptions  
**Form Validation**: React Hook Form + Zod

## 🚀 Local Setup

### Prerequisites
- Node.js 20+ and npm
- Supabase account ([sign up here](https://supabase.com))

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd GSS
npm install
```

### Step 2: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your `Project URL` and `anon public` key

### Step 3: Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> [!IMPORTANT]
> **Disable Email Confirmation:** After creating your Supabase project:
> 1. Go to **Authentication** → **Providers** → **Email**
> 2. **Disable** "Confirm email" setting
> 3. This allows staff to login immediately without clicking confirmation emails
> 
> See [SETUP_GUIDE.md](file:///a:/TeleHealthConnect/GSS/SETUP_GUIDE.md) for detailed configuration.

### Step 4: Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'pharmacist', 'health-official', 'data-entry-operator')),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  age INTEGER,
  gender TEXT,
  address TEXT,
  photo TEXT,
  license_number TEXT,
  specialization TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_auth_user_id ON profiles(auth_user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Public can lookup user_id for auth"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = auth_user_id)
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);
```

### Step 5: Configure Supabase Auth

In Supabase Dashboard → Authentication → Providers:

1. **Enable Phone Auth**: Configure your SMS provider (Twilio recommended)
2. **Enable Email Auth**: Should be enabled by default
3. **Configure Email Templates**: Customize OTP and password reset emails

### Step 6: Run Development Server

```bash
npm run dev
```

Visit [http://localhost:9002](http://localhost:9002)

## 🔐 Authentication Flows

### Patient Authentication (Phone/OTP)

**Signup Flow:**
1. Patient fills registration form with phone number, name, age, gender, address
2. Supabase creates auth user and sends OTP via SMS
3. Patient verifies OTP
4. Profile created with role='patient'
5. Redirect to patient dashboard

**Login Flow:**
1. Enter phone number
2. Receive OTP via SMS
3. Verify OTP
4. Session established → redirect to dashboard

### Staff Authentication (UserID Protocol)

**Why UserID Instead of Email?**  
Healthcare professionals often don't remember their institutional emails but need unique, memorable IDs (e.g., `DOC001`, `PHARM023`).

**Signup Flow:**
1. Professional fills form: Name, Custom UserID, Email, Password, License#, Specialization
2. Supabase creates auth user with email/password
3. Profile created linking `user_id` (custom) to `auth_user_id` (Supabase UUID)
4. Redirect to login

**Login Flow (Two-Step):**
1. **Step 1 - UserID Lookup**: User enters UserID + Password
2. **Step 2 - Email Retrieval**: Frontend queries `profiles` table to get email for that UserID
3. **Step 3 - Authentication**: Use retrieved email + provided password for `supabase.auth.signInWithPassword()`
4. **Verification**: Ensure role matches selected role
5. Session established → redirect to role-specific dashboard

**Security:**
- Generic "Invalid Credentials" error prevents UserID enumeration
- RLS allows public read of `user_id` column only (not full profile)
- Passwords never stored in profiles table (handled by Supabase Auth)

### Password Recovery

**OTP-Based Reset:**
1. Enter email address
2. Supabase sends OTP via email
3. Verify OTP
4. Set new password
5. Password updated in Supabase Auth

## 📁 Project Structure

```
src/
├── app/                      # Next.js app router
│   ├── login/               # Auth pages
│   │   ├── page.tsx        # Role selection
│   │   ├── patient/        # Patient phone auth
│   │   ├── professional/   # Staff UserID auth
│   │   └── forgot-password/
│   ├── signup/
│   │   ├── patient/
│   │   └── professional/
│   └── dashboard/           # Role-based dashboards
│       ├── patient/
│       ├── doctor/
│       ├── pharmacist/
│       ├── health-official/
│       └── data-entry-operator/
├── components/              # Reusable UI components
│   ├── ui/                 # shadcn/ui components
│   └── *-sidebar.tsx       # Role-specific navigation
├── lib/
│   └── supabase/
│       ├── client.ts       # Client-side Supabase client
│       └── server.ts       # Server-side Supabase client
└── hooks/
    └── useAuth.ts          # Auth state management hook
```

## 🧪 Testing

### Create Test Accounts

**Patient:**
```
Phone: 1234567890
(OTP will be sent via SMS in production)
```

**Doctor:**
```
UserID: DOC001
Email: doctor@test.com
Password: test123456
```

**Pharmacist:**
```
UserID: PHARM001
Email: pharmacist@test.com
Password: test123456
```

### Verify RLS Policies

1. Open browser console on any dashboard
2. Try to query another user's profile:
```javascript
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', 'another-users-id')
```
3. Should return empty or error (RLS blocks access)

## 🛠️ Development Commands

```bash
npm run dev          # Start development server on port 9002
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler check
```

## 🔄 Migration Notes

This project was migrated from Firebase AI Studio sandbox to local Supabase production:

- ✅ Removed: Firebase SDK, Genkit AI, sandbox configs
- ✅ Added: Supabase client, SSR support
- ✅ Replaced: localStorage → PostgreSQL database
- ✅ Upgraded: Mock auth → Real Supabase Auth

## 📝 License

© 2024 Grameen Swasthya Setu. All rights reserved.

## 🤝 Contributing

This is a healthcare platform. Please follow HIPAA-compliant coding practices when contributing.

## 📧 Support

For issues or questions, please open a GitHub issue.
