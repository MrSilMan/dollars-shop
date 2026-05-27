# Dollar Shop Zimbabwe

Full-stack e-commerce platform for Dollar Shop Zimbabwe — everyday essentials, groceries, household goods, and personal care products with EcoCash and InnBucks mobile money payments.

**Stack:** Next.js 16 · Prisma 7 · PostgreSQL · Redis · Tailwind CSS v4 · NextAuth v5

---

## Prerequisites

- Node.js 22+
- Docker & Docker Compose
- `npm` (or compatible package manager)

---

## Local Development Setup

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd dollar-shop
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the required values. For local development the defaults work for the database and Redis if you use Docker Compose.

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `AUTH_SECRET` | Random 32+ character secret for NextAuth |
| `NEXTAUTH_URL` | Base URL (e.g. `http://localhost:3000`) |
| `ECOCASH_*` | EcoCash merchant credentials |
| `INNBUCKS_*` | InnBucks merchant credentials |
| `SENTRY_DSN` | Sentry DSN for error monitoring |
| `PAYMENT_MODE` | `sandbox` (no real payments) or `live` |

### 3. Start database and Redis with Docker

```bash
docker compose up db redis -d
```

This starts:
- PostgreSQL 16 on port `5432`
- Redis 7 on port `6379`

### 4. Generate Prisma client

```bash
npx prisma generate
```

### 5. Run database migrations

```bash
npm run db:migrate
```

### 6. Seed the database

```bash
npm run db:seed
```

This creates:
- 8 product categories (Household, Groceries, Personal Care, Baby & Kids, etc.)
- 30 sample products with realistic prices
- Admin user: `admin@dollarshop.co.zw` / `admin123!`

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin panel: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |
| `npm run db:push` | Push schema changes without migrations |
| `npm run db:migrate` | Create and run migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio GUI |

---

## Project Structure

```
dollar-shop/
├── app/
│   ├── (auth)/              # Login and register pages
│   ├── (store)/             # Customer-facing store
│   │   ├── page.tsx         # Homepage
│   │   ├── shop/            # Product listings
│   │   ├── product/[slug]/  # Product detail
│   │   ├── cart/            # Shopping cart
│   │   ├── checkout/        # Checkout flow
│   │   ├── account/         # Customer account
│   │   └── search/          # Search results
│   ├── admin/               # Admin dashboard
│   │   ├── page.tsx         # Stats + revenue chart
│   │   ├── products/        # Product management
│   │   ├── orders/          # Order management
│   │   └── customers/       # Customer list
│   ├── api/                 # API routes
│   │   ├── auth/            # NextAuth + register
│   │   ├── payment/webhook/ # EcoCash/InnBucks webhooks
│   │   ├── products/        # Product API
│   │   ├── search/          # Search API
│   │   └── wishlist/        # Wishlist API
│   └── generated/prisma/    # Prisma client (auto-generated)
├── actions/                 # Next.js Server Actions
├── components/
│   ├── store/               # Customer-facing components
│   ├── checkout/            # Checkout widgets
│   └── admin/               # Admin UI components
├── hooks/                   # Client-side hooks
├── lib/                     # Utilities
│   ├── auth.ts              # NextAuth config
│   ├── prisma.ts            # Prisma singleton
│   ├── redis.ts             # Redis + cache helpers
│   ├── logger.ts            # Winston logger
│   ├── payments/            # EcoCash + InnBucks
│   └── utils/               # Currency, order, stock utils
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed script
├── public/
│   ├── images/              # Logo and product images
│   └── manifest.json        # PWA manifest
└── schemas/                 # Zod validation schemas
```

---

## Payment Integration

### Sandbox Mode

Set `PAYMENT_MODE=sandbox` in your environment. Both EcoCash and InnBucks will return mock responses — no real API calls are made. Use this for development and testing.

### EcoCash (Live)

1. Register as a merchant at EcoCash Business
2. Obtain `MERCHANT_CODE`, `MERCHANT_PIN`, and `MERCHANT_NUMBER`
3. Set `ECOCASH_API_URL` to the live endpoint
4. Configure webhook: `https://yourdomain.co.zw/api/payment/webhook?provider=ecocash`

### InnBucks (Live)

1. Register at InnBucks Merchant Portal
2. Obtain `MERCHANT_ID` and `MERCHANT_SECRET`
3. Set `INNBUCKS_API_URL` to the live endpoint
4. Configure webhook: `https://yourdomain.co.zw/api/payment/webhook?provider=innbucks`
5. The webhook verifies HMAC-SHA256 signatures automatically

---

## Docker Deployment

### Build and run with Docker Compose

```bash
# Build the production image
docker compose build app

# Run all services
docker compose up -d

# Run migrations on the live database
docker compose exec app npx prisma migrate deploy

# (First-time only) Seed the database
docker compose exec app npm run db:seed
```

### Environment variables for production

Create a `.env` file on the server (not committed to git):

```env
DATABASE_URL=postgresql://postgres:strongpassword@db:5432/dollar_shop
REDIS_URL=redis://redis:6379
AUTH_SECRET=your-long-random-secret-minimum-32-chars
NEXTAUTH_URL=https://yourdomain.co.zw
PAYMENT_MODE=live
# ... rest of your production credentials
```

### Docker services

| Service | Image | Port |
|---|---|---|
| `app` | Custom (multi-stage Next.js) | 3000 |
| `db` | postgres:16-alpine | 5432 |
| `redis` | redis:7-alpine | 6379 |

---

## CI/CD (GitHub Actions)

Two workflows are included in `.github/workflows/`:

- **`ci.yml`** — Runs on every push/PR: type-check, lint, and build against real Postgres and Redis services
- **`deploy.yml`** — Runs on push to `main`: builds Docker image, pushes to registry, SSHs to server and pulls + restarts

Set the following GitHub Secrets for the deploy workflow:

| Secret | Description |
|---|---|
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub access token |
| `DEPLOY_HOST` | Production server SSH host |
| `DEPLOY_USER` | SSH username |
| `DEPLOY_KEY` | SSH private key (RSA or ED25519) |
| `DEPLOY_PATH` | Path on server where docker-compose.yml lives |

---

## Features

- **Store**: Homepage with hero, featured products, category navigation, search
- **Products**: Full detail pages with image gallery, stock status, star ratings, related products
- **Cart**: Persistent for guests (cookie-based) and authenticated users (database), delivery threshold progress bar
- **Checkout**: 4-step form — contact, address, payment method, review & confirm
- **Payments**: EcoCash USSD push with real-time polling; InnBucks push or QR code
- **Accounts**: Order history, wishlist, address book
- **Admin**: Revenue chart, product/order/customer management
- **PWA**: Installable with manifest and theme color
- **SEO**: Sitemap, robots.txt, OpenGraph metadata per page

---

## Brand

- **Primary**: `#D4251C` (Dollar Shop Red)
- **Accent**: `#F5A623` (Gold)
- **Success**: `#22863A`
- **Footer**: `#1C1917`
- **Fonts**: Playfair Display (headings) · DM Sans (body) · DM Mono (prices)

---

## Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@dollarshop.co.zw` | `admin123!` |

> Change the admin password immediately after first login in production.
