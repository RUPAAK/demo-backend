# backend

Node.js + Express + Postgres backend.

## Dependencies

From `package.json`:

- `bcrypt` `^5.1.1`
- `cookie-parser` `^1.4.6`
- `cors` `^2.8.5`
- `dotenv` `^16.4.5`
- `express` `^4.21.0`
- `jsonwebtoken` `^9.0.3`
- `pg` `^8.13.0`
- Dev: `nodemon` `^3.1.0`

## Setup

### Clone

```bash
git clone https://github.com/RUPAAK/demo-backend.git
cd demo-backend
```

### Configure env

```bash
cp .env.example .env
```

Edit `.env` and set:

- `DATABASE_URL` (Supabase / Postgres connection string)
- `JWT_SECRET` (long random string)

### Install

```bash
npm install
```

### Run

Dev (auto-reload):

```bash
npm run dev
```

Prod:

```bash
npm start
```

Server starts on `PORT` (default `3000`).

## Notes

- On server start, it runs SQL migrations in `migrations/` and seeds:
  - `translations`
  - `users` (creates the seed user if missing)
  - `products` (inserts seed products only if `products` is empty)

## API quick list

- `GET /` -> `{ data: { ok: "Hello from server!" } }`
- `GET /health` -> `{ data: { ok: true } }`

- `GET /api/translations?locale=english|swedish` -> `{ data: { nav, auth, footer, dashboard } }`

- `POST /api/auth/login` (sets `access_token` cookie) -> `{ data: { user, token } }`
- `GET /api/auth/profile` -> `{ data: { user } }`

- `GET /api/products?page=1&limit=20` (auth required) -> `{ data: { items, pagination } }`
- `PATCH /api/products/:id` (auth required) -> `{ data: { product } }`

