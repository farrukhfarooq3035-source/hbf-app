# Rider Location – Step by Step Guide

## Problem fix (links band ho gaye the)

Next.js mein `api/orders` ke andar do alag dynamic segment names the: `[id]` aur `[orderId]`. Is conflict ko fix kar diya gaya hai – ab sab routes `[id]` use karte hain. **Server / dev server dobara start karein** (e.g. `npm run dev`) taake links sahi kaam karein.

---

## 1. Admin panel se rider ki location kaise dekhen

1. **Admin open karein**  
   Browser mein jao: `https://your-site.com/admin` (ya local: `http://localhost:3000/admin`).

2. **Riders page pe jao**  
   Left sidebar se **Riders** pe click karein.

3. **Track location**  
   Jis rider ki location dekhni hai, usi row mein **Track location** (map pin icon) button pe click karein.

4. **Map modal**  
   Ek modal open hoga jisme store aur rider ki last known location map pe dikhegi.  
   - Agar map empty ya sirf store dikhe: rider ne abhi **Rider page** open karke **Start sharing location** nahi kiya hoga.  
   - Location tabhi update hoti hai jab rider `/rider` page open karke location share kar raha ho.

5. **Band karna**  
   Modal band karne ke liye outside click karein ya close button.

**Note:** Rider ko pehle **Rider app** (`/rider`) open karke "Start sharing location" karna zaroori hai; tab hi admin ko uski live location dikhegi.

---

## 2. Customer app (mobile/web) mein rider location kaise dekhen

1. **Order place karein**  
   Customer app se order do; order **On the Way** ho jaye (admin ne status "On the Way" kar diya aur rider assign kiya).

2. **Order tracking open karein**  
   - **My Orders** se us order pe tap karein, **ya**  
   - Direct link open karein: `/order/[order-id]` (e.g. confirmation pe diya link).

3. **Track your rider**  
   Jab order status **On the Way** ho:  
   - Page par **"Track your rider"** section dikhega.  
   - Neeche map hoga jisme **store** aur **rider** ki location dikhegi (agar rider location share kar raha hai).  
   - **Refresh** button se location dobara load kar sakte ho.

4. **Agar map nahi dikh rahi**  
   - Rider ne `/rider` page open karke "Start sharing location" kiya hoga tab hi location aati hai.  
   - Thodi der wait karke **Refresh** try karein.

---

## 3. Rider ko location share karwane ka tareeqa

Rider ki live location tab hi dikhegi jab rider khud location share kare:

1. **Rider page kholna**  
   Browser (mobile bhi chalega) mein open karein: `https://your-site.com/rider` (ya `http://localhost:3000/rider`).

2. **Rider select karna**  
   Dropdown se apna naam/phone select karein ("I am – Select rider").

3. **Start sharing**  
   **"Start sharing location"** button pe tap karein.  
   - Location permission allow karein (browser poochega).  
   - Jab "Sharing location" dikhe aur "Last sent: …" update ho, tab location share ho rahi hai.

4. **Delivery ke dauran**  
   Jab order deliver kar rahe hon, yeh page open rakhein (background mein bhi chal sakta hai) – admin aur customer dono aapki location map pe dekh sakte hain.

5. **Band karna**  
   **"Stop sharing"** pe tap karein jab location share band karni ho.

---

## 4. Kya kahin aur kuch add karna hai?

- **Admin:** Kuch extra add karne ki zarurat nahi – Riders page par **Track location** button se hi rider location dekhen.
- **Customer app:** Order tracking page par hi **Track your rider** section hai – koi naya page add karne ki zarurat nahi.
- **Rider:** Sirf `/rider` page use karna hai; koi alag app install nahi.

Agar **rider_locations** table abhi tak Supabase par nahi chala, toh pehle migration run karein:

```bash
# Supabase CLI se (project linked ho to)
supabase db push
# ya Supabase Dashboard > SQL Editor mein 005_rider_locations.sql ka content run karein
```

Iske baad dev server restart karein, phir admin aur app dono ke links sahi kaam karenge.
