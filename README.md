# 🥭 Green Mango Marketplace MVP

A production-grade, end-to-end guest posting marketplace workflow. Inspired by platforms like **Adsy** and **Vefogix**, this MVP focuses on a robust architectural foundation with a clear multi-role permission system and secure transaction flow.

---

## 🏗️ Core Requirements Fulfilled
This project implements the full marketplace lifecycle as requested:
- **Comprehensive Role System**: Deep integration of **Buyer**, **Seller**, and **Admin** roles with secure route guarding.
- **Listing Lifecycle**: Sellers can create website listings which are queued for Admin verification before appearing in the marketplace.
- **End-to-End Order Flow**: 
  - **PENDING**: New orders created after payment verification.
  - **APPROVED/REJECTED**: Admin oversight for order legitimacy.
  - **COMPLETED**: Seller-side fulfillment tracking.
- **REST & JWT Security**: Built on **Next.js 16 (App Router)** with **NextAuth.js** using a **JWT strategy** for efficient identity management.
- **PostgreSQL Persistence**: Leveraging **Neon PostgreSQL** with **Prisma ORM** for a clean, relational database design.

---

## ⭐ Advanced Implementations (The Green Mango Delta)
In addition to the core flow, we have included several professional-grade features to demonstrate production readiness:

### 1. Context-Aware Identity Engine
Utilizes **NextAuth.js** to capture user intent (Buyer vs Seller) during the OAuth handshake, automatically synchronizing roles to the database upon first login.

### 2. Cryptographic Payment Verification (Razorpay)
Integrated a secure **Razorpay** workflow. Orders are only generated inside an atomic **`prisma.$transaction`** after a server-side **SHA-256 HMAC** signature verification using the `crypto` library.

### 3. Edge-Level RBAC Middleware
Enforces role-based permissions at the network edge, ensuring session stability and preventing unauthorized access to cross-portal dashboards.

### 4. High-End UI UX
- **Framer Motion**: Smooth micro-animations for dashboard transitions.
- **Zero-Scroll Auth**: Optimized 100vh layouts for a "native-app" feel.
- **Responsive Design**: Clean, minimalistic interface accessible across all device sizes.

---

## 🚀 Deployment
Live on Vercel with automated Prisma generation:
[https://green-mango.vercel.app](https://green-mango.vercel.app)

> **Architectural Note**: Folder structure follows a modular, feature-based pattern ( `/src/app/api`, `/src/components/dashboard`, `/src/contexts`) for clear maintainability and separation of concerns.
