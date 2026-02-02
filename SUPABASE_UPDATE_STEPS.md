# Supabase Update — Login ke baad sahi URL pe jane ke liye

**Issue:** Login ke baad `hbf-1ydsvjq1q-farrukhs-projects-86ed0370.vercel.app` open ho raha hai (purana).

**Root fix:** Supabase ko batana hai ke redirect **e4480561** pe kare, 86ed0370 pe nahi.

---

## Steps (5 min)

### 1. Supabase Dashboard kholo

1. **https://supabase.com** → Login
2. Apna **HBF project** select karo

### 2. URL Configuration

1. Left sidebar → **Authentication**
2. **URL Configuration** pe click karo

### 3. Site URL change karo

**Site URL** (sabse upar) mein ye daalo:

```
https://hbf-73205vde9-farrukhs-projects-e4480561.vercel.app
```

(ya jo bhi tumhara e4480561 production URL hai — Vercel e4480561 project → Deployments → latest → Visit)

### 4. Redirect URLs update karo

**Redirect URLs** list mein:

1. **Purane 86ed0370 wale URLs hatao** (agar hain)
2. **Ye add karo:**
   ```
   https://hbf-73205vde9-farrukhs-projects-e4480561.vercel.app/**
   https://hbf-ador5msip-farrukhs-projects-86ed0370.vercel.app/**
   ```

   (Pehla = e4480561, doosra = 86ed0370 backup — 86ed0370 pe ab redirect code hai, wahan se e4480561 pe redirect ho jayega)

### 5. Save

**Save** dabao.

---

## Test

1. **Incognito/private window** kholo
2. e4480561 URL open karo: `https://hbf-73205vde9-farrukhs-projects-e4480561.vercel.app`
3. **Sign In** → Google se login karo
4. Login ke baad tumhe **e4480561** pe hi rehna chahiye (86ed0370 pe nahi jana chahiye)
