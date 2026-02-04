# QA Checklist

Manual test flow covering the new walk-in/POS features and data safety.

## 1. Walk-in / POS orders
1. Open **Admin → Walk-in POS**.
2. Add at least 2 products to the cart, apply discount/tax, choose each service type (Walk-in, Dine-in, Takeaway) and place an order.
3. Confirm order appears immediately in **Admin → Orders** with the proper channel badge, table/token metadata, and without rider assignment for dine-in/walk-in.

## 2. Invoice auto-generation
1. Place an online order from the customer app and mark it **Ready** in **Admin → Orders**. Confirm the card now shows a receipt number, invoice status `issued`, and the invoice can be printed immediately.
2. Place a POS order via **Walk-in POS**. Confirm invoice metadata (`receipt_number`, issued timestamp, status) is set the moment the order is created.

## 3. Invoice editing & printing
1. From **Admin → Orders**, open an order and click **Edit Invoice**.
2. Add a product via the product search, adjust quantity/price of an existing line item, and remove another item. Save the invoice.
3. Verify the order card totals reflect the changes (subtotal, total, dues) and `last_invoice_edit_at` updates in Supabase.
4. Click **Print Invoice**; the PDF preview must show the new line items, updated totals, receipt number, and issued timestamp.
5. Click **Ready Ticket** → lightweight layout should only include the item list, channel badge, and table/token information.

## 4. Payment ledger
1. Inside the same order card, expand **Payment ledger**.
2. Record a partial payment and verify the paid/due amounts update instantly.
3. Inspect `/api/admin/payments?order_id=...` (network tab) to confirm ledger entries are persisted.

## 5. Customer ↔ Admin chat
1. Sign in as a customer, open **Order tracking**, and start a chat from the new panel. Confirm messages appear instantly (no refresh) and are persisted via `/api/orders/:id/chat`.
2. While logged into the admin panel (user metadata `role=admin`), verify the unread badge appears on the corresponding order card. Open the chat drawer and confirm history + live updates stream without refresh.
3. Reply as admin and ensure the customer chat updates immediately. Leave the drawer; send another customer message and confirm unread badge + browser notification (granted via `NewOrderAlert`) fire.
4. Refresh the admin orders page and ensure unread state persists based on `order_chat_threads.unread_for_admin`.

## 6. Premium Sales Record
1. Visit **Admin → Sales Record**. Filter by multiple channels and date ranges; table should update instantly.
2. Scroll the spreadsheet-style grid (sticky headers, zebra rows) and confirm totals at the top (revenue, paid, dues) match expectations.
3. Export CSV; open in Excel/Sheets to ensure numbers and columns (subtotal, discount, tax, delivery, invoice status, receipt #) are correct.

## 7. Channel filters (dashboard + reports)
1. On **Admin → Dashboard**, use the channel dropdown to switch between `All`, `Walk-in`, `Dine-in`, `Takeaway`, `Online`. Cards, charts, today’s orders, and bestsellers should reflect the filter.
2. On **Admin → Reports**, repeat the filter check. Exports/printouts must include the channel column.

## 8. Notifications & rider handoff
1. Open **Admin → Orders** plus ensure browser notifications are allowed.
2. Place an online order from the customer app → observe notification body includes `Online`.
3. Place a POS order → notification body should display `Walk-in` or `Dine-in` + table/token hints, and rider assignment UI should be hidden for those channels.

## 9. Data backups
1. Confirm Supabase project has automatic nightly backups enabled (Settings → Database → Backups).
2. Perform an ad-hoc manual backup: `supabase db dump --project-ref <project-ref> --db-url <service-role-url>` and store the dump in secure storage.
3. Document restore steps (import SQL dump into staging) and verify checksums.

Recording these checks per release ensures the walk-in pipeline, invoice workflows, sales reporting, and data protection remain healthy.
