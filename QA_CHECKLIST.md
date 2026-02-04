# QA Checklist

Manual test flow covering the new walk-in/POS features and data safety.

## 1. Walk-in / POS orders
1. Open **Admin → Walk-in POS**.
2. Add at least 2 products to the cart, apply discount/tax, choose each service type (Walk-in, Dine-in, Takeaway) and place an order.
3. Confirm order appears immediately in **Admin → Orders** with the proper channel badge, table/token metadata, and without rider assignment for dine-in/walk-in.

## 2. Invoice & kitchen ticket
1. From **Admin → Orders**, locate the order created above.
2. Click **Print Invoice** → verify browser preview shows totals, taxes, discounts, and customer info.
3. Click **Ready Ticket** → lightweight layout should only include item list, channel, and table/token information.

## 3. Payment ledger
1. Inside the same order card, expand **Payment ledger**.
2. Record a partial payment and verify the paid/due amounts update instantly.
3. Inspect `/api/admin/payments?order_id=...` (network tab) to confirm ledger entries are persisted.

## 4. Channel filters (dashboard + reports)
1. On **Admin → Dashboard**, use the channel dropdown to switch between `All`, `Walk-in`, `Dine-in`, `Takeaway`, `Online`. Cards, charts, today’s orders, and bestsellers should reflect the filter.
2. On **Admin → Reports**, repeat the filter check. Exports/printouts must include the channel column.

## 5. Notifications & rider handoff
1. Open **Admin → Orders** plus ensure browser notifications are allowed.
2. Place an online order from the customer app → observe notification body includes `Online`.
3. Place a POS order → notification body should display `Walk-in` or `Dine-in` + table/token hints, and rider assignment UI should be hidden for those channels.

## 6. Data backups
1. Confirm Supabase project has automatic nightly backups enabled (Settings → Database → Backups).
2. Perform an ad-hoc manual backup: `supabase db dump --project-ref <project-ref> --db-url <service-role-url>` and store the dump in secure storage.
3. Document restore steps (import SQL dump into staging) and verify checksums.

Recording these checks per release ensures the walk-in pipeline, ledger math, invoices, and data protection remain healthy.
