# MangoSpace — Mini Marketplace MVP

A full-stack, role-based marketplace where SEO agencies (Buyers) purchase guest posts from content publishers (Sellers), overseen by an Admin. Built end-to-end with Next.js 14, PostgreSQL, Prisma, and NextAuth.js.

---

## Reviewer Quick Access

The auth page has a **"Reviewer Quick Access"** panel at the top — three one-click buttons, no form, no typing.

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@test.com` | `password123` |
| **Seller** | `seller@test.com` | `password123` |
| **Buyer** | `buyer@test.com` | `password123` |

> Run the seed endpoint once before testing (see Setup Step 4).

---

## The End-to-End Flow

1. **A seller adds a website.** The listing is created with a `PENDING` status.
2. **The admin approves the website,** at which point it appears in the buy section (Marketplace).
3. **A buyer can purchase the item.** The checkout process securely processes the payment.
4. **Once purchased, a notification is sent** to both the admin and the seller (the order immediately appears in both dashboards with a `PAID` status).
5. **The seller confirms the transaction with a live link.** The seller accepts the order (`PROCESSING`) and submits the published article link.
6. **The admin assures and finalizes the process.** Admin reviews the live link and clicks 'Verify & Complete', moving the order to `COMPLETED`.

---

## Review Fixes & Improved Flow (OR Differentiation)

Based on the Original Review (OR), we have drastically improved data visibility and implemented robust checking standards:

- **Order & Pipeline Visibility:** Addressed the issue where orders were missing from dashboards. Admin now has a dedicated centralized "Order Pipeline" to monitor all new incoming orders immediately. Sellers now see their relevant orders directly under "Incoming Orders" on their dashboard.
- **Admin Review Accuracy:** Fixed the review list glitch. When a seller submits a website, it now reliably and immediately populates in the Admin's "Sites Pending Review" list.
- **Checking Standards & Roles:** Enforced strict backend validations. Sellers can only transition their orders to `PROCESSING` and provide live links, while only Admins have the authority to `APPROVE`/`REJECT` listings and `COMPLETE` orders.
- **Razorpay Implementation:** Replaced the previous dummy flow with a robust Razorpay payment integration. Payment completion securely triggers an atomic backend transaction (with cryptographic signature verification) that immediately updates the order status to `PAID` and the website status to `SOLD`, ensuring absolute data consistency.

---

## Order Status Flow

```
PENDING → PAID → PROCESSING → COMPLETED
                      ↓
                  REJECTED
```

| Status | Set by | Meaning |
|--------|--------|---------|
| `PENDING` | System | Order placed, awaiting payment |
| `PAID` | System | Payment confirmed, seller notified |
| `PROCESSING` | Seller | Seller accepted, writing in progress |
| `REJECTED` | Seller | Seller declined the order |
| `COMPLETED` | Admin | Admin verified the live post |

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional — only needed if you want Google sign-in
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Run database migrations

```bash
npx prisma migrate dev
```

### 4. Seed test data

With the dev server running, open this in your browser:

```
http://localhost:3000/api/seed
```

This creates/resets all three test accounts, sample website listings, and a test order. Run it any time you want a clean slate.

### 5. Run the development server

```bash
npm run dev
```

---

## Google OAuth — Rules & Constraints

### One Google account = one role, permanently

The database schema enforces `email UNIQUE` — each email maps to exactly one user row with one `role` field. This is intentional and correct: on a real marketplace (Airbnb, Fiverr, Upwork), you sign up once as either a buyer or a seller. You do not switch roles by logging in on a different portal.

**You cannot use the same Google account to access multiple portals.** Logging into the Buyer portal and the Seller portal with the same Google account will always show the same dashboard — because it is the same user in the database.

### Google OAuth is for real users signing up with a single, permanent role

A user who registers via Google on the Seller portal is a seller, always. Their Google account is their seller identity. If they want to also buy, they need a separate account with a separate email.

### For reviewing and testing: use the test accounts

The test accounts (`buyer@test.com`, `seller@test.com`, `admin@test.com`) are three separate users in the database with separate, fixed roles. These are the correct way to switch between roles during evaluation.

If you previously used Google to test and roles appear mixed up, re-run the seed endpoint — it hard-resets all test account roles to their correct values.

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `GET` | `/api/websites` | Public | List approved websites (marketplace) |
| `GET` | `/api/websites?my=true` | Seller | List seller's own websites |
| `GET` | `/api/websites?status=PENDING` | Admin | List pending websites |
| `POST` | `/api/websites` | Seller | Submit a new website listing |
| `PATCH` | `/api/websites/:id` | Admin | Approve or reject a listing |
| `GET` | `/api/orders` | Auth | Fetch orders (filtered by role) |
| `POST` | `/api/orders` | Buyer | Place a new order |
| `PATCH` | `/api/orders/:id` | Seller / Admin | Update order status |
| `GET` | `/api/seed` | Public | Reset all test data |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js — JWT strategy |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Validation | React Hook Form + Zod |

---

## Folder Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # register, [...nextauth]
│   │   ├── orders/         # GET / POST / PATCH
│   │   ├── websites/       # GET / POST / PATCH
│   │   └── seed/           # Reset test data
│   ├── auth/               # Login & role selection page
│   ├── dashboard/          # Role-based dashboard
│   └── marketplace/        # Public marketplace browse
├── components/
│   └── dashboard/
│       ├── AdminDashboard.tsx
│       ├── SellerDashboard.tsx
│       └── BuyerDashboard.tsx
├── contexts/
│   └── AuthContext.tsx      # Session → user state, logout
└── lib/
    ├── auth.ts              # Server-side session helper
    ├── auth-constants.ts    # NextAuth config
    └── prisma.ts            # Prisma client singleton
prisma/
└── schema.prisma            # Database schema & enums
```
