# Cloudflare pe HBF deploy (OpenNext)

Vercel ki jagah **Cloudflare Workers** pe deploy karne ke liye ye steps follow karo.

---

## 1. Dependencies install karo

```bash
cd c:\Users\ART\Desktop\HBF
npm install
```

---

## 2. Cloudflare account

- [dash.cloudflare.com](https://dash.cloudflare.com) pe sign up / login karo.
- **Workers & Pages** section use hoga.

---

## 3. GitHub se connect karo

1. **dash.cloudflare.com** → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Apna **GitHub** repo select karo (e.g. **hbf-app**).
3. **Configure build:**
   - **Framework preset:** Next.js (Static HTML) **nahi** — **None** ya **Custom** choose karo.
   - **Build command:** `npm run cf:build`  
     (ya direct: `npx opennextjs-cloudflare build`)
   - **Build output directory:** `.open-next` (ya Cloudflare ke Next.js guide ke hisaab se — agar auto-detect ho to chhod do).
   - **Root directory:** khali (repo root).
4. **Environment variables** add karo (Settings → Environment variables ya build configure ke time):

   | Name | Value | Environment |
   |------|--------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Production |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Production |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Production |
   | `NEXT_PUBLIC_STORE_PHONE` | `03001234567` | Production (optional) |

5. **Save** → **Deploy** / build start karo.

---

## 4. Agar Cloudflare “Build” step mein cf:build nahi chalata

Cloudflare Pages/Workers kabhi-kabhi **Wrangler** se deploy karta hai. Tab ye try karo:

- **Build command:** `npm install && npx opennextjs-cloudflare build`
- **Build output directory:** (Cloudflare Next.js doc ke hisaab — agar wo **Upload** mode use kare to alag steps ho sakte hain.)

Agar **Workers** use ho rahe hon (Git integration ke through), to Cloudflare ka **“Build configuration”** doc dekho:  
[Cloudflare Next.js deploy](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-nextjs-site)

---

## 5. CLI se deploy (alternative)

Agar Git connect nahi karna, to direct Wrangler se deploy kar sakte ho:

1. **Wrangler login:**  
   ```bash
   npx wrangler login
   ```
2. **Build + Deploy:**  
   ```bash
   npm run deploy
   ```
3. Env vars **local** ke liye: **Workers & Pages** → apna project → **Settings** → **Variables** mein add karo (production).  
   Ya **wrangler.jsonc** mein `vars` use karo (sirf non-secret values).

---

## 6. Google OAuth (live site)

Deploy ke baad jo **Cloudflare URL** mile (e.g. `https://hbf-app.pages.dev`):

1. **Google Cloud Console** → Credentials → OAuth Client → **Authorized JavaScript origins** → Add: `https://hbf-app.pages.dev`
2. **Supabase** → Authentication → URL Configuration → **Site URL** = `https://hbf-app.pages.dev`  
   **Redirect URLs** mein add: `https://hbf-app.pages.dev/**`

---

## 7. Short

| Step | Kya karna hai |
|------|----------------|
| 1 | `npm install` (OpenNext + Wrangler install honge) |
| 2 | Cloudflare → Workers & Pages → Create → Connect to Git |
| 3 | Build command: `npm run cf:build` (ya `npx opennextjs-cloudflare build`) |
| 4 | Env vars add karo (Supabase URL, anon key, service role, store phone) |
| 5 | Deploy karo; phir Google + Supabase mein Cloudflare URL daalo |

**Local preview (Cloudflare runtime):**  
`npm run preview` — build + local Workers preview.

**Direct deploy:**  
`npm run deploy` — build + Cloudflare pe deploy (Wrangler login zaroori).
