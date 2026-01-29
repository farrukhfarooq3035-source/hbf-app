# Customer Sign-In (Google) – Setup

Customer app uses **Supabase Auth** with **Sign in with Google** only.

## 1. Supabase – URL Configuration

1. Go to **Authentication** → **URL Configuration**
   - **Site URL**:  
     - Dev: `http://localhost:3000`  
     - Production: **apna live app ka URL** – jahan app deploy hai, woh likho.  
       - Vercel: `https://your-app-name.vercel.app`  
       - Netlify: `https://your-app-name.netlify.app`  
       - Custom domain: `https://haqbahoofoods.com` (jaise bhi domain ho)
   - **Redirect URLs** mein add karo:
     - `http://localhost:3000/auth/callback`
     - Production: `https://YOUR_LIVE_APP_URL/auth/callback`  
       (e.g. `https://hbf-ordering.vercel.app/auth/callback` – apna URL lagao)

Save. Bina iske Google sign-in redirect nahi chalega.

## 2. Google OAuth (Sign in with Google)

1. [Google Cloud Console](https://console.cloud.google.com/) → project select/create karo.
2. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**.
   - Application type: **Web application**.
   - **Authorized JavaScript origins** mein add karo:
     - `http://localhost:3000` (dev)
     - Production: **apna live app URL** (e.g. `https://hbf-ordering.vercel.app` ya `https://haqbahoofoods.com`)
   - **Authorized redirect URIs** mein add karo:
     - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`  
       (Supabase project ref: **Project Settings** → **General** se milta hai.)

3. **Client ID** aur **Client Secret** copy karo.
4. **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
   - Enable **Google**
   - **Client ID** aur **Client Secret** paste karo → Save.

Iske baad login page par **Sign in with Google** kaam karega.

## 3. Flow

- **Menu (no sign-in):** User menu dekh sakta hai, cart use kar sakta hai.
- **Sign in:** Header → “Sign in” → **Sign in with Google** (one click) → signed in.
- **After sign-in:** Header mein Orders, Cart, Profile.
- **Protected:** `/orders`, `/order/[id]`, `/checkout` ke liye sign-in zaroori; nahi to `/login?next=...` pe redirect.
- **Sign out:** Profile panel → “Sign out”.

## 4. Admin vs Customer

- **Admin panel** (`/admin/*`): Live Order button, Cart bar nahi; order tracking sirf customer app mein.
- **Customer app:** Sign in (Google) → Orders, Profile, Live order button, Cart.
