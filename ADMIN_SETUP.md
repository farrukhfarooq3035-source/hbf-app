# Admin Login Setup

Admin panel uses **Email + Password** login. Admin users are stored in the `admin_users` table.

## 1. Run Migrations

Run in Supabase SQL Editor (in order):
- `019_admin_users.sql` – creates `admin_users` table, adds `Admin@gmail.com`
- `020_admin_users_allow_read.sql` – allows read for admin check (fixes redirect loop)

## 2. Create Admin User in Supabase Auth

1. **Supabase Dashboard** → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - **Email:** `Admin@gmail.com` (or your admin email)
   - **Password:** Your password (min 6 chars)
4. Click **Create user**

## 3. Add Admin Email to Table

If your email is different from `Admin@gmail.com`, run in **SQL Editor**:

```sql
INSERT INTO admin_users (email) VALUES ('your-email@example.com')
ON CONFLICT (email) DO NOTHING;
```

## 4. Enable Email Provider

1. **Authentication** → **Providers** → **Email**
2. Ensure **Email** is **Enabled**
3. Save

## 5. Login

- Go to **https://your-app.vercel.app/admin**
- You'll be redirected to **/admin/login**
- Enter email and password
- Click **Sign in**

## Multiple Admins

Add each admin email to `admin_users`:

```sql
INSERT INTO admin_users (email) VALUES ('admin2@example.com')
ON CONFLICT (email) DO NOTHING;
```
