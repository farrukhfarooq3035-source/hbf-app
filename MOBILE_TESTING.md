# Mobile par app test karne ke steps (Step by Step)

Mobile par **customer app** (order, cart, checkout) aur **rider app** dono chal sakte hain. Admin Panel mobile pe **nahi** dikhega.

---

## Links — Kaun kahan login karega (apna IP: 10.52.79.151)

**Mobile pe ye URLs use karo (PC pe `npm run dev:mobile` chala hua ho, same WiFi):**

| Kaun | URL (copy-paste karo) |
|------|------------------------|
| **App (home)** | `http://10.52.79.151:3000` |
| **User login** | `http://10.52.79.151:3000/login` |
| **Rider login** | `http://10.52.79.151:3000/rider/login` |
| **Rider app** | `http://10.52.79.151:3000/rider` |

| Kaun | Kaise login |
|------|-------------|
| **Customer (user)** | `/login` kholo → **Sign in with Google** |
| **Rider** | `/rider/login` kholo → apna naam select karo → **PIN** daalo → **Log in** → phir `/rider` pe app (deliveries, Mark delivered) |

**Short:** User → `/login` (Google). Rider → `/rider/login` (naam + PIN) → `/rider`.

---

## Mobile pe Google login — IP (10.52.79.151) save nahi hoti

**Google OAuth** Authorized JavaScript origins mein **IP address allow nahi karta** (na `http://10.52.79.151:3000` na koi aur IP). Isliye woh URI save nahi hoti. Google sirf **domain names** (aur `http://localhost:PORT`) allow karta hai.

**Do workaround:**

---

### Option A: ngrok se temporary HTTPS URL (local test ke liye)

