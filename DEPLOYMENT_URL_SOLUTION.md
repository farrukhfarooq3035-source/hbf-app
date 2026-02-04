# HBF Deployment URL – Complete Solution

## Problem Summary

- **GitHub:** https://github.com/farrukhfarooq3035-source/hbf-app (commit f8018b2)
- **Deployment dikh raha hai:** `hbf-bjahxdqru-farrukhs-projects-e4480561.vercel.app`
- **Confusion:** Har deploy pe URL change kyon hota hai? Kaunsa URL use karein?

---

## Vercel URL Structure (Important)

| URL Type | Example | Kab use hota hai |
|----------|---------|-------------------|
| **Production (stable)** | `https://hbf-farrukhs-projects-e4480561.vercel.app` | Latest production deployment – **ye use karo** |
| **Deployment-specific** | `https://hbf-bjahxdqru-farrukhs-projects-e4480561.vercel.app` | Sirf us commit ka preview – har deploy pe change |

**Production URL** (`hbf-farrukhs-projects-e4480561.vercel.app`) hamesha latest production deployment pe point karta hai. Deployment-specific URL (`hbf-xxx-xxx`) sirf preview ke liye hai.

---

## Step-by-Step Fix

### 1. Apna Production URL Confirm karo

1. **vercel.com** → **farrukhs-projects-e4480561** team
2. **hbf-app** project kholo
3. **Settings** → **Domains**
4. Jo **Production** domain dikhe (e.g. `hbf-farrukhs-projects-e4480561.vercel.app`) – woh copy karo

Agar Domains mein kuch nahi dikhe, to **Deployments** → latest deployment → **Visit** – URL ke andar `hbf-xxx-farrukhs-projects-e4480561.vercel.app` hoga. Production URL usually `hbf-farrukhs-projects-e4480561.vercel.app` hota hai (beech wala random part hatao).

---

### 2. Vercel Environment Variable Set karo

1. **Vercel** → hbf-app → **Settings** → **Environment Variables**
2. Add/Update:
   - **Name:** `NEXT_PUBLIC_APP_URL`
   - **Value:** `https://hbf-farrukhs-projects-e4480561.vercel.app` (apna production URL)
   - **Environment:** Production
3. **Save**
4. **Redeploy** karo (Deployments → latest → ⋯ → Redeploy)

---

### 3. Supabase Auth URLs Update karo

1. **supabase.com** → Project → **Authentication** → **URL Configuration**
2. **Site URL:** `https://hbf-farrukhs-projects-e4480561.vercel.app`
3. **Redirect URLs** mein add karo:
   ```
   https://hbf-farrukhs-projects-e4480561.vercel.app/**
   https://*.farrukhs-projects-e4480561.vercel.app/**
   ```
4. **Save**

---

### 4. Google OAuth (agar use ho raha hai)

1. **Google Cloud Console** → Credentials → OAuth Client
2. **Authorized JavaScript origins:**
   - `https://hbf-farrukhs-projects-e4480561.vercel.app`
3. **Authorized redirect URIs:**
   - `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
4. **Save**

---

### 5. GitHub Deploy Hook (agar auto-deploy nahi ho raha)

1. **Vercel** → hbf-app → **Settings** → **Git** → **Deploy Hooks**
2. **Create Hook** → Name: `GitHub Push`, Branch: `main` → **Create**
3. URL copy karo
4. **GitHub** → repo → **Settings** → **Secrets and variables** → **Actions**
5. **New repository secret** → Name: `VERCEL_DEPLOY_HOOK`, Value: (paste URL)
6. **Add secret**

Ab har `git push` pe GitHub Action Deploy Hook call karega → Vercel pe naya deploy.

---

## Final Links (Share karne ke liye)

| Use | URL |
|-----|-----|
| **Customer App** | https://hbf-farrukhs-projects-e4480561.vercel.app/menu |
| **Admin Panel** | https://hbf-farrukhs-projects-e4480561.vercel.app/admin |
| **Login** | https://hbf-farrukhs-projects-e4480561.vercel.app/login |

---

## Custom Domain (Optional – sabse stable)

Agar `order.haqbahu.com` ya similar chahiye:

1. **Vercel** → hbf-app → **Settings** → **Domains** → **Add**
2. Domain daalo (e.g. `order.haqbahu.com`)
3. DNS mein CNAME: `cname.vercel-dns.com`
4. **Supabase** aur **Google OAuth** mein bhi ye domain add karo

Custom domain se URL kabhi nahi badlega.

---

## Quick Checklist

- [ ] Vercel production URL confirm (`hbf-farrukhs-projects-e4480561.vercel.app`)
- [ ] `NEXT_PUBLIC_APP_URL` Vercel env var set
- [ ] Supabase Site URL + Redirect URLs update
- [ ] Google OAuth origins/redirects update (agar use ho)
- [ ] Deploy Hook + GitHub secret (agar auto-deploy chahiye)
- [ ] Redeploy karke test karo
