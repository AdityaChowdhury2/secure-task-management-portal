# Assignment Report: Earnest Data Analytics — Backend API

This document summarizes the **mandatory backend API** deliverable: a secure **Node.js + TypeScript** service using **Prisma** and **MySQL**, with **JWT authentication** and **user-scoped task management**.

---

## 1. Purpose and scope

The API fulfills the assignment requirements for:

1. **User security (authentication)** — registration, login, token refresh, logout, with password hashing and a short-lived access token plus long-lived refresh handling backed by the database.
2. **Task management (CRUD)** — tasks belong to the authenticated user; list endpoint supports **pagination**, **status filter**, and **title search**.

All protected routes enforce ownership so users cannot read or modify another user’s tasks.

---

## 2. Technical stack

| Layer | Choice |
|--------|--------|
| Runtime | Node.js |
| Language | TypeScript |
| HTTP framework | Express 5 |
| ORM | Prisma |
| Database | MySQL (`DATABASE_URL`) |
| Validation | Zod |
| Auth | `jsonwebtoken`, `bcrypt` |
| API docs | Swagger (OpenAPI 3) via `swagger-jsdoc` + `swagger-ui-express` |

---

## 3. Project structure (high level)

- `src/server.ts` — HTTP server entry and lifecycle.
- `src/app.ts` — Express app: middleware, `/api/v1` router, Swagger UI at `/api-docs`, global error handling.
- `src/app/routes/index.ts` — Mounts **health**, **auth**, and **tasks** under `/api/v1`.
- `src/app/modules/auth/` — Registration, login, refresh, logout; JWT and refresh-token persistence.
- `src/app/modules/tasks/` — Task CRUD, list with query options, toggle status.
- `src/app/middlewares/` — `validateRequest` (Zod), `requireAuth` (Bearer JWT), `globalErrorHandler`, etc.
- `prisma/schema.prisma` — MySQL datasource and models.
- `prisma/migrations/` — Schema history for deployable environments.

---

## 4. Data model (Prisma)

### User

- `id`, `name`, `email` (unique), `passwordHash`, timestamps.
- Relations: `tasks`, `refreshTokens`.

### Task

- `id`, `title`, `description` (optional), `status` (`PENDING` | `IN_PROGRESS` | `COMPLETED`), `userId`, timestamps.
- Cascade delete when user is removed.

### RefreshToken

- Persists **server-side refresh sessions**: `jti` (unique JWT ID), `tokenHash` (bcrypt of the raw refresh JWT), `expiresAt`, `revoked`, `createdAt`, linked to `userId`.
- Raw refresh tokens are **never** stored; only hashes are saved.
- Indexed on `userId` (and additional indexes for housekeeping queries).

---

## 5. Authentication design

### Access token (short-lived)

- Returned in **JSON** after login (and after a successful refresh, in the response `data`).
- Sent by clients as `Authorization: Bearer <accessToken>`.
- Payload includes `userId` and `email`; expiry is controlled by `ACCESS_TOKEN_EXPIRES_IN` (e.g. 15 minutes).

### Refresh token (long-lived)

- Issued as a JWT with a unique **`jti`** (`jwtid` in `jsonwebtoken`).
- On login, the token is **bcrypt-hashed** and stored with `jti` and `expiresAt`.
- A **`refreshToken` HTTP-only cookie** is set on login (options depend on `NODE_ENV` for `secure` / `sameSite`).

### Refresh flow (rotation and reuse detection)

1. Client calls refresh with the **cookie** present (validated at route level).
2. Server verifies the JWT, loads the row by **`jti`**, checks not revoked / not expired, and **`bcrypt.compare`** against `tokenHash`.
3. On success: **old row is removed**, new access + refresh tokens are issued, new hash stored (**rotation**).
4. If the JWT verifies but the DB row is missing, revoked, expired, or the hash does not match: **all refresh tokens for that user are removed** (reuse / theft assumption) and the client must log in again.

### Logout

