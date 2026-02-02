# Vercel Auto-Deploy Fix — Commits pe deploy kyun nahi ho raha?

Agar push ke baad Vercel pe automatic deployment nahi ho rahi, yeh steps check karo.

---

## ⚠️ IMPORTANT: Local sahi hai, Vercel purana dikha raha hai?

Agar **local pe latest updates** (Top Sale removed, HBF Deals section, etc.) dikh rahe hain lekin **Vercel pe purana** — matlab Vercel purane build se serve kar raha hai.

### Fix: Fresh deployment from latest commit

1. **Vercel Dashboard** → **hbf-app** → **Deployments**
2. Har deployment ke saamne **Git commit** dikhta hai (e.g. `104fbae`, `adbbdf4`)
3. **Latest commit** (GitHub pe jo sabse upar hai) wala deployment dhoondo
4. Agar **koi bhi deployment latest commit se nahi hai** → Naya deployment trigger karo:
   - **Deploy Hook** use karo (Settings → Git → Deploy Hooks) — URL pe POST request bhejo
   - Ya **Vercel CLI**: `vercel login` → `vercel --prod --force`
5. **"Redeploy"** pe mat jao agar wo purane deployment ka ho — wo same purana code hi deploy karega
6. **Verify**: Page pe right-click → Inspect → `<html>` tag mein `data-build="104fbae"` jaisa dikhna chahiye (latest commit ke first 7 chars)

---

## 1. Git Integration (Sabse common issue)

### Vercel → Account Settings
1. **vercel.com** → Profile icon → **Account Settings**
2. Left side **Authentication** pe jao
3. **Git** section mein dekho — **GitHub** connected hai?
4. Agar **Not connected** ya **Reconnect** dikhe → **Connect** karo
5. GitHub pe login karke **Authorize** karo
6. **Repository access** mein ensure karo: **All repositories** ya **hbf-app** specifically selected hai

---

## 2. Project Git Connection

### Vercel → hbf-app → Settings → Git
1. **vercel.com** → **hbf-app** project kholo
2. **Settings** → **Git**
3. **Connected Git Repository** check karo — `farrukhfarooq3035-source/hbf-app` dikhna chahiye
4. Agar **Disconnected** hai → **Connect Git Repository** → GitHub se **hbf-app** select karo

---

## 3. Production Branch

### Settings → Git → Production Branch
- **Production Branch** = `main` hona chahiye (jahan tum push karte ho)
- Agar `master` ya koi aur set hai, change karke `main` karo

---

## 4. Commit Author = Vercel User

Vercel sirf un commits pe deploy karta hai jinka **author** Vercel account se linked ho.

### Check commit author:
```bash
git log -1 --format="%ae %an"
```

### GitHub pe verify:
- Ye email GitHub account ke **Primary email** se match karna chahiye
- Vercel account bhi same email se linked hona chahiye

### Agar alag hai:
```bash
git config --global user.email "tumhara-github-email@example.com"
git config --global user.name "farrukh215-!"
```

---

## 5. GitHub pe Vercel Bot Comments

Push ke baad GitHub commit/PR pe **Vercel Bot** comment karta hai:
- ✅ Success: "Deployment ready" ya build link
- ❌ Fail: "Git author must have access" ya error message

Agar **koi comment nahi aa raha** → Git integration sahi se connected nahi hai.

---

## 6. Vercel Activity Log

1. **vercel.com** → **Dashboard** → **Activity** (left sidebar)
2. Recent commits dekho — koi error dikh raha hai?
3. "Git author must have access" → Commit author ko Vercel team mein add karo

---

## 7. Workaround: Deploy Hook + GitHub Action

Agar upar wale steps ke baad bhi auto-deploy nahi ho rahi, **Deploy Hook** use karke GitHub Action se deploy trigger kar sakte ho:

### Step A: Vercel pe Deploy Hook banao
1. **hbf-app** → **Settings** → **Git**
2. Neeche **Deploy Hooks** section
3. **Create Hook** → Name: `github-push` → Branch: `main`
4. **Copy** the generated URL (e.g. `https://api.vercel.com/v1/integrations/deploy/...`)

### Step B: GitHub Secret add karo
1. **github.com/farrukhfarooq3035-source/hbf-app** → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** → Name: `VERCEL_DEPLOY_HOOK` → Value: (jo URL copy kiya)
3. **Add secret**

### Step C: GitHub Action add karo
`.github/workflows/deploy.yml` file banao (agar nahi hai) — next step mein code diya hai.

---

## 8. Force Clean Build (Cache issue ho to)

Agar deployment ho rahi hai lekin purana code aa raha hai:

1. **Vercel** → **hbf-app** → **Settings** → **Environment Variables**
2. Add: `VERCEL_FORCE_NO_BUILD_CACHE` = `1`
3. Phir naya deploy trigger karo

Ya **Redeploy** karte waqt: **"Use existing Build Cache"** UNCHECK karo.

---

## Quick Reconnect (Often fixes it)

1. Vercel → **hbf-app** → **Settings** → **Git**
2. **Disconnect** repository
3. Phir **Connect** → GitHub → **hbf-app** select karo
4. Ek test commit push karo:
   ```bash
   git commit --allow-empty -m "test: trigger vercel deploy"
   git push
   ```

---

## Support

Agar sab try karke bhi nahi chal raha: **vercel.com/help** pe jao, latest commit SHA share karo.
