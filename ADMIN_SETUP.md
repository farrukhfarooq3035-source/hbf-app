# Admin Login Setup

Admin panel uses **Email + Password** login. Admin users must be created in Supabase and given the `admin` role.

## 1. Create Admin User in Supabase

1. **Supabase Dashboard** → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - **Email:** e.g. `admin@haqbahu.com`
   - **Password:** Strong password (min 6 chars)
4. Click **Create user**

## 2. Set Admin Role

1. In **Authentication** → **Users**, find the user you created
2. Click the user to open details
3. Scroll to **User Metadata** / **Raw User Meta Data**
4. Click **Edit** and add:
   ```json
   {
     "role": "admin"
   }
   ```
   Or in **App Metadata** (if available):
   ```json
   {
     "role": "admin"
   }
   ```
5. **Save**

> **Note:** Supabase Dashboard may not show App Metadata. Use **SQL Editor** to set admin role:
> ```sql
> UPDATE auth.users
> SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
> WHERE email = 'admin@haqbahu.com';
> ```

## 3. Enable Email Provider (if not already)

1. **Authentication** → **Providers** → **Email**
2. Ensure **Email** is **Enabled**
3. Save

## 4. Login

- Go to **https://your-app.vercel.app/admin** (or `/admin`)
- You'll be redirected to **/admin/login**
- Enter email and password
- Click **Sign in**

## Multiple Admins

Repeat steps 1–2 for each admin (Admin 1, Admin 2, etc.). Each needs:
- Unique email
- Password
- `app_metadata.role = "admin"`