- Requires a valid **access token** (`requireAuth`).
- Optional body: `allSessions` (boolean) for future / extended session revocation patterns.
- Clears the `refreshToken` cookie. *(Integrating full DB revocation for every logout path can be extended via `AuthService.logoutService` if required.)*

### Registration and passwords

- Passwords are hashed with **bcrypt** before persistence (`passwordHash` on `User`).

---

## 6. Task management API

Base path: **`/api/v1/tasks`**. All routes require **`Authorization: Bearer <accessToken>`**.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/tasks` | List current user’s tasks. Query: `page`, `limit` (max 100), optional `status`, optional `search` (title). |
| `POST` | `/tasks` | Create task (`title` required; optional `description`, `status`). |
| `GET` | `/tasks/:id` | Get one task if it belongs to the user. |
| `PATCH` | `/tasks/:id` | Partial update. |
| `DELETE` | `/tasks/:id` | Delete task. |
| `PATCH` | `/tasks/:id/toggle` | Toggle completion-related status in line with service logic. |

Responses for tasks are JSON objects or list wrappers as implemented in the task controllers (e.g. `{ meta, items }` for lists).

---

## 7. Validation and errors

- **Request validation** uses **Zod** schemas and a shared **`validateRequest`** middleware at the **route** level (`body`, `query`, `params`, `cookies` as defined per route).
- **Errors** flow through **`globalErrorHandler`**: standardized JSON with `success: false`, `message`, and `errorSources`; stack traces may appear in non-production environments.

---

## 8. API documentation (Swagger)

- Interactive docs: **`GET /api-docs`** (when the server is running).
- OpenAPI annotations live alongside route modules (e.g. `auth.route.ts`, `tasks.route.ts`, `health.route.ts`) for **auth**, **tasks**, and **health** endpoints under `/api/v1`.

---

## 9. Environment variables

Configure via `.env` (see `.env.example` as a template; **use a MySQL `DATABASE_URL` matching `schema.prisma`**).

| Variable | Role |
|----------|------|
| `PORT` | HTTP port (default commonly `5000` if unset in code) |
| `DATABASE_URL` | MySQL connection string for Prisma |
| `JWT_ACCESS_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `ACCESS_TOKEN_EXPIRES_IN` | Access TTL (e.g. `15m`) |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh TTL (e.g. `7d`) |
| `BCRYPT_SALT_ROUNDS` | Cost factor for bcrypt |

---

## 10. Setup and commands

```bash
npm install
cp .env.example .env   # then edit DATABASE_URL and secrets
npm run db:generate
npm run db:migrate     # or: npm run db:push (dev)
npm run dev            # development
npm run build && npm start   # production-style
```

Useful extras:

- `npm run studio` — Prisma Studio for browsing data.

---

## 11. Mapping to assignment checklist

| Requirement | Implementation |
|-------------|----------------|
| Node.js + TypeScript | Yes |
| SQL DB + Prisma | MySQL + Prisma models/migrations |
| Register / Login / Refresh / Logout | `/api/v1/auth/*` |
| JWT access + refresh strategy | Access in JSON; refresh JWT with `jti`; hashed storage; cookie on login |
| Bcrypt passwords | `User.passwordHash` |
| Task CRUD + user scope | `/api/v1/tasks/*` + `userId` on `Task` |
| List: pagination, filter, search | `GET /tasks` query params |
| Validation + HTTP status codes | Zod + global error handler |
| Optional: API docs | Swagger at `/api-docs` |

---

## 12. Frontend integration note (e.g. Next.js)

- Call the API under **`/api/v1`**.
- Store the **access token** in memory or secure client storage; send it on task requests.
- For **refresh**, use `credentials: 'include'` so the **refresh cookie** is sent; align **CORS** (`origin` + `credentials: true`) if the frontend is on another origin.
- After a successful refresh, use the new **access token** from the JSON body; if the API also returns a new refresh token in `data`, ensure cookie handling matches your deployment (production `secure` / `sameSite`).

---

*This README serves as the assignment report for the backend portion of the Earnest Data Analytics project.*
