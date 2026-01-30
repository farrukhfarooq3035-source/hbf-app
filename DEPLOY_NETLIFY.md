# Deploy HBF on Netlify

Netlify pe deploy karne ke liye ye steps follow karo. Next.js auto-detect hota hai — sirf GitHub connect karo aur env vars daalo.

---

## 1. Netlify account

1. [netlify.com](https://www.netlify.com) pe jao, **Sign up** / **Log in** (GitHub se).
2. **Add new site** → **Import an existing project**.

---

## 2. GitHub se connect

1. **Connect to Git provider** → **GitHub** choose karo.
2. **Authorize Netlify** — agar pehli baar ho to GitHub pe Netlify ko access do.
3. **Pick a repository** — list se **HBF** (ya **hbf-app**) select karo.
4. **Branch to deploy:** `main` (ya jo default branch hai).
5. **Build settings** Netlify khud set karega (Next.js detect):
   - **Build command:** `npm run build`
   - **Publish directory:** **khali chhodo** (empty) — Next.js ke liye Netlify khud set karta hai. Agar yahan koi path (e.g. repo root) set ho to 404 aa sakta hai.
6. **Deploy site** click karo.

---

## 3. Environment variables

Site deploy hone ke baad:

1. **Site settings** → **Environment variables** → **Add a variable** / **Add from .env**.
2. Ye variables add karo (`.env.example` jaisa):

| Variable | Example | Notes |
|----------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | **Zaroori** — Admin product add + Import menu iske bina fail honge |
| `NEXT_PUBLIC_STORE_PHONE` | `03001234567` | Optional |

3. **Save** karo, phir **Trigger deploy** → **Deploy site** (taaki nayi env vars build mein aayein).

---

## 3.1 If build fails: "Secrets scanning found secrets"

Agar build log mein **"Secret env var NEXT_PUBLIC_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_URL's value detected"** aaye, to Netlify in vars ko secret samajh raha hai aur build output (.next) mein inlined values dekh kar fail kar raha hai.

**Fix (Netlify UI):**

1. **Site configuration** → **Environment variables** → **Add a variable** → **Add a single variable**.
2. **Key:** `SECRETS_SCAN_OMIT_KEYS`  
   **Value:** `NEXT_PUBLIC_SUPABASE_ANON_KEY,NEXT_PUBLIC_SUPABASE_URL`
3. **Create variable** → phir **Deploys** → **Trigger deploy** → **Deploy site**.

Ye Netlify ko batata hai ke in do keys ke values build output mein hone ki ijazat hai (NEXT_PUBLIC_* vars Next.js client/server bundles mein intentionally inlined hote hain).

---

## 4. Site URL (Supabase + Google OAuth)

1. Netlify pe site ka URL milega, jaise: `https://hbf-app.netlify.app` ya `https://random-name-123.netlify.app`.
2. **Site settings** → **Domain management** se custom domain add kar sakte ho (optional).
3. Jo bhi final URL ho (e.g. `https://hbf-app.netlify.app`), use copy karo.

---

## 5. Supabase URL update

1. [Supabase Dashboard](https://supabase.com/dashboard) → apna project → **Authentication** → **URL Configuration**.
2. **Site URL:** `https://<tumhara-netlify-url>` (e.g. `https://hbf-app.netlify.app`).
3. **Redirect URLs** mein add karo:  
   `https://<tumhara-netlify-url>/**`  
   aur  
   `https://<tumhara-netlify-url>/api/auth/callback/google`.

---

## 6. Google OAuth update

1. [Google Cloud Console](https://console.cloud.google.com) → apna project → **APIs & Services** → **Credentials**.
2. OAuth 2.0 Client ID kholo.
3. **Authorized JavaScript origins:** `https://<tumhara-netlify-url>`.
4. **Authorized redirect URIs:** `https://<tumhara-netlify-url>/api/auth/callback/google`.
5. Save karo.

---

## 7. Redeploy

Env vars add karne ke baad **Deploys** → **Trigger deploy** → **Deploy site** chalao taaki nayi build chal jaye.

---

## Short checklist

- [ ] Netlify pe **Add new site** → **Import from GitHub**.
- [ ] Repo **HBF** / **hbf-app** select karo, branch `main`.
- [ ] **Environment variables** mein Supabase URL, anon key, service role key daalo.
- [ ] Deploy ke baad **Site URL** copy karo.
- [ ] Supabase **Site URL** + **Redirect URLs** update karo.
- [ ] Google OAuth **origins** + **redirect URIs** update karo.
- [ ] **Trigger deploy** chalao (env vars ke baad).

Deploy ke baad app `https://<tumhara-netlify-url>` pe chalegi; mobile se bhi same URL use karo.
