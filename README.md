# HBF - Haq Bahu Foods Smart Ordering Platform

A modern, mobile-first Progressive Web App for Haq Bahu Foods - order online, manage orders, generate marketing posters, and track sales. for Haq Bahu Foods - order online, manage orders, generate marketing posters, and track sales.

## Tech Stack

- **Frontend:** Next.js 14, React, TailwindCSS, Zustand, React Query
- **Backend:** Supabase (Auth, Database, Storage, Realtime)
- **AI:** OpenAI DALL-E 3 (Poster Generator)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migrations in SQL Editor (in order):
   - Copy and run `supabase/migrations/001_initial_schema.sql`
   - Then `supabase/migrations/002_order_ratings.sql` (order ratings)
   - Then `supabase/migrations/003_order_timestamps_distance.sql` (ready_at, delivered_at, distance_km)
   - ... through `012_happy_hour_products_reviews.sql` (Happy Hour products, customer reviews)
   - Continue with `013_walkin_orders.sql` through `019_admin_users.sql`, `020_admin_users_allow_read.sql`, and `021_invoice_admin_profile.sql` (walk-in, invoice, admin users, admin profile for bills)
3. Create storage buckets: Supabase Dashboard → Storage → New bucket → create `posters` (for AI posters) and `products` (for product images), both set to Public
4. Enable Realtime on the `orders` table (included in migration)

### 3. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
```

### 4. Seed Menu

1. Start the dev server: `npm run dev`
2. Go to Admin → Import Menu
3. Click "Load Seed Menu (Preview)" then "Confirm Import to Supabase"

Or call the API directly:

```bash
curl -X POST http://localhost:3000/api/seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Deploy (Vercel)

See [DEPLOY.md](DEPLOY.md) for full steps. Quick deploy:

1. Push code to GitHub
2. [vercel.com/new](https://vercel.com/new) → Import repo → Add env vars → Deploy
3. Add Vercel URL to Supabase Auth (Site URL, Redirect URLs) and Google OAuth

## Features

### Customer PWA (Mobile)
- Browse menu by category
- Search products
- Delivery/Pickup toggle
- Product detail with size options
- Cart with sticky bottom bar
- Checkout (COD)
- Real-time order tracking

### Admin Panel (Desktop)
- **Dashboard:** Today sales, orders, pending count, sales chart
- **Orders:** Kanban (New → Preparing → Ready → On the Way → Delivered)
- **Products:** CRUD, category assign, image upload
- **Deals:** CRUD combo deals
- **Poster Generator:** AI-generated marketing posters (HBF style)
- **Import Menu:** Load seed dataset from menu images
- **Riders:** CRUD, status toggle
- **Inventory:** Stock items, in/out logs, low stock alerts
- **Expenses:** Daily expense entries by category
- **Reports:** Sales vs expenses, profit, daily chart

## PWA

- Manifest at `/manifest.json`
- Add icons to `public/` (icon-192.png, icon-512.png) and update manifest

## Database Tables

- `categories` - Menu categories
- `products` - Menu items with prices, sizes
- `deals` - Combo deals
- `deal_items` - Products in deals
- `orders` - Customer orders (Realtime enabled)
- `order_items` - Line items
- `riders` - Delivery riders
- `inventory` - Stock items
- `inventory_logs` - Stock in/out
- `expenses` - Expense entries

## Design

- **Primary:** Red (#E50914)
- **Accent:** Yellow (#FFC83D)
- **Background:** White
- **Text:** Dark (#1E1E1E)
- Mobile-first, rounded cards, bold typography

