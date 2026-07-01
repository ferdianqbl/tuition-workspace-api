# Backend Verification & Validation Results - Tuition Case Workspace

This document verifies and validates that the backend REST API complies with all functional and security requirements defined in the technical test specification.

---

## 1. Requirement & Improvisation Validation Table

| Core Requirement Group | Specific Requirement / Improvisation | Code Reference (Files & Functions) | Detailed Flow & Operations | Status |
| :--- | :--- | :--- | :--- | :---: |
| **A. Users, Auth, and Sessions** | Bcrypt Password Hashing | [auth.service.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/modules/auth/auth.service.ts) | Hashes passwords with 10 salt rounds during registration (`POST /api/auth/register`) before committing to PostgreSQL. | `[x] OK` |
| | JWT Session Tokens | [crypto.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/utils/crypto.ts) | Generates and verifies HMAC-SHA256 tokens containing user role and ID payload upon login session. | `[x] OK` |
| | Cookie & Header Extraction | [auth.middleware.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/middlewares/auth.middleware.ts) | Resolves token validation from secure cookies (primary for frontend web app sessions) or Bearer header (fallback for external API/Swagger clients). | `[x] OK` |
| | **[Improvisation]** Dynamic CORS origin mirroring | [app.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/app.ts) | Resolves origins dynamically against the allowed list/wildcard (`*`), mirroring the request origin to allow credentials. | `[x] OK` |
| | **[Improvisation]** Masking Stack Traces | [error.middleware.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/middlewares/error.middleware.ts) | Global error boundary intercepts exceptions, prints logs to console privately, and sends standard JSON error messages to clients. | `[x] OK` |
| **B. Tuition Cases** | Case CRUD & Filters | [case.service.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/modules/case/case.service.ts) | Creates, reads, updates, and lists cases. Enforces parameter filters (subject, level, status) and keyword search mapping. **[Admin update]**: Admins can query and retrieve all cases across the system. | `[x] OK` |
| | Owner/Invited Row-Level Security | [case.repository.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/modules/case/case.repository.ts) | Attaches database filters ensuring Parents only query cases they own, Tutors only query cases they are invited to, and Admins can query all cases. | `[x] OK` |
| | Pagination validation | [case.controller.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/modules/case/case.controller.ts) | Validates query parameter inputs page and limit, rejecting negative or zero values with 400 Bad Request. | `[x] OK` |
| | **[Improvisation]** UUIDv4 Scanning Mitigation | [case.types.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/modules/case/case.types.ts) | Generates cases and user records with UUIDv4 identifiers, preventing resource scanning or URL harvesting. | `[x] OK` |
| **C. Secure Document Workspace** | File constraints checks | [upload.middleware.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/middlewares/upload.middleware.ts) | Multer middleware intercepts file streams, restricting sizes to 5MB and extensions to PDF, DOCX, PNG, JPG, and JPEG. | `[x] OK` |
| | Obfuscated storage naming | [upload.middleware.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/middlewares/upload.middleware.ts) | Renames physical files on save to `randomUUID() + extension` to block directory traversal or filename sniffing. | `[x] OK` |
| | Original Filename Preservation | [case.service.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/modules/case/case.service.ts) | Stores original client filename in `filename` database column and downloads it back with the original name while storing the physical file using the document ID (UUID) + extension. | `[x] OK` |
| | Download Permission Recheck | [case.service.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/modules/case/case.service.ts#L248) | Re-validates active parent ownership or tutor case access mapping before streaming the physical file from disk. | `[x] OK` |
| | **[Improvisation]** Serverless writeable directory | [uploads.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/lib/uploads.ts) | Detects Vercel serverless environment and redirects uploads path to `/tmp` to avoid write permission errors. | `[x] OK` |
| | **[Improvisation]** Failed upload temp file cleanup | [case.service.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/modules/case/case.service.ts#L216) | Unlinks/deletes the uploaded temp file from storage immediately if the target case is missing or the user is unauthorized. | `[x] OK` |
| | `uploadedBy` tracking | [case.prisma](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/config/prisma/schema/case.prisma), [case.service.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/modules/case/case.service.ts), [case.repository.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/modules/case/case.repository.ts) | Each case document stores the `uploadedById` FK referencing the `Users` table. The uploading user's id, name, username, and role are included in API responses via Prisma relation joins. | `[x] OK` |
| **D. Tutor Profiles** | Profile upserts & delete | [tutor.service.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/modules/tutor/tutor.service.ts) | Tutors manage qualifications and experience. Deleting a credential document deletes the DB record and unlinks file from disk. | `[x] OK` |
| | Tutors profile visibility | [tutor.service.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/modules/tutor/tutor.service.ts#L18) | Restricts profile viewing (`/tutors/:id`) so that tutor accounts are blocked from viewing other tutors' profiles. | `[x] OK` |
| | Parent directory browse | [tutor.repository.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/modules/tutor/tutor.repository.ts) | Supports paginated searches and keyword matching across public profiles, matching name, qualifications, and experiences using raw postgres array-to-string filters. | `[x] OK` |
| | Pagination validation | [tutor.controller.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/modules/tutor/tutor.controller.ts) | Validates query parameter inputs page and limit, rejecting negative or zero values with 400 Bad Request. | `[x] OK` |
| | Original Filename Preservation | [tutor.service.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/modules/tutor/tutor.service.ts) | Stores original client filename in `filename` database column and maps physical delete matching document ID (UUID) + extension. | `[x] OK` |
| | Document download & auth | [tutor.service.ts](https://github.com/ferdianqbl/tuition-workspace-api/blob/main/src/modules/tutor/tutor.service.ts) | Authorizes parents/admins to download tutor credentials, restricts tutors to their own credentials only, and streams file cleanly. | `[x] OK` |

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