1. [ngrok](https://ngrok.com/) download karo (free account se 1 tunnel).
2. PC pe app chalao: `npm run dev` (port 3000).
3. Naye terminal mein:
   ```bash
   ngrok http 3000
   ```
4. ngrok ek URL dega, jaise: `https://abc123.ngrok-free.app`
5. **Google Cloud Console** → Credentials → OAuth Client → **Authorized JavaScript origins** mein **"+ Add URI"** → ye daalo:
   ```
   https://abc123.ngrok-free.app
   ```
   (apna ngrok URL daalna — har run pe change ho sakta hai, to ngrok free account mein custom subdomain bhi le sakte ho.)
6. **Authorized redirect URIs** mein Supabase callback pehle se hai — theek hai. **Supabase Dashboard** → Authentication → URL Configuration → **Site URL** ko bhi ngrok URL pe set karo (e.g. `https://abc123.ngrok-free.app`) taaki login ke baad redirect wahi pe ho.
7. **Save** karo. Mobile pe browser mein **ngrok wala URL** kholo (e.g. `https://abc123.ngrok-free.app`) — Google login ab mobile pe bhi chal jana chahiye.

**Note:** Har baar ngrok chalaoge to naya URL mil sakta hai (free plan). Naya URL aaye to Google Console mein naya origin add karna padega.

---

### Option B: App deploy karo (Vercel / Netlify), phir woh URL add karo

1. App ko **Vercel** (ya Netlify) pe deploy karo. Deploy ke baad URL milega, jaise: `https://hbf-xyz.vercel.app`
2. **Google Cloud Console** → Credentials → OAuth Client → **Authorized JavaScript origins** → **"+ Add URI"**:
   ```
   https://hbf-xyz.vercel.app
   ```
   (apna deployed URL daalna)
3. **Save** karo.
4. Mobile pe **deployed URL** kholo — Google login wahan theek chalega.

**Summary:** IP (`http://10.52.79.151:3000`) Google save nahi karega. Use **ngrok URL** (Option A) ya **deployed site URL** (Option B) Authorized JavaScript origins mein add karo.

---

## Step 1: Project ready karo

1. **Terminal** kholo (VS Code ya CMD/PowerShell).
2. Project folder mein jao:
   ```bash
   cd c:\Users\ART\Desktop\HBF
   ```
3. Dependencies install karo (agar pehle nahi ki):
   ```bash
   npm install
   ```

---

## Step 2: Dev server network par chalao

1. Same terminal mein yeh command chalao:
   ```bash
   npm run dev:mobile
   ```
2. Jab tak "Ready" ya "compiled" na dikhe, wait karo.
3. Server **band mat karo** — chalta rehne do.

---

## Step 3: PC ka IP address pata karo

1. **Naya** terminal/PowerShell window kholo (pehla band mat karo).
2. Ye command chalao:
   ```bash
   ipconfig
   ```
3. **"Wireless LAN adapter Wi-Fi"** (ya jo WiFi use ho raha ho) ke niche dekho.
4. **"IPv4 Address"** copy karo — jaise:
   - `192.168.1.5`
   - ya `10.0.0.8`

---

## Step 4: Mobile aur PC same WiFi par hon

- Mobile aur laptop/donon **same WiFi network** par connect hon (same router).

---

## Step 5: Mobile browser se app kholo

1. Mobile par **Chrome** ya **Safari** kholo.
2. Address bar mein ye URL daalo (Wi‑Fi 2 / current network ke hisaab se):
   ```
   http://10.52.79.151:3000
   ```
   Agar IP change ho (dusra WiFi / router) to `ipconfig` se naya **IPv4 Address** dekho aur usse replace karo.
3. Enter dabao.
4. **Deployed site** use kar rahe ho to direct URL open karo, jaise: `https://your-app.vercel.app`

---

## Step 6: App use karo

- **Customer:** Home pe **Order Now** → Menu → order, cart, checkout. Login ke liye **Sign in** / **Profile** → `/login` pe **Sign in with Google**.
- **Rider:** Mobile browser mein `/rider/login` open karo (jaise `http://192.168.1.5:3000/rider/login`) → apna naam select karo → PIN daalo → Log in → `/rider` pe deliveries, location share, **Mark delivered** + **Payment received**.

---

## Agar mobile pe app open na ho

1. **`npm run dev:mobile` chala hua ho:** Sirf `npm run dev` se mobile se connect nahi hoga. **`npm run dev:mobile`** use karo taaki server `0.0.0.0` par listen kare.
2. **Firewall:** Windows Defender / antivirus mein **port 3000** allow karo, ya temporarily firewall off karke try karo.
3. **Same WiFi:** Mobile aur PC dono **same WiFi** par hon (same router).
4. **IP sahi ho:** `ipconfig` wala **IPv4 Address** hi use karo (jaise `192.168.1.5`); VPN off karo.
5. **URL format:** `http://IP:3000` (https nahi, local ke liye http). Deployed site pe `https://...` use karo.

---

## Home screen par add karna (PWA)

- Mobile browser mein app kholne ke baad:
  - **Chrome (Android):** Menu (⋮) → "Add to Home screen".
  - **Safari (iPhone):** Share → "Add to Home Screen".
- Icon home screen par aa jayega — next time wahi se open kar sakte ho.

---

## Summary

| Step | Kya karna hai |
|------|----------------|
| 1 | `cd HBF` → `npm install` |
| 2 | **`npm run dev:mobile`** chalao (normal `dev` se mobile open nahi hoga), band mat karo |
| 3 | Naye terminal mein `ipconfig` → IPv4 copy karo |
| 4 | Mobile + PC same WiFi par |
| 5 | Mobile browser: `http://<APNA_IP>:3000` (ya deployed URL) |
| 6 | Customer: Order Now / **Login:** `/login` → Google. Rider: **`/rider/login`** → naam + PIN → `/rider` |

**Login links (apne network pe — IP: 10.52.79.151):**  
- **App home:** `http://10.52.79.151:3000`  
- **User login:** `http://10.52.79.151:3000/login` → Sign in with Google  
- **Rider login:** `http://10.52.79.151:3000/rider/login` → Select rider name → PIN → Log in  
- **Rider app (login ke baad):** `http://10.52.79.151:3000/rider`
