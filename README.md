# Overall Project Report — Secure Task Management Portal

## 1. Summary

This project is a full-stack **secure task management** application: users register and sign in, then manage their own tasks with search, status filters, pagination, and full CRUD. The backend is a REST API with JWT access tokens, refresh tokens (including database-backed rotation), and user-scoped data. The frontend is a responsive Next.js dashboard that talks to that API.

---

## 2. Live deployment

| Component | URL |
|-----------|-----|
| **Frontend (Vercel)** | [https://secure-task-management-portal-aditya.vercel.app](https://secure-task-management-portal-aditya.vercel.app) |
| **Backend API (Render)** | [https://secure-task-management-portal.onrender.com](https://secure-task-management-portal.onrender.com) |
| **Interactive API documentation (Swagger UI)** | [https://secure-task-management-portal.onrender.com/api-docs/](https://secure-task-management-portal.onrender.com/api-docs/) |

API routes are served under **`/api/v1`** (for example, `POST /api/v1/auth/login`, `GET /api/v1/tasks`). The Swagger UI linked above documents and lets you try those endpoints.

---

## 3. Demo login (test account)

Use these credentials on the **login** page of the live frontend (or in the **Login** request body in Swagger):

| Field | Value |
|-------|--------|
| **Email** | `john@example.com` |
| **Password** | `StrongPass123` |

Example JSON for API login:

```json
{
  "email": "john@example.com",
  "password": "StrongPass123"
}
```

> **Note:** This account must exist in the deployed database (e.g. registered once via `/api/v1/auth/register` or seeded). If login fails on production, register the same email/password once or use the registration flow in the app.

---

## 4. Architecture

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Redux Toolkit / RTK Query, Tailwind CSS 4, React Hook Form, toast notifications, optional onboarding tour.
- **Backend:** Node.js, Express 5, TypeScript, Prisma ORM, MySQL, Zod validation, bcrypt password hashing, JWT access tokens, refresh tokens stored and rotated in the database, CORS and cookie support for the SPA.
- **Documentation:** OpenAPI 3 annotations with **Swagger UI** at `/api-docs` on the API server.

Data is modeled around **User**, **Task** (with statuses: pending, in progress, completed), and **RefreshToken** for session rotation.

---

## 5. Feature overview

**Authentication**

- Register, login, token refresh, logout.
- Short-lived access token (Bearer) for protected routes; refresh flow uses HTTP-only cookies where configured.

**Tasks (per user)**

- List with **pagination**, optional **status** filter, optional **title search**.
- Create, read, update, delete, and status toggle.
- Users cannot access other users’ tasks.

**Frontend UX**

- Protected dashboard, responsive layout (sidebar / mobile nav), paginated task table, modals for create/edit, inline help and onboarding where implemented.

---

## 6. Repository layout (local)

| Folder | Role |
|--------|------|
| `Earnest-Data-Analytics-backend/` | API server, Prisma schema, migrations, Swagger |
| `earnest-data-analytics-frontend/` | Next.js web application |

---

## 7. References

- **Swagger UI (live):** [https://secure-task-management-portal.onrender.com/api-docs/](https://secure-task-management-portal.onrender.com/api-docs/)
- **Frontend (live):** [https://secure-task-management-portal-aditya.vercel.app](https://secure-task-management-portal-aditya.vercel.app)

---

*Report generated for submission and demo purposes. Update demo credentials or deployment URLs here if they change.*
