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
 │   CORS    │  <-- Dynamically mirrors allowed request origins to support credentials
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
 │GlobalErrorHandler  <-- Intercepts exceptions, structures error responses, terminates request
 └───────────┘
```

---

## 2. CORS and Security Configurations

### Dynamic CORS Origin Matching
- Read allowed origins list from the `CORS_ORIGIN` environment variable (comma-separated).
- Uses a dynamic origin resolver callback. If `CORS_ORIGIN` is configured as `*` (wildcard) or includes the incoming request's `Origin` header:
  - Echoes the exact request `Origin` header in the `Access-Control-Allow-Origin` response header.
  - This allows cross-origin requests with `credentials: true` to pass browser-side CORS validations without wildcard rejections.

### Global Error Handling
- **Middleware**: `globalErrorHandler` catches all uncaught route errors.
- **Payload**: Formats errors into a structured JSON payload using the `errorResponse` helper.
- **Request Termination**: Terminates the request lifecycle by directly sending the response. It does NOT call `next(res)` or propagate the response object to subsequent error handlers to prevent `HeadersAlreadySent` crashes on serverless runtimes.

---

## 3. Authentication & Authorization Middlewares

### Token Verification (`auth.middleware.ts`)
- Extract token from request cookie or Authorization header.
- Decrypt JWT using the HMAC-SHA256 signature token.
- Fetch current active user parameters and attach them to `req.user`.
- Throw `401 Unauthenticated` if the token is missing, expired, or invalid.

### Role Authorization (`requireRole.ts`)
- Restricts endpoints to specific roles: `requireRole([Role.PARENT])` or `requireRole([Role.TUTOR])`.
- Throws `403 Forbidden` if user's role does not match requirements.

---

## 4. Database Client (Prisma on Supabase)

- **Standard Client Generation**: The database client is compiled using the official `"prisma-client-js"` provider to the default `node_modules/@prisma/client` path. This prevents file-copying issues during builds and ensures native CommonJS import support across serverless environments.
- **Transaction-mode Pooler** (`port 6543`): Used for everyday query transactions to minimize connection overhead.
- **Session-mode Pooler** (`port 5432`): Used during migration tasks where absolute state session lock is required.

---

## 5. File Upload & Storage Boundary

- **Middleware**: Multer disk-storage.
- **Size constraint**: Managed by the `MAX_FILE_SIZE` environment variable (default 5MB fallback).
- **MIME constraints**: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (docx), `image/png`, `image/jpeg`.
- **Filename Obfuscation**: On save, Multer overrides user filenames with `crypto.randomUUID() + originalExtension` (e.g. `8d19b7e1-c037-4536-80f9-a61ed63de6f0.pdf`). This isolates filenames on the host server disk and prevents directory path traversal attacks.
- **Security Check**: Before sending the file stream in response, `downloadDocument` re-checks the database matching access lists for the user. If they do not have access, a `403 Forbidden` error is returned and the file download fails.

---

## 6. Directory & Folder Structure

The backend application organizes source files logically by utility type and business feature modules:

```
be/
├── plans/                     # Architectural specs, API references, and designs
├── src/
│   ├── app.ts                 # Express application and middleware stack entrypoint
│   ├── config/                # Global config systems (Swagger OpenAPI definition, Prisma settings)
│   ├── generated/             # Auto-generated code from third-party tools (Prisma Client)
│   ├── lib/                   # Client library integrations (Prisma Pg adapter instance wrapper)
│   ├── middlewares/           # Global Express middlewares (authentication, error handling, Multer)
│   ├── routes/                # Central Router index registering module sub-routes
│   ├── types/                 # Global TypeScript type extensions (Express request typings)
│   ├── utils/                 # Utility helpers (custom errors, crypto, standardized response schemas)
│   └── modules/               # Feature-based business logic (modular sub-folders):
│       ├── auth/              # Auth routes, controllers, services, repositories, schemas
│       ├── user/              # User account lookups, data access, and creation layers
│       ├── tutor/             # Tutor directory filters, qualifications, and certificate uploads
│       └── case/              # Tuition case requirements, documents, and workspace invitations
```

---

## 🔗 Cross-Repository References

- **Frontend Repository**: [tuition-workspace-fe](https://github.com/ferdianqbl/tuition-workspace-fe)
- **Frontend System Architecture**: [plans/SYSTEM_ARCHITECTURE.md](https://github.com/ferdianqbl/tuition-workspace-fe/blob/main/plans/SYSTEM_ARCHITECTURE.md)
- **Frontend Master Plan & Routing**: [plans/PLANNING.md](https://github.com/ferdianqbl/tuition-workspace-fe/blob/main/plans/PLANNING.md)
- **Frontend UI/UX Design System**: [plans/DESIGN.md](https://github.com/ferdianqbl/tuition-workspace-fe/blob/main/plans/DESIGN.md)
- **Live Frontend Web App**: [Live Deployment (Vercel)](https://tuition-workspace-fe.vercel.app/)
