# Secure Intelligent Password Manager (MERN)

Full-stack MERN app with:
- JWT auth + bcrypt hashing
- AES-256-GCM encryption at rest for saved passwords/notes
- Password health scoring + reused detection
- Clipboard self-destruct (best-effort) after 10 seconds
- Panic mode (instant logout + clear sensitive state)
- Fake password sharing via temporary, one-time token with expiry

## Project structure

```
Root/
  server/
  client/
  .env.example
  README.md
```

## Prerequisites

- Node.js 18+ (recommended)
- MongoDB running locally or MongoDB Atlas connection string

## Setup

### 1) Backend env

Create `server/.env` by copying `server/.env.example`:

- `MONGO_URI`: your Mongo connection string
- `JWT_SECRET`: long random string
- `ENCRYPTION_KEY`: **32 bytes base64** (AES-256). Generate:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2) Install dependencies

From the project root:

```bash
npm install
npm run install:all
```

## Run (development)

### Option A: Run both (recommended)

```bash
npm run dev
```

- API: `http://localhost:5000/api/health`
- Web: `http://localhost:3000`

### Option B: Run separately

Backend:

```bash
cd server
npm install
npm run dev
```

Frontend:

```bash
cd client
npm install
npm start
```

## API overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me` (protected)
- `POST /api/passwords` (protected)
- `GET /api/passwords` (protected)
- `DELETE /api/passwords/:id` (protected)
- `POST /api/share` (protected) → returns `{ token, expiresAt }`
- `GET /api/share/:token` (public) → one-time redeem

## Notes on security

- Saved passwords and notes are encrypted server-side with AES-256-GCM.
- User login passwords are hashed with bcrypt.
- JWT protects password routes.
- Input validation uses Zod.

