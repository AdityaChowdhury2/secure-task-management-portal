# Earnest Assignment Backend API

Node.js + TypeScript + Prisma API with JWT authentication and user-scoped task management.

## Setup

1. Copy `.env.example` to `.env`.
2. Install dependencies:
   - `npm install`
3. Generate Prisma client:
   - `npm run db:generate`
4. Push schema to SQLite:
   - `npm run db:push`
5. Run server:
   - `npm run dev`

## Required Endpoints

### Authentication
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout` (requires access token)

### Tasks (all require access token)
- `GET /tasks` (supports `page`, `limit`, `status`, `search`)
- `POST /tasks`
- `GET /tasks/:id`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`
- `PATCH /tasks/:id/toggle`

## Notes

- Passwords are hashed using bcrypt before storage.
- Access and refresh tokens are both implemented.
- Task access is restricted to the logged-in user only.
