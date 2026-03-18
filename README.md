# 🥭 Green Mango Marketplace MVP

A complete, end-to-end guest posting marketplace workflow. This project is built as a robust proof-of-concept for a multi-role ecosystem, focusing on architectural integrity, secure transactions, and seamless user transitions.

---

## ✅ Project Scope & Requirements
This MVP fulfills the full technical criteria requested for a production-ready marketplace workflow:
- **Multi-Role User System**: Dedicated interfaces and permissions for **Buyers**, **Sellers**, and **Admins**.
- **Listing Lifecycle**: A complete flow allowing Sellers to create listings, which are then vetted and approved by Admins.
- **Transactional Integrity**: Clear order status tracking from `PENDING` through `APPROVED`, `REJECTED`, and finally `COMPLETED`.
- **Modern Tech Stack**: Built with **Next.js 15 (App Router)**, **PostgreSQL (Neon)** via **Prisma ORM**, and **Tailwind CSS**.
- **Secure Identity**: Implemented with **NextAuth.js** using a **JWT strategy** for efficient, edge-level session management.

---

## 🚀 Key Additional Features
To ensure the platform is ready for real-world scenarios, we have included several key integrations beyond the initial scope:
- **Verified Google OAuth**: A context-aware social login that captures user intent (Buyer vs Seller) during sign-up for a zero-friction experience.
- **Secure Payment Entry**: Fully integrated **Razorpay** workflow with server-side **SHA-256 HMAC** signature verification to ensure financial security.
- **Edge RBAC Middleware**: Global route protection that enforces role-based access before pages are served, preventing unauthorized dashboard access.
- **Fluid User Interface**: Leveraged **Framer Motion** for polished interactions and micro-animations, ensuring a premium feel throughout the platform.

---

## 🧪 Quick Start & Review
1.  **Deployment**: Live on Vercel at [https://green-mango.vercel.app](https://green-mango.vercel.app).
2.  **Test Accounts**: Quick-login buttons are available on the Sign In page for immediate testing of all three roles.
3.  **Core Check**:
    - **Seller**: Post a new site listing.
    - **Admin**: Approve the site.
    - **Buyer**: Purchase the approved site in the marketplace.
    - **Fulfillment**: Seller marks the order as completed.

> **Architectural Goal**: This project demonstrates a clean directory structure and a scalable REST API pattern, prioritizing functionality and the end-to-end user loop.
