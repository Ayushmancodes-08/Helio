# 🔐 Default Administrator Credentials

## Health Official
**Note:** Health Officials cannot reset passwords. Contact system administrator if password is lost.

```
User ID: HO001
Password: Create this account via professional signup
```

## Data Entry Operator  
**Note:** Data Entry Operators cannot reset passwords. Contact system administrator if password is lost.

```
User ID: DEO001
Password: Create this account via professional signup
```

## Creating Admin Accounts

Since Health Officials and Data Entry Operators don't have self-signup, you need to create them manually in Supabase:

### SQL Script to Create Accounts:

```sql
-- Health Official Account
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Create auth user
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    role,
    aud
  ) VALUES (
    'healthofficial@hospital.com',
    crypt('healthofficial123', gen_salt('bf')),
    NOW(),
    '{"full_name": "Health Official"}',
    'authenticated',
    'authenticated'
  )
  RETURNING id INTO user_id;

  -- Create profile
  INSERT INTO profiles (
    auth_user_id,
    user_id,
    role,
    full_name,
    email
  ) VALUES (
    user_id,
    'HO001',
    'health-official',
    'Health Official',
    'healthofficial@hospital.com'
  );
END $$;

-- Data Entry Operator Account
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Create auth user
  INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    role,
    aud
  ) VALUES (
    'dataentry@hospital.com',
    crypt('dataentry123', gen_salt('bf')),
    NOW(),
    '{"full_name": "Data Entry Operator"}',
    'authenticated',
    'authenticated'
  )
  RETURNING id INTO user_id;

  -- Create profile
  INSERT INTO profiles (
    auth_user_id,
    user_id,
    role,
    full_name,
    email
  ) VALUES (
    user_id,
    'DEO001',
    'data-entry-operator',
    'Data Entry Operator',
    'dataentry@hospital.com'
  );
END $$;
```

## Default Login Credentials Summary

| Role | User ID | Email | Password |
|------|---------|-------|----------|
| **Health Official** | HO001 | healthofficial@hospital.com | healthofficial123 |
| **Data Entry Operator** | DEO001 | dataentry@hospital.com | dataentry123 |

## Notes:
- These are **DEFAULT** credentials for testing only
- Change passwords in production
- Health Officials and Data Entry Operators **CANNOT** reset passwords via the forgot password flow
- Only Doctors and Pharmacists can reset passwords themselves
- Patients use OTP-based login (no password)
