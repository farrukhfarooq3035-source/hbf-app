# Redirect Fix — Step by Step (Jab 86ed0370 se e4480561 pe redirect na ho)

---

## Step 1: Production URL nikalo (e4480561 project)

1. Browser mein **https://vercel.com** kholo
2. Login karo (GitHub se)
3. Left side **"Farrukh's projects"** (ya jo team hai) pe click karo
4. **e4480561** wali team select karo (updated deployment wali)
5. **hbf-app** project pe click karo
6. Upar **Settings** tab pe jao
7. Left sidebar mein **Domains** pe click karo
8. Jo **Production** domain dikhe (e.g. `hbf-xxx-farrukhs-projects-e4480561.vercel.app` ya custom domain) — usko copy karo
9. Agar koi domain nahi dikhe, to **Deployments** tab pe jao → latest deployment kholo → **Visit** button ke paas jo URL hai woh copy karo (e.g. `https://hbf-73205vde9-farrukhs-projects-e4480561.vercel.app`)

---

## Step 2: 86ed0370 project mein env var add karo

1. **vercel.com** pe hi raho
2. Left side se **86ed0370** wali team select karo (purani deployment wali)
3. **hbf-app** project pe click karo
4. Upar **Settings** tab pe jao
5. Left sidebar mein **Environment Variables** pe click karo
6. **Add New** → **Key** pe click karo
7. **Name** mein likho: `NEXT_PUBLIC_APP_URL`
8. **Value** mein woh URL paste karo jo Step 1 mein copy kiya (e.g. `https://hbf-73205vde9-farrukhs-projects-e4480561.vercel.app`)
   - **Important:** URL ke end mein `/` mat rakho
9. **Environment** mein **Production** select karo
10. **Save** dabao

---

## Step 3: Redeploy (env var apply hone ke liye)

1. Same 86ed0370 project mein **Deployments** tab pe jao
2. Latest deployment ke saamne **⋯** (three dots) pe click karo
3. **Redeploy** select karo
4. **Redeploy** confirm karo

   **Agar "This deployment can not be redeployed" aaye:**
   - Koi chota change karo (e.g. comment add karo), commit + push karo
   - Naya deployment automatically ban jayega

---

## Step 4: Test karo

1. **86ed0370** wala URL open karo (e.g. `https://hbf-xxx-farrukhs-projects-86ed0370.vercel.app`)
2. Page load hote hi tumhe **e4480561** wale URL pe redirect hona chahiye
3. Sign in karke bhi check karo — redirect sahi hona chahiye
