# Invyte Admin Dashboard

Admin console for the Invyte platform, built with React, Vite, Tailwind CSS, Redux Toolkit and axios.

## Modules

| Page | What it does |
|---|---|
| Dashboard | KPIs, monthly sign-ups (consumers vs vendors), bookings by status, revenue by source, recent bookings and users |
| All users / Consumers | Search, filter by role, status and verification; sort; activate/deactivate (signs the user out everywhere); detail drawer |
| Vendors | Approve or revoke vendors, see Stripe payout setup, services and bookings |
| Service categories | Create, edit, activate/deactivate and delete (a category that's in use can only be deactivated) |
| Vendor services | Browse every service, filter by category, hide or show it |
| Events · Bookings · Livestreams | Searchable, filterable lists with booking detail drawer |
| Payments · Vendor payouts | Stripe payments and transfers to vendors |
| Advertisements | Create ads, pause or resume them, see CTR and spend |
| Reports | Revenue totals and CSV export of user analytics |

## Setup

```bash
cp .env.example .env      # set VITE_API_URL if the API isn't on localhost:3000
npm install
npm run dev               # http://localhost:5173
```

Sign in with an **admin** account. Public sign-up never creates admins, so make one from the backend folder:

```bash
cd ../invyte_social_backend
node scripts/create-admin.js you@example.com 'a-strong-password' 'Your Name'   # new account
node scripts/create-admin.js existing@example.com                              # promote an existing user
```

## Structure

```
src/
  api/          axios client (token + automatic refresh), endpoint helpers
  store/        Redux Toolkit: auth, ui (sidebar, toasts), resources (all paginated lists), categories, stats
  hooks/        useResourceList (search/filter/sort/page → Redux fetch), useAction (row mutations + toasts)
  components/   layout (sidebar, top bar), ui (table, modal, drawer, badges, forms), charts
  pages/        one file per module
```

Build for production with `npm run build` (output in `dist/`).
