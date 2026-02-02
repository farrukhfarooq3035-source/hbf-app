# e4480561 Project se Link karne ke Steps

**Project ID:** `prj_WVLTKgPTRJyfaEPJT3vHUvZoN90b` ✓ (ye sahi hai)

**Issue:** e4480561 team ka **orgId (Team ID)** chahiye. CLI mein sirf 86ed0370 team dikh rahi hai.

---

## Step 1: e4480561 Team ID nikalo

1. **vercel.com** pe login karo
2. **farrukhs-projects-e4480561** team select karo (top-left dropdown)
3. **Settings** (team settings) → **General**
4. **Team ID** copy karo (format: `team_xxxxxxxxxxxxxxxx`)

   Ya browser URL dekho jab e4480561 team select ho:
   - `vercel.com/teams/team_XXXXX/...` — yahan `team_XXXXX` = Team ID

---

## Step 2: `.vercel/project.json` update karo

`.vercel/project.json` mein ye daalo:

```json
{
  "projectId": "prj_WVLTKgPTRJyfaEPJT3vHUvZoN90b",
  "orgId": "TEAM_ID_YAHAN_DAALO"
}
```

`TEAM_ID_YAHAN_DAALO` ki jagah Step 1 se copy kiya Team ID paste karo.

---

## Step 3: Deploy karo

```bash
cd c:\Users\ART\Desktop\HBF
npx vercel --prod --yes
```

---

## Alternative: Vercel Dashboard se Deploy

Agar CLI se kaam na ho:

1. **vercel.com** → **e4480561** team → **hbf-app**
2. **Deployments** → **Create Deployment**
3. **Import Git Repository** — GitHub repo connect karo (agar nahi hai)
4. `main` branch pe push = auto deploy
