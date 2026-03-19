# 🥭 MangoSpace: Guest Posting Ecosystem

A premium, role-based marketplace that bridges the gap between SEO Agencies (Buyers), Content Publishers (Sellers), and Administrative Oversight. Built with architectural integrity, cryptographic security, and a strict fulfillment loop.

---

### 🚀 The 60-Second Flow (How to use)

*   **Step 1: Login as Buyer** $\rightarrow$ Navigate to the Marketplace and purchase a premium website listing using **Razorpay Test Mode**. (Status: `PAID`).
*   **Step 2: Login as Seller** $\rightarrow$ Spot the new order in your 'Incoming Orders' list. Click **'Accept'** to move it to `PROCESSING`, then publish the guest post and **'Submit'** the live link.
*   **Step 3: Login as Admin** $\rightarrow$ Review the submitted link in the Admin Dashboard. Click **'Verify & Complete'** to finalize the transaction and release funds to the Seller’s total earnings.

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
