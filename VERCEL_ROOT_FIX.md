# "No Next.js version detected" — Fix (Root Directory)

Yeh error tab aata hai jab Vercel ko **package.json** (jisme `next` hai) nahi milta. Zyada tar **Root Directory** galat set hone ki wajah se.

---

## Step 1: Dono jagah Root Directory check karo

Vercel pe **Root Directory** do jagah ho sakta hai. **Dono** check karo aur **dono ko khali** karo.

### A. Settings → General

1. Vercel → apna **hbf-app** project kholo.
2. Upar **Settings** tab.
3. Left side **General**.
4. Neeche scroll karo → **Root Directory** section.
5. Agar kuch likha hai (e.g. `frontend`, `app`, `hbf-app`) → **Edit** → **delete** karke **khali** chhod do.
6. **Save** dabao.

### B. Settings → Build and Deployment

1. Same project → **Settings**.
2. Left side **Build and Deployment**.
3. **Root Directory** section dekho.
4. Input **khali** hona chahiye. Agar path hai to **clear** karo.
5. **Save** dabao.

---

## Step 2: Redeploy

1. **Deployments** tab pe jao.
2. Latest deployment ke saamne **⋯** (three dots) → **Redeploy**.
3. **Redeploy** confirm karo.

---

## Step 3: Agar phir bhi same error

**Naya Vercel project** banao (same repo se):

1. **vercel.com/new** → **Import** apna repo **hbf-app**.
2. **Configure Project** screen pe **Root Directory** ko **bilkul mat chhedna** — **khali** rehne do.
3. Env variables wapas add karo (Supabase URL, keys, store phone).
4. **Deploy** dabao.

Naye project mein Root Directory kabhi set nahi hua hoga, isliye build sahi directory se chalegi.

---

## Confirm: GitHub pe package.json repo root pe hai?

Browser: **https://github.com/farrukhfarooq3035-source/hbf-app**

Repo root pe ye dikhna chahiye: **package.json**, **src**, **vercel.json**, **next.config.js**.  
Agar **package.json** kisi **subfolder** ke andar hai to Root Directory mein **wo subfolder name** daalna padega (e.g. `HBF`).  
Agar sab **root** pe hai to Root Directory **khali** hona chahiye.
