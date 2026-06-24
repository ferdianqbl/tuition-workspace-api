# System Architecture - Backend Service

This document describes the architectural pipeline, routing layers, security middlewares, and file system boundaries for the backend application.

---

## 1. Middleware Pipeline

On startup, the Express middleware stack is initialized in the following sequence:

```
[Incoming Request]
       │
       ▼
 ┌───────────┐
 │  Helmet   │  <-- Secures HTTP response headers (XSS protection, clickjacking)
 └─────┬─────┘
       ▼
 ┌───────────┐
 │   CORS    │  <-- Controls resource sharing origins
 └─────┬─────┘
       ▼
 ┌───────────┐
 │CookieParse│  <-- Parses secure cookies to verify JWT sessions
 └─────┬─────┘
       ▼
 ┌───────────┐
 │Compression│  <-- Compresses payloads with Gzip
 └─────┬─────┘
       ▼
 ┌───────────┐
 │JSON Parser│  <-- Parses incoming application/json bodies
 └─────┬─────┘
       ▼
 ┌───────────┐
 │  Router   │  <-- Matches controllers and runs route handlers
 └─────┬─────┘
       ▼
 ┌───────────┐
 │GlobalErrorHandler  <-- Intercepts uncaught exceptions and structures JSON error payloads
 └───────────┘
```

---

## 2. Authentication & Authorization Middlewares

### Token Verification (`authenticate.ts`)
- Extract token from request cookie or Authorization header.
- Decrypt JWT using the HMAC-SHA256 signature token.
- Fetch current active user parameters and attach them to `req.user`.
- Throw `401 Unauthenticated` if the token is missing, expired, or invalid.

### Role Authorization (`requireRole.ts`)
- Restricts endpoints to specific roles: `requireRole([Role.PARENT])` or `requireRole([Role.TUTOR])`.
- Throws `403 Forbidden` if user's role does not match requirements.

---

## 3. Database Pooling (Prisma on Supabase)

- **Transaction-mode Pooler** (`port 6543`): Used for everyday query transactions to minimize connection overhead.
- **Session-mode Pooler** (`port 5432`): Used during migration tasks where absolute state session lock is required.

---

## 4. File Upload & Storage Boundary

- **Middleware**: Multer disk-storage.
- **Size constraint**: 5MB maximum.
- **MIME constraints**: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (docx), `image/png`, `image/jpeg`.
- **Filename Obfuscation**: On save, Multer overrides user filenames with `crypto.randomUUID() + originalExtension` (e.g. `8d19b7e1-c037-4536-80f9-a61ed63de6f0.pdf`). This isolates filenames on the host server disk and prevents directory path traversal attacks.
- **Security Check**: Before sending the file stream in response, `downloadDocument` re-checks the database matching access lists for the user. If they do not have access, a `403 Forbidden` error is returned and the file download fails.
