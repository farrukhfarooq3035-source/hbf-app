# Sign-in ke baad galat deployment — Fix

**Issue:** Sign-in se pehle e4480561 (updated) dikh raha hai, lekin sign-in ke baad 86ed0370 (purana) open ho jata hai.

**Fix applied:** Code mein redirect add kiya — jab bhi user 86ed0370 pe land kare, turant e4480561 pe redirect ho jayega.

---

## Fix: Supabase Dashboard

1. **supabase.com** → apna project kholo
2. **Authentication** → **URL Configuration**
3. **Site URL** change karo:
   - Purana (galat): `https://hbf-xxx-farrukhs-projects-86ed0370.vercel.app`
   - Naya (sahi): `https://hbf-fkcvls1jh-farrukhs-projects-e4480561.vercel.app`
   - Ya agar custom domain hai: `https://your-domain.com`

4. **Redirect URLs** mein ye add karo (purane 86ed0370 wale hatao ya dono rakho):
   ```
   https://hbf-fkcvls1jh-farrukhs-projects-e4480561.vercel.app/auth/callback
   https://*.farrukhs-projects-e4480561.vercel.app/auth/callback
   ```
   - Agar wildcard support nahi hai, to har deployment ke liye alag add karna padega
   - **Better:** Agar tumhara stable URL hai (e.g. `hbf-app.vercel.app`), to woh use karo:
   ```
   https://hbf-app.vercel.app/auth/callback
   https://your-custom-domain.com/auth/callback
   ```

5. **Save** dabao

---

## Important

- **Deployment URLs** (hbf-xxx-xxx.vercel.app) har deploy pe change hoti hain
- **Stable URL** use karo: custom domain ya Vercel ka main project URL
- Dono teams (e4480561, 86ed0370) mein se **ek hi** ko production banao
- Supabase mein **us production URL** ko set karo

---

## Code Fix (Applied)

- **RedirectToProduction** component: Jab user 86ed0370 pe land kare, turant e4480561 pe redirect
- **Project link:** Ab deployments e4480561 team pe jayengi (`vercel link` + `git push`)

## NEXT_PUBLIC_APP_URL (Agar redirect sahi URL pe na jaye)

**Vercel** → **hbf-app** (e4480561) → **Settings** → **Environment Variables**

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://hbf-app-farrukhs-projects-e4480561.vercel.app` |

(Agar production URL alag hai to woh daalo — Vercel dashboard → Domains se check karo)
