# 🥭 Green Mango: Premium Marketplace Senior MVP

A high-performance guest posting ecosystem built for reliability, security, and enterprise-grade scalability. This isn't just a CRUD app—it's a production-ready financial and identity engine.

---

## 🔥 Why This Implementation is Superior

Most guest posting demos are single-role and insecure. **Green Mango** goes "out of the box" with:

### 🛡️ 1. Context-Aware Identity (Identity-at-the-Edge)
Unlike standard OAuth flows, we capture **user intent** before the handshake. 
- **Dynamic Persona Sync**: Users clicking "Start Selling" have their specific role automatically synchronized to the database upon Google Login. No extra profile forms required.
- **RBAC Middleware**: Role-Based Access Control is enforced at the server edge using **JWT session tokens**, ensuring zero unauthorized portal-hopping.

### 💳 2. Cryptographic Payment Handshake
We don't trust client-side success events. 
- **SH-256 Signature Verification**: Every Razorpay transaction is verified server-side using the `crypto` library.
- **Atomic Transactions**: Orders are created inside a `prisma.$transaction`. An order only exists in our DB if the cryptographic handshake with Razorpay is 100% verified.

### ⚡ 3. Enterprise Performance
- **Serverless PostgreSQL (Neon)**: Low-latency database with connection pooling for high-concurrency.
- **Micro-Animations**: Uses `framer-motion` for professional UI responsiveness, ensuring a premium "Tier 1" feels.
- **Zero-Scroll Auth**: Optimized 100vh layouts for native-level UX.

---

## 🛠️ Technical Stack
- **Next.js 16 (App Router)** & **NextAuth.js**
- **Prisma ORM** & **Neon PostgreSQL**
- **Razorpay Node SDK**
- **Tailwind CSS** & **Framer Motion**

---

## 🧪 Quick Setup
1. `npm install`
2. Configure `.env` with Google & Razorpay keys.
3. Visit `/api/seed` to populate test accounts.
4. **Deploy**: Ready for Vercel with automated Prisma generation.

> **Production Note**: The platform uses industry-standard JWT strategies and encrypted cookie sessions for maximum stability.
