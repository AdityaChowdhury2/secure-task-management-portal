# Earnest Data Analytics — Frontend Assignment

This repository is the **frontend** for a task-management workspace: a secure dashboard where users register, sign in, and maintain tasks with search, filters, pagination, and CRUD operations against a REST API.

---

## 1. Assignment scope

| Area | Description |
|------|-------------|
| **Authentication** | Login and registration flows with JWT-style access tokens, protected routes, and automatic session refresh on `401` responses. |
| **Task workspace** | Paginated task table with create, edit, delete, and status toggle; search by title and filter by status. |
| **UX** | Responsive layout (sidebar on desktop, bottom navigation on mobile), onboarding tour (runs once per browser), inline help for row actions, and toast notifications. |
| **Forms** | New-task creation validated with **React Hook Form**; edit flow uses controlled state for title, description, and status. |

---

## 2. Feature summary

- **Auth:** Register, login, logout; credentials stored in Redux; `httpOnly` cookie refresh coordinated with `POST …/auth/refresh`.
- **Dashboard:** Task list with columns for status, title, description, created date, and actions.
- **Tasks API:** List with query params `page`, `limit`, optional `status`, optional `search`; response normalized from `{ meta, items }` (including `meta.total` and `meta.totalPages`).
- **Pagination:** Segmented control (Previous / numbered pages with ellipsis / Next) aligned with server `meta`.
- **Layout:** Viewport-height shell so the **sidebar and header stay fixed** while **only the main content scrolls**.
- **Onboarding:** Step-by-step tour (Skip / Next / Done), persisted with `localStorage` so it shows once unless cleared.
- **Help:** Info control in the **Actions** column header with a hover tooltip describing check, edit, and delete.

---

## 3. Tech stack

- **Framework:** [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript  
- **State & data:** Redux Toolkit, RTK Query (`createApi`)  
- **Styling:** Tailwind CSS 4  
- **Forms:** React Hook Form (create-task modal)  
- **Feedback:** React Toastify  

---

## 4. Project structure (high level)

```
app/                    # Routes: login, register, dashboard, root redirect
components/
  layout/               # Dashboard shell (sidebar, header, mobile nav)
  tasks/                # TaskBoard, pagination, tutorial, skeletons, row help
  ui/                   # Button, Input, Modal
lib/                    # API base URL, fetch wrapper with re-auth, paths, utilities
redux/                  # Store, auth slice, API slice (endpoints)
types/                  # Shared TypeScript types (auth, task)
```

---

## 5. Prerequisites

- **Node.js** 20+ (LTS recommended)  
- **npm**, **yarn**, or **pnpm**  
- A running **backend** exposing the API (see environment variables below)

---

## 6. Environment variables

Copy `.env.example` to `.env.local` (or `.env`) and set:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | API root **including version**, e.g. `http://localhost:5000/api/v1` (no trailing slash) |
| `NEXT_PUBLIC_API_AUTH_PREFIX` | Optional. Defaults to auth under `/auth/*`. Set empty only if your API uses non-prefixed paths (see `.env.example`). |

---

## 7. Install and run

```bash
# Install dependencies
npm install

# Development (http://localhost:3000)
npm run dev

# Production build
npm run build
npm start
```

```bash
# Lint
npm run lint
```

---

## 8. API integration notes

- **Tasks:** `GET /tasks` returns a JSON body with an **`items`** array and **`meta`** object. Pagination fields are read from `meta.page`, `meta.limit`, `meta.total` (or `meta.totalItems`), and `meta.totalPages`. The client maps this into a single internal shape for the UI.  
- **Auth:** Login/register responses are expected to provide access token (and user) in the shape consumed by `redux/api.ts`. Protected requests send `Authorization: Bearer <token>`.  
- **Cookies:** `credentials: "include"` is used so refresh cookies can be sent where the API expects them.

If your backend uses a different envelope (e.g. everything under `data`), adjust `normalizePaginatedTasksResponse` in `redux/api.ts`.

---

## 9. Limitations and assumptions

- The UI assumes a compatible REST contract; field names for tasks are normalized (`id` / `_id`, etc.) in one place.  
- Very small viewports may scroll the segmented pagination horizontally inside its wrapper.  
- Session validity depends on the backend’s refresh and token expiry behaviour.

---

## 10. Deliverables checklist (assignment-oriented)

- [x] Authenticated task dashboard  
- [x] Task CRUD + status toggle wired to API  
- [x] Search, status filter, server-driven pagination  
- [x] Responsive dashboard layout with fixed chrome and scrollable content  
- [x] Create-task form with React Hook Form and validation  
- [x] User-facing onboarding and contextual help  

---

*This README documents the implementation as submitted for the Earnest data analytics frontend assignment.*
