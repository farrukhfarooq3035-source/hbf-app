# Sign-in ke baad galat deployment — Fix

**Issue:** Sign-in se pehle `hbf-fkcvls1jh-farrukhs-projects-e4480561.vercel.app` (updated) dikh raha hai, lekin sign-in ke baad `hbf-1ydsvjq1q-farrukhs-projects-86ed0370.vercel.app` (purana) open ho jata hai.

**Reason:** Supabase **Site URL** aur **Redirect URLs** mein 86ed0370 wala URL set hai. OAuth ke baad Supabase user ko wahi bhej raha hai.

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

## Kaunsi deployment production hai?

- **e4480561** = updated (HBF Deals, etc.)
- **86ed0370** = purani

Agar e4480561 production hai, to Supabase Site URL aur Redirect URLs dono mein e4480561 wala URL hona chahiye.

---

## Code Fix: NEXT_PUBLIC_APP_URL (Optional)

Dono Vercel projects (e4480561 aur 86ed0370) mein ye env var add karo:

**Vercel** → **hbf-app** → **Settings** → **Environment Variables**

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-PRODUCTION-URL.vercel.app` (e4480561 wala) |

(ya jo bhi tumhara production URL hai)

Isse sign-in ke baad redirect hamesha isi URL pe jayega, chahe user kisi bhi deployment pe ho.
