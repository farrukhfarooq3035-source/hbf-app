# Vercel par HBF deploy (Live)

## 1. Vercel account

- [vercel.com](https://vercel.com) pe sign up / login karo (GitHub se link kar sakte ho).

## 2. GitHub pe code push karo (pehli baar)

Agar repo abhi GitHub pe nahi hai:

1. [github.com/new](https://github.com/new) pe jao → naya repo banao (jaise `hbf-app`), **Create repository**.
2. Terminal/PowerShell mein HBF folder mein:
   ```bash
   cd c:\Users\ART\Desktop\HBF
   git init
   git add .
   git commit -m "Initial commit - HBF app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/hbf-app.git
   git push -u origin main
   ```
   `YOUR_USERNAME` ki jagah apna GitHub username daalna. (`.env` file add nahi hogi — `.gitignore` mein hai.)

## 3. Vercel pe deploy (GitHub se — recommended)

1. [vercel.com/new](https://vercel.com/new) kholo.
2. **Import Git Repository** → apna GitHub repo (HBF) select karo. **Import** dabao.
3. **Environment Variables** add karo (yahi pe ya baad mein Project → Settings → Environment Variables):

   | Name | Value | Notes |
   |------|--------|--------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Supabase anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase service role key (backend) |
   | `NEXT_PUBLIC_STORE_PHONE` | `03001234567` | Store phone (optional) |

   Ye values apne `.env` se copy kar sakte ho (Supabase Dashboard → Settings → API).

4. **Deploy** dabao. Build complete hone ke baad live URL milega, jaise: `https://hbf-xyz.vercel.app`. Is URL ko copy karo — Google OAuth aur Supabase ke liye chahiye.

## 4. Google OAuth (mobile / live site ke liye)

1. **Google Cloud Console** → APIs & Services → Credentials → OAuth 2.0 Client.
2. **Authorized JavaScript origins** mein **"+ Add URI"** → apna Vercel URL daalo:
   ```
   https://hbf-xyz.vercel.app
   ```
   (apna Vercel URL daalna)
3. **Save** karo.

## 5. Supabase (Site URL)

1. **Supabase Dashboard** → Authentication → **URL Configuration**.
2. **Site URL** = apna Vercel URL set karo, jaise: `https://hbf-xyz.vercel.app`
3. **Redirect URLs** mein bhi add karo (agar list hai): `https://hbf-xyz.vercel.app/**`

Iske baad live site pe Google login theek chalega.

## 6. CLI se deploy (optional)

```bash
cd c:\Users\ART\Desktop\HBF
npm i -g vercel
vercel login
vercel
```

Env vars pehli baar CLI se deploy pe add karne ke liye: `vercel env add NEXT_PUBLIC_SUPABASE_URL` (aur baaki bhi) ya Vercel dashboard se add karo.

---

**Live URL:** Deploy ke baad Vercel apna URL dega — usi ko mobile pe bhi use karo; Google login wahi pe work karega.
