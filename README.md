<div align="center">

# Ticketly

A full-stack event ticket booking platform with AI-powered search, Stripe payments, and PDF ticket generation.

![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)

</div>

---

## Features

- **OAuth 2.0 Login** -- Google & Facebook social authentication with session-based auth stored in Redis
- **Stripe Payments** -- Secure checkout with PaymentIntent flow, webhook handling, and server-side verification
- **AI-Powered Search** -- Natural language show search using Google Gemini (e.g., "jazz shows this weekend under $50")
- **PDF Tickets** -- Auto-generated booking confirmation PDFs uploaded to AWS S3 and emailed to users
- **Real-Time Seat Tracking** -- Pessimistic row locking prevents double-booking under concurrent access
- **Responsive UI** -- Clean, modern interface built with TailwindCSS v4
- **Custom Rate Limiting** -- Decorator-driven, per-endpoint rate limiting with in-memory bucket storage
- **Redis Caching** -- Cached show listings with targeted invalidation on writes

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS v4, Zustand, React Router v6 |
| Backend | NestJS 11, TypeScript, Prisma ORM, Passport.js |
| Database | PostgreSQL 17, Redis 7 |
| Payments | Stripe (PaymentIntent + Webhooks) |
| AI | Google Gemini via LangChain |
| Storage | AWS S3 (ticket PDFs) |
| Auth | OAuth 2.0 (Google, Facebook), express-session + Redis store |
| Email | Nodemailer (SMTP) |

## Architecture

```
ticketly-js/
├── ticketly-backend/          # NestJS REST API
│   ├── src/
│   │   ├── auth/              # OAuth2, session, guards
│   │   ├── shows/             # Show CRUD, search, caching
│   │   ├── tickets/           # Booking, PDF generation, S3 upload
│   │   ├── payments/          # Stripe integration, webhooks
│   │   ├── ai-search/         # Gemini LLM search
│   │   ├── storage/           # AWS S3 service
│   │   ├── notification/      # Email with PDF attachment
│   │   ├── rate-limit/        # Custom rate limiting
│   │   └── prisma/            # Database access layer
│   └── prisma/schema.prisma   # Database schema
│
└── ticketly-frontend/         # React SPA
    └── src/
        ├── api/               # Axios client + endpoint modules
        ├── stores/            # Zustand state stores
        ├── components/        # UI, layout, and feature components
        └── pages/             # Route pages
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 17
- Redis 7
- AWS S3 (or LocalStack for local dev)
- Stripe account (test keys)
- Google & Facebook OAuth credentials
- Gemini API key

### 1. Local Infrastructure (Docker)

The project includes a script to spin up local AWS services via [floci](https://github.com/nicholasgriffintn/floci):

```bash
cd ticketly-backend
chmod +x aws-start.sh
./aws-start.sh
```

This provisions:
- **S3** bucket `ticketly-tickets` on port 4566
- **PostgreSQL** `ticketly-db` on port 7001
- **Redis** on port 6379

### 2. Backend Setup

```bash
cd ticketly-backend
cp .env.example .env          # Fill in your credentials
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

The API runs on `http://localhost:8080`.

### 3. Frontend Setup

```bash
cd ticketly-frontend
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

### 4. Environment Variables

**Backend** (`ticketly-backend/.env`):

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default: 8080) |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_HOST` / `REDIS_PORT` | Redis connection |
| `SESSION_SECRET` | Secret for session cookies |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | Facebook OAuth |
| `GEMINI_API_KEY` | Google Gemini API key |
| `AWS_*` | AWS S3 credentials |
| `MAIL_*` | SMTP email configuration |

**Frontend** (`ticketly-frontend/.env`):

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (default: `http://localhost:8080`) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/user/me` | -- | Current user info |
| `GET` | `/api/shows` | -- | Upcoming shows |
| `GET` | `/api/shows/past` | -- | Past shows |
| `GET` | `/api/shows/search?q=` | -- | Keyword search |
| `GET` | `/api/shows/:id` | -- | Show details |
| `POST` | `/api/shows` | Yes | Create a show |
| `DELETE` | `/api/shows/:id` | Yes | Delete a show |
| `GET` | `/api/tickets` | Yes | User's tickets |
| `GET` | `/api/tickets/:id` | Yes | Ticket details |
| `POST` | `/api/tickets` | Yes | Book a ticket |
| `GET` | `/api/tickets/:id/download` | Yes | Download PDF |
| `POST` | `/api/payments/create-intent` | Yes | Create Stripe PaymentIntent |
| `POST` | `/api/payments/webhook` | -- | Stripe webhook receiver |
| `GET` | `/api/ai-search/search?q=` | -- | AI natural language search |

## License

MIT
