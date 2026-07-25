# Lestova ERP — Komaki EV Multi-Outlet (UI Demo)

A clickable, front-end **UI demo** of a multi-outlet ERP for **Lestova Vehicles India Pvt Ltd**,
which retails **Komaki** e-scooters through partner-owned outlets. Built for the client
pitch meeting — realistic mock data, no backend.

> **Demo build** — all data is mock/in-memory and resets on refresh. This is a UI
> prototype to align on scope and screens before development.

## The core idea

Lestova HQ is central; each outlet is a **partnership** co-owned with a local partner.
The ERP enforces:

- **Outlet isolation** — outlet staff & partners see *only their own* inventory, sales,
  expenses and staff.
- **Central visibility** — HQ (Super Admin / Admin) sees *everything*, consolidated,
  and can drill into any single outlet.
- **Read-only cross-outlet lookup** — anyone can check stock availability in sister
  outlets (quantities only) without seeing their financials or customers.

## Try the demo

```bash
npm install
npm run dev      # open the printed localhost URL
# or a production preview:
npm run build && npm run preview
```

### Walk-through for the meeting

1. Use the **role switcher** (top-right) to log in as **Rahul Menon — Partner, Calicut**.
   Notice the outlet is *locked* and Procurement is hidden.
2. A walk-in wants a colour that's out of stock → **Cross-Outlet Lookup** finds it in a
   sister outlet.
3. **Sales & Billing → New sale**: bundle a scooter + accessories + a free gift, then run
   **Daily closure** (pushes to HQ).
4. Switch to **Vishnu Prasad — Super Admin**: the **HQ Command Center** now shows the
   consolidated roll-up; raise a **Purchase Order** to a vendor for low stock.
5. Approve a **Stock Transfer** between outlets.
6. Open **Profit Sharing** — the quarterly revenue/expense split per partnership contract %.

## Modules

| Area | Screens |
|------|---------|
| Dashboards | HQ Command Center · Outlet Dashboard |
| Inventory | Vehicles (chassis/motor no.) · Spare Parts · Accessories · Compliment/free-gift stock |
| Availability | Cross-Outlet Stock Lookup (read-only) |
| Procurement | Vendors · Purchase Orders · Stock Transfers |
| Operations | Sales & Billing · Daily Closure · Daily Expenses · People & Attendance |
| Insights | Date-to-date Reports · 3-Month Profit Sharing |
| Admin | Settings — Outlets & Partners, Users & Roles, Komaki Model Master |

## Roles

| Role | Sees |
|------|------|
| **Super Admin** (Lestova owner) | Everything, all outlets, edit master data |
| **Admin** (HQ manager) | Everything, approvals, procurement |
| **Franchise Owner** (partner) | Own outlet only + own profit share |
| **Employee** | Own outlet, no procurement, clock-in/out |

## Tech

React + Vite + Tailwind CSS + React Router + Recharts. Data isolation is enforced in one
place (`src/lib/store.jsx`) so every screen is scoped consistently. Mock data lives in
`src/data/db.js`.

Design is intentionally neutral/clean — brand colours, logo and styling to be applied per
the client's design constraints.
