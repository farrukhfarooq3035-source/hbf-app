# e4480561 pe Deploy ka Fix

**Problem:** Push karne pe bhi `hbf-xxx-farrukhs-projects-e4480561.vercel.app` update nahi ho raha.

**Solution:** Deploy Hook use karo — har push pe e4480561 pe auto-deploy.

**Zaroori:** Pehle e4480561 project ko GitHub se connect karo (Settings → Git → Connect). Phir Deploy Hook banao.

---

## Step 1: e4480561 pe Deploy Hook banao

1. **vercel.com** → **farrukhs-projects-e4480561** team
2. **hbf-app** project → **Settings** → **Git**
3. Neeche **Deploy Hooks** section dhundho
4. **Create Hook** pe click karo
5. **Name:** `GitHub Push`
6. **Branch:** `main`
7. **Create** dabao
8. **URL copy karo** (jaise `https://api.vercel.com/v1/integrations/deploy/xxxxx`)

---

## Step 2: GitHub pe Secret add karo

1. **github.com** → **farrukhfarooq3035-source/hbf-app** repo
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**
4. **Name:** `VERCEL_DEPLOY_HOOK`
5. **Value:** Step 1 se copy kiya URL paste karo
6. **Add secret**

---

## Step 3: Push karo

```bash
git commit --allow-empty -m "chore: trigger deploy"
git push
```

GitHub Action run hoga → Deploy Hook call hoga → e4480561 pe naya deploy start hoga.

---

## Verify

1. **github.com** → repo → **Actions** tab — workflow green hona chahiye
2. 2–3 min baad **vercel.com** → e4480561 → **Deployments** — naya deployment dikhega
3. Site open karo — `data-build` latest commit dikhana chahiye
