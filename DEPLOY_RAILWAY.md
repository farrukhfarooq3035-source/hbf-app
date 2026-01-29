# Deploy HBF on Railway

Railway pe deploy karne ke liye ye steps follow karo. Cloudflare/OpenNext ki zaroorat nahi — sirf `npm run build` aur `next start`.

---

## 1. Railway account

1. [railway.app](https://railway.app) pe jao, **Login** (GitHub se sign in).
2. **New Project** kholo.

---

## 2. GitHub se deploy

1. **Deploy from GitHub repo** choose karo.
2. Repo select karo: `farrukhfarooq3035-source/hbf-app` (ya jo bhi tumhara repo hai).
3. **Root Directory** empty chhod do (ya `.`).
4. Railway khud **Next.js** detect karega; `railway.toml` se build/start use hoga:
   - **Build:** `npm run build`
   - **Start:** `npx next start -p $PORT`

Agar repo connect nahi kiya hai to pehle GitHub repo push karo, phir Railway mein **Add GitHub Repo** se connect karo.

---

## 3. Environment variables

Project → **Variables** → sab required env add karo (`.env.example` jaisa):

| Variable | Example | Notes |
|----------|---------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Server-side / admin use |
| `NEXT_PUBLIC_STORE_PHONE` | `03001234567` | Optional, "Call store" ke liye |

**Generate domain:** Project → **Settings** → **Networking** → **Generate Domain**. Jo URL mile (e.g. `hbf-app.up.railway.app`) use copy karo.

---

## 4. Supabase URL update

1. [Supabase Dashboard](https://supabase.com/dashboard) → apna project → **Authentication** → **URL Configuration**.
2. **Site URL:** `https://<tumhara-railway-domain>` (e.g. `https://hbf-app.up.railway.app`).
3. **Redirect URLs** mein add karo:  
   `https://<tumhara-railway-domain>/api/auth/callback/google`.

---

## 5. Google OAuth update

1. [Google Cloud Console](https://console.cloud.google.com) → apna project → **APIs & Services** → **Credentials**.
2. OAuth 2.0 Client ID kholo.
3. **Authorized JavaScript origins:** `https://<tumhara-railway-domain>`.
4. **Authorized redirect URIs:** `https://<tumhara-railway-domain>/api/auth/callback/google`.
5. Save karo.

---

## 6. Deploy trigger

- **GitHub connect:** `main` (ya default branch) pe push karte hi Railway naya deploy shuru karega.
- **Manual:** Railway dashboard se **Redeploy** bhi chala sakte ho.

---

## 7. Local test (optional)

Railway CLI se local pe same start command test kar sakte ho:

```bash
npm install -g @railway/cli
railway login
railway link   # project select karo
railway run npm run build
railway run npx next start -p $PORT
```

---

## Short checklist

- [ ] Railway project banao, GitHub repo connect karo.
- [ ] Env variables daalo (Supabase URL, anon key, service role key).
- [ ] Generate Domain karo, URL copy karo.
- [ ] Supabase Site URL + Redirect URLs update karo.
- [ ] Google OAuth origins + redirect URIs update karo.
- [ ] Push karo ya Redeploy karo.

Deploy ke baad app `https://<tumhara-railway-domain>` pe chalegi; mobile se bhi same URL use karo (HTTPS + Google login kaam karega).
