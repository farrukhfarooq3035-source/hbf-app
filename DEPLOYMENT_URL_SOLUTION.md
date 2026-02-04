# HBF Deployment URL – Complete Solution

## ✅ Working Production URL (USE THIS)

| Use | URL |
|-----|-----|
| **Customer App** | https://hbf-app-kappa.vercel.app/menu |
| **Admin Panel** | https://hbf-app-kappa.vercel.app/admin |
| **Login** | https://hbf-app-kappa.vercel.app/login |
| **Download / QR** | https://hbf-app-kappa.vercel.app/download |

---

## ⚠️ e4480561 URL – Purana / 404 (DO NOT USE)

- `hbf-farrukhs-projects-e4480561.vercel.app` / `hbf-xxx-farrukhs-projects-e4480561.vercel.app`
- **Problem:** Redeploy karne pe bhi 2 din purana content dikh raha hai, ya 404 aata hai.
- **Reason:** e4480561 aur kappa **alag Vercel projects** hain. kappa GitHub se latest le raha hai; e4480561 purana/cached ho sakta hai.
- **Solution:** Sirf **hbf-app-kappa.vercel.app** use karo. e4480561 ko ignore karo.

---

## Step-by-Step Fix (kappa use karo)

### 1. Vercel Environment Variable

1. **vercel.com** → **hbf-app** (kappa wala project) → **Settings** → **Environment Variables**
2. Add/Update:
   - **Name:** `NEXT_PUBLIC_APP_URL`
   - **Value:** `https://hbf-app-kappa.vercel.app`
   - **Environment:** Production
3. **Save** → **Redeploy**

---

### 2. Supabase Auth URLs

1. **supabase.com** → Project → **Authentication** → **URL Configuration**
2. **Site URL:** `https://hbf-app-kappa.vercel.app`
3. **Redirect URLs** mein add karo:
   ```
   https://hbf-app-kappa.vercel.app/**
   https://*.vercel.app/**
   ```
4. **Save**

---

### 3. Google OAuth (agar use ho raha hai)

1. **Google Cloud Console** → Credentials → OAuth Client
2. **Authorized JavaScript origins:** `https://hbf-app-kappa.vercel.app`
3. **Authorized redirect URIs:** `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. **Save**

---

### 4. QR Codes / Print

- Purane QR codes jo **e4480561** URL pe point karte hain → **404 de rahe hain**
- **Fix:** Admin panel kholo **kappa** se: https://hbf-app-kappa.vercel.app/admin/download
- Naya QR download/print karo — ye **kappa** URL use karega

---

## Quick Checklist

- [ ] `NEXT_PUBLIC_APP_URL` = `https://hbf-app-kappa.vercel.app` (Vercel)
- [ ] Supabase Site URL + Redirect URLs = kappa
- [ ] Google OAuth = kappa (agar use ho)
- [ ] Naye QR codes print karo (kappa se admin open karke)
