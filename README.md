# MangoSpace: Guest Posting Ecosystem

A premium, role-based marketplace that bridges the gap between SEO Agencies (Buyers), Content Publishers (Sellers), and Administrative Oversight. Built with architectural integrity, cryptographic security, and a strict moderated fulfillment loop.

---

### 🚀 The 60-Second Flow (How to use)

*   **Step 0: Listing & Approval (Seller/Admin)** $\rightarrow$ Login as Seller and **'Submit'** a website listing. The site remains **PENDING** and invisible to buyers until the Admin reviews and **'Approves'** it for the public Marketplace.
*   **Step 1: Purchase (Buyer)** $\rightarrow$ Once approved, the Buyer discovers the site in the Marketplace and purchases it using **Razorpay Test Mode**. (Status: `PAID`).
*   **Step 2: Fulfillment (Seller)** $\rightarrow$ The Seller sees the new order immediately. Click **'Accept'** (moves to `PROCESSING`), publishes the post, and **'Submits'** the live link for proof of work.
*   **Step 3: Verification (Admin)** $\rightarrow$ The Admin reviews the submitted proof. Clicking **'Verify & Complete'** finalizes the transaction and releases the payment to the Seller’s total earnings.

---

### 🧬 The Technical Edge (What differentiates us)

*   **Atomic Integrity**: Leveraging **Prisma Transactions ($transaction)** to ensure that payment verification, inventory updates (hiding sold sites), and order creation are executed as a single, atomic operation. No "ghost" sites, no lost data.
*   **Context-Aware Identity**: Custom **NextAuth.js (JWT Strategy)** implementation that maps social identities (Google/GitHub) to granular marketplace roles. This ensures a persistent User ID across role-switching while enforcing strict access control.
*   **Cryptographic Verification**: Every payout is locked behind a **SHA-256 HMAC** signature verification. The system re-calculates the payload on the server-side to prevent tampering or "phantom payments."
*   **Fulfillment Guardrails**: Built-in logic that prevents status manipulation. Sellers can *only* accept and submit links, while the Admin holds the final "Verify & Complete" authority to safeguard the Buyer's investment.

---

### 🧪 Live & Credentials 

*   **Live URL**: [https://green-mango.vercel.app](https://green-mango.vercel.app)
*   **Admin Access**: `admin@test.com` / `password123`
*   **Seller Access**: `seller@test.com` / `password123`
*   **Buyer Access**: `buyer@test.com` / `password123`
*   **Note**: Log in with your personal Google account to test the automatic **Role-Promotion** logic in the seed script!

---
*Built with Next.js 15, PostgreSQL (Neon), TailwindCSS, and framer-motion.*
