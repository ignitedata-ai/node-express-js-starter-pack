# Requirements — Next Decade Full-Stack Application

> **Stack:** Next.js 14 (App Router) · Node.js/Express · TypeScript · JWT Auth  
> **Architecture:** Monorepo-lite (client / server / shared)

---

## Table of Contents

1. [Folder Structure](#folder-structure)
2. [Backend Specifications](#1-backend-nodejsexpressts)
3. [Frontend Specifications](#2-frontend-nextjsreactts)
4. [Shared & Integration](#3-shared--integration)
5. [Environment Variables](#environment-variables)
6. [Step-by-Step Implementation Guide](#step-by-step-implementation-guide)

---

## Folder Structure

```
/next-decade
  ├── /client                         ← Next.js 14 (App Router)
  │   ├── /src
  │   │   ├── /app
  │   │   │   ├── layout.tsx
  │   │   │   ├── page.tsx
  │   │   │   ├── /(auth)
  │   │   │   │   ├── login/page.tsx
  │   │   │   │   └── register/page.tsx
  │   │   │   └── /(protected)
  │   │   │       └── dashboard/page.tsx
  │   │   ├── /components
  │   │   ├── /context
  │   │   │   └── AuthContext.tsx
  │   │   ├── /lib
  │   │   │   ├── api.ts              ← Axios instance + interceptors
  │   │   │   └── auth.ts             ← Token helpers
  │   │   ├── /hooks
  │   │   │   └── useAuth.ts
  │   │   └── /middleware.ts          ← Next.js Edge middleware (route guard)
  │   ├── .env.local
  │   ├── next.config.ts
  │   └── tsconfig.json
  │
  ├── /server                         ← Node.js / Express API
  │   ├── /src
  │   │   ├── /config
  │   │   │   └── env.ts
  │   │   ├── /controllers
  │   │   │   └── auth.controller.ts
  │   │   ├── /middleware
  │   │   │   ├── authenticate.ts     ← JWT access-token guard
  │   │   │   ├── errorHandler.ts
  │   │   │   └── validateRequest.ts
  │   │   ├── /models
  │   │   │   └── User.ts
  │   │   ├── /routes
  │   │   │   ├── auth.routes.ts
  │   │   │   └── user.routes.ts
  │   │   ├── /services
  │   │   │   └── auth.service.ts
  │   │   ├── /utils
  │   │   │   ├── ApiResponse.ts
  │   │   │   └── jwt.ts
  │   │   └── index.ts
  │   ├── .env
  │   └── tsconfig.json
  │
  └── /shared                         ← Common TypeScript interfaces
      └── types
          ├── auth.types.ts
          └── user.types.ts
```

---

## 1. Backend (Node.js/Express/TS)

### 1.1 REST API Architecture

| Layer | Responsibility |
|---|---|
| **Routes** | Map HTTP verbs/paths to controllers |
| **Controllers** | Parse request, call service, return response |
| **Services** | Business logic, DB queries |
| **Middleware** | Auth guard, validation, error handling |
| **Utils** | JWT helpers, response wrappers |

### 1.2 JWT Authentication Flow

#### Tokens

| Token | Expiry | Storage (server-side) | Delivery |
|---|---|---|---|
| **Access Token** | 15 minutes | Stateless (signed) | JSON response body / `Authorization` header |
| **Refresh Token** | 7 days | Hashed in DB / Redis | `httpOnly` cookie |

#### Flow

```
POST /api/auth/register  →  hash password, create user, issue tokens
POST /api/auth/login     →  verify credentials, issue tokens
POST /api/auth/refresh   →  validate refresh token cookie, issue new access token
POST /api/auth/logout    →  clear refresh token cookie, invalidate token in DB
```

```
Client                        Server
  │── POST /auth/login ──────►│
  │                            │  1. Verify credentials
  │                            │  2. Sign Access Token  (15 min)
  │                            │  3. Sign Refresh Token (7 days)
  │                            │  4. Set httpOnly cookie with Refresh Token
  │◄── { accessToken } ───────│
  │
  │── GET /api/protected ─────►│  Authorization: Bearer <accessToken>
  │   (accessToken expires)    │
  │◄── 401 Unauthorized ───────│
  │
  │── POST /auth/refresh ─────►│  (Refresh Token sent via cookie automatically)
  │◄── { accessToken } ────────│
```

### 1.3 Protected Route Middleware

```typescript
// server/src/middleware/authenticate.ts
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next(new ApiError(401, 'No token provided'));
  const payload = verifyAccessToken(token); // throws on invalid/expired
  req.user = payload;
  next();
};
```

### 1.4 Standardized Response & Error Handling

All responses follow a unified envelope:

```json
// Success
{ "success": true,  "data": { ... },        "message": "OK" }

// Error
{ "success": false, "data": null,            "message": "Unauthorized", "code": 401 }
```

A global error handler catches custom `ApiError` instances and unknown errors, preventing stack-trace leakage in production.

---

## 2. Frontend (Next.js/React/TS)

### 2.1 Project Structure

Uses the `/src` directory with the App Router. Route groups keep auth and protected pages logically separated without affecting the URL.

### 2.2 Auth Context

```typescript
// src/context/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}
```

- Access token is stored **in memory** (React state) — never in `localStorage`.
- On page refresh, a silent `/auth/refresh` call rehydrates the token using the `httpOnly` refresh cookie.

### 2.3 Axios Interceptor

```typescript
// src/lib/api.ts
api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshAccessToken();
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);
```

### 2.4 Route Protection

| Method | Use Case |
|---|---|
| **Next.js Middleware** (`middleware.ts`) | Server-side redirect before page renders — checks for refresh cookie existence |
| **`useAuth` hook + redirect** | Client-side guard inside components if deeper logic is needed |

```typescript
// src/middleware.ts  (runs on the Edge)
export function middleware(request: NextRequest) {
  const hasRefreshCookie = request.cookies.has('refreshToken');
  const isProtectedPath = request.nextUrl.pathname.startsWith('/dashboard');
  if (isProtectedPath && !hasRefreshCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
```

---

## 3. Shared & Integration

### 3.1 Shared TypeScript Interfaces

```typescript
// shared/types/user.types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}

// shared/types/auth.types.ts
export interface AuthTokenPayload {
  sub: string;   // user id
  email: string;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}

export interface LoginRequest  { email: string; password: string; }
export interface LoginResponse { accessToken: string; user: User; }
export interface RegisterRequest { name: string; email: string; password: string; }
```

### 3.2 CORS Configuration

```typescript
// server/src/index.ts
import cors from 'cors';

app.use(cors({
  origin: process.env.CLIENT_URL,      // e.g. http://localhost:3000
  credentials: true,                   // required for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 3.3 Cookie Configuration (Refresh Token)

```typescript
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,    // JS cannot read it
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  path: '/api/auth', // only sent on auth endpoints
});
```

---

## Environment Variables

### `/server/.env`

```env
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nextdecade

# JWT
JWT_ACCESS_SECRET=your-strong-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-strong-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

### `/client/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Step-by-Step Implementation Guide

### Phase 1 — Repository Setup

- [ ] Create root `/next-decade` directory
- [ ] Initialize `pnpm` workspaces (or use npm/yarn)
- [ ] Add root `package.json` with workspace config
- [ ] Create `/client`, `/server`, `/shared` directories

### Phase 2 — Shared Types

- [ ] Create `shared/types/user.types.ts`
- [ ] Create `shared/types/auth.types.ts`
- [ ] Configure `shared/tsconfig.json` with `composite: true`

### Phase 3 — Backend

- [ ] `cd server && npm init -y && npm i express cors cookie-parser jsonwebtoken bcryptjs`
- [ ] `npm i -D typescript @types/node @types/express @types/jsonwebtoken ts-node-dev`
- [ ] Configure `tsconfig.json`
- [ ] Implement `utils/jwt.ts` — `signAccessToken`, `signRefreshToken`, `verifyAccessToken`
- [ ] Implement `utils/ApiResponse.ts` — `ApiResponse` and `ApiError` classes
- [ ] Implement `middleware/authenticate.ts`
- [ ] Implement `middleware/errorHandler.ts`
- [ ] Implement `controllers/auth.controller.ts` — register, login, refresh, logout
- [ ] Wire routes in `routes/auth.routes.ts`
- [ ] Bootstrap `index.ts` with CORS, cookie-parser, routes, error handler

### Phase 4 — Frontend

- [ ] `cd client && npx create-next-app@latest . --typescript --app --src-dir --tailwind`
- [ ] `npm i axios`
- [ ] Create `src/context/AuthContext.tsx`
- [ ] Create `src/lib/api.ts` with Axios instance + interceptors
- [ ] Create `src/hooks/useAuth.ts`
- [ ] Create `src/middleware.ts` for Edge route protection
- [ ] Build `/login` and `/register` pages
- [ ] Build `/dashboard` (protected) page

### Phase 5 — Integration & Testing

- [ ] Verify CORS by calling the API from the browser (not curl)
- [ ] Test token refresh flow: let access token expire, confirm silent refresh works
- [ ] Test Edge middleware redirect when no refresh cookie is present
- [ ] Add `.env.example` files for both packages

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Access token storage | React state (in-memory) | XSS-safe; cleared on tab close |
| Refresh token storage | `httpOnly` cookie | CSRF-mitigated via `sameSite=strict`; JS-inaccessible |
| Cookie path | `/api/auth` only | Minimises attack surface |
| Monorepo tooling | pnpm workspaces | Efficient hoisting; easy shared-type imports |
| Interceptor retry | `_retry` flag | Prevents infinite 401 loops |
