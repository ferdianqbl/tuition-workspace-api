# Backend Verification & Validation Results - Tuition Case Workspace

This document verifies and validates that the backend REST API complies with all functional and security requirements defined in the technical test specification.

---

## 1. Requirement Traceability Matrix

Here is how the Express/Prisma/PostgreSQL backend implements each section of the technical test:

### A. Users, Auth, and Sessions
* **Bcrypt Password Hashing**: Utilizes `bcryptjs` with salt round factors of 10 to securely hash passwords during `POST /api/auth/register` before saving to the database.
* **JWT Tokens & Expiry**: Issued upon login via `POST /api/auth/login`. Signatures utilize HMAC-SHA256 containing role and user ID payload. Expired tokens are rejected by token verification middlewares.
* **localStorage vs Cookie trade-offs**: 
  - For API operations, the client app stores the token in `localStorage` and appends it to the `Authorization: Bearer <token>` header. This helps route cross-origin serverless functions cleanly.
  - To support document downloads via native browser request streams (which cannot customize headers easily), the API accepts token resolution from cookies.
* **Error Masking & Stack Traces**: Global error handler middleware (`globalErrorHandler` in `be/src/middlewares/error.middleware.ts`) catches exceptions, logs stack traces securely to server logs, and serves generic JSON payloads to prevent leaking configuration settings.

### B. Tuition Cases Directory & Row-Level Access Controls
* **Dynamic Row-Level Access Control**:
  - Parents are restricted to cases where `userId = currentUserId` in the database.
  - Tutors are restricted to cases they are invited to via the `CaseAccess` mapping table.
  - Admins retain system-wide access.
* **Leaking Existence Choice**:
  - For secure resources, we throw `403 Forbidden` for unauthorized attempts rather than masking them with `404 Not Found`. This trade-off allows the frontend client to render specific unauthorized layout screens for user clarity.
  - To prevent identifier scanning and URL guessing attacks, all cases and profiles use cryptographically random UUIDv4 keys, rendering sequential harvesting computationally impossible.

### C. Secure Document Workspace
* **Multer File Constraints**: Enforces type limitations (PDF, DOCX, PNG, JPG, JPEG) and size limits of 5MB (configurable via `MAX_FILE_SIZE`).
* **Random UUID Filename Obfuscation**: Real filenames are stored in the database, while physical files are renamed to cryptographically random UUID formats on disk (e.g. `c7a52f9c-1122-4433-8899-abcdef123456.pdf`), protecting the server folder structure.
* **Temp File Cleanup**: If a file upload is rejected due to file type constraints or a non-existent case ID, the server automatically unlinks/deletes the local temp file immediately to prevent disk space exhaustion.
* **Permission Recheck on Download**: Enforces cookie session verification and active case permission checking before streaming the file path from disk.

### D. Tutor Profiles
* **Tutor Profile Separation**: Tutors can only upsert their own professional profile and credentials. Parents can search the Tutor Directory (paginated list, search by name). Tutors are blocked from searching other tutors' directories (`403`).

---

## 2. Compilation, Database, & Deployment Verification

We verified the backend codebase compiles and runs cleanly:

### A. Prisma Schema & Seed Verification
- Generated type-safe client: `npx prisma generate` outputs cleanly to `@prisma/client`.
- Database Seed: `npx prisma db seed` successfully populates Supabase PostgreSQL with seeded parental, tutor, and administrative accounts.

### B. TypeScript Compilation
```bash
# Executing compilation check
npm run build
```
- **Result**: **Passed**. All typescript files compile cleanly, resolving tsconfig aliases to relative CommonJS output.

### C. Swagger Documentation Verification
- Live documentation is served successfully at `https://tuition-workspace-api.vercel.app/api/docs`. 
- Verified that static assets resolve cleanly from CDN dependencies without crashing serverless directories.

---

## 🔗 Cross-Repository References

- **Frontend Repository**: [tuition-workspace-fe](https://github.com/ferdianqbl/tuition-workspace-fe)
- **Frontend Validation Document**: [plans/VALIDATION.md](https://github.com/ferdianqbl/tuition-workspace-fe/blob/main/plans/VALIDATION.md)
- **Backend Repository**: [tuition-workspace-api](https://github.com/ferdianqbl/tuition-workspace-api)
- **Live Swagger API Docs**: [Live API Swagger Docs (Vercel)](https://tuition-workspace-api.vercel.app/api/docs)
