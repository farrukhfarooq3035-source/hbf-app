# Vercel + GitHub Auto-Deploy Setup

Jab Vercel pe **GitHub se login** karte ho, tab deployment thek aati hai. Yeh steps follow karo taake **GitHub push** pe automatic deploy ho:

---

## Step 1: Vercel pe GitHub se Login

1. **vercel.com** → **Login** → **Continue with GitHub**
2. Jo GitHub account use karo jisme **farrukhfarooq3035-source/hbf-app** repo ka access hai

---

## Step 2: Project Git Connect (Dashboard se)

1. **vercel.com** → **farrukhs-projects-86ed0370** team select karo
2. **hbf-app** project kholo
3. **Settings** → **Git**
4. **Connect Git Repository** pe click karo
5. **GitHub** select karo
6. **farrukhfarooq3035-source/hbf-app** repo select karo
7. **Production Branch** = `main` set karo
8. **Connect** dabao

---

## Step 3: GitHub App Permissions (agar repo nahi dikhe)

1. **GitHub.com** → Profile → **Settings** → **Applications**
2. **Installed GitHub Apps** → **Vercel** pe click karo
3. **Repository access** check karo
4. **farrukhfarooq3035-source/hbf-app** selected hona chahiye
5. Agar nahi hai → **Configure** → **Only select repositories** → hbf-app add karo

---

## Step 4: Verify

1. Koi bhi change karo, commit + push karo:
   ```bash
   git add .
   git commit -m "test: trigger deploy"
   git push
   ```
2. **Vercel Dashboard** → **Deployments** pe naya deployment dikhna chahiye
3. 1–2 min mein **Ready** ho jayega

---

## Current Setup

- **Repo:** https://github.com/farrukhfarooq3035-source/hbf-app
- **Vercel Project:** farrukhs-projects-86ed0370/hbf-app
- **Production URL:** https://hbf-app.vercel.app (ya jo domain set hai)

CLI se `vercel git connect` fail hua kyunki Vercel account (farrukh215) ko GitHub repo ka access nahi hai. Dashboard se connect karte waqt GitHub OAuth se proper permissions mil jayengi.
