# 🥭 Green Mango Marketplace MVP

A complete, end-to-end guest posting marketplace workflow. This project is built as a robust proof-of-concept for a multi-role ecosystem, focusing on architectural integrity, secure transactions, and seamless user transitions.

---

## ✅ Project Scope & Requirements
This MVP fulfills the full technical criteria requested for a production-ready marketplace workflow:
- **Multi-Role User System**: Dedicated interfaces and permissions for **Buyers**, **Sellers**, and **Admins**.
- **Role Continuity**: Unique User IDs are maintained across roles. Switching from Buyer to Seller keeps your history linked to a single atomic identity.
- **Listing Lifecycle**: A complete flow allowing Sellers to create listings, which are then vetted and approved by Admins.
- **Fulfillment Loop**: Sellers submit "Live Links" for proof of work, which Admins verify before marking orders as `COMPLETED`.
- **Modern Tech Stack**: Built with **Next.js 15 (App Router)**, **PostgreSQL (Neon)** via **Prisma ORM**.
- **Secure Identity**: Implemented with **NextAuth.js** using a **JWT strategy** for efficient, edge-level session management.

---

## 🚀 Key Additional Features
- **Verified Google OAuth**: A context-aware social login that captures user intent (Buyer vs Seller).
  - *Note: As this is a test app, you may see an "Unverified App" warning from Google. Simply click 'Advanced' -> 'Go to MangoSpace' to proceed.*
- **Secure Payment Entry**: Fully integrated **Razorpay** workflow with server-side **SHA-256 HMAC** signature verification.
- **Edge RBAC Middleware**: Global route protection that enforces role-based access before pages are served.

---

## 🧬 The "Identity" Test (Architectural Verification)
To verify that our user history remains atomic across roles:
1. Log in with Google as a **Seller**.
2. Add a test website `test-site-1.com`.
3. **Logout** and log back in with the **same Google account** but select **Buyer**.
4. Go to the Marketplace. You will see your own `test-site-1.com` listed there for purchase. 
5. This proves your ID is constant, while the `session.role` provides a dynamic, role-based perspective.

---

## 🧪 Quick Start & Review
1.  **Deployment**: Live on Vercel at [https://green-mango.vercel.app](https://green-mango.vercel.app).
2.  **Test Accounts**: Quick-login buttons are available on the Sign In page.
3.  **Fulfillment Flow**:
    - **Seller**: Post a site.
    - **Admin**: Approve the site.
    - **Buyer**: Purchase the site (using Razorpay test mode).
    - **Fulfillment**: Seller submits a 'Live Link'.
    - **Completion**: Admin reviews the link and marks the order as `COMPLETED`.

> **Architectural Goal**: This project demonstrates a clean directory structure and a scalable REST API pattern, prioritizing functionality and the end-to-end user loop.
