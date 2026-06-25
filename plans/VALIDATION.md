# Backend Verification & Validation Results - Tuition Case Workspace

This document verifies and validates that the backend REST API complies with all functional and security requirements defined in the technical test specification.

---

## 1. Requirement Traceability Matrix

Here is how the Express/Prisma/PostgreSQL backend implements each section of the technical test:

### A. Users, Auth, and Sessions
* **Bcrypt Password Hashing**: Utilizes `bcryptjs` with salt round factors of 10 to securely hash passwords during `POST /api/auth/register` before saving to the Database.
* **JWT Tokens & Expiry**: Issued upon login via `POST /api/auth/login`. Signatures utilize HMAC-SHA256 containing role and user ID payload. Expired tokens are rejected by token verification middlewares.
* **Cookie and Header Access**: Express parses tokens from HttpOnly cookies or Bearer Authorization headers.
* **Error Masking**: Global error handler middleware intercepts exceptions, logs details privately to stdout/cloudwatch, and returns standard generic JSON payloads to clients without leaking sensitive stack traces.

### B. Tuition Cases Directory
* **Row-Level Access Controls (C)**:
  - Inside case modules, the database service dynamically attaches owner and invitation checks to all requests.
  - Parents are restricted to queries matching `ownerId = currentUserId`.
  - Tutors are restricted to queries matching cases they are invited to via the `CaseAccess` mapping table.
  - Unauthorized requests return standard `403 Forbidden` errors. Attempting to search for cases that do not exist or are forbidden resolves to `404 Not Found` to prevent account scanning.

### C. Secure Document Workspace (D)
* **Multer File Handling & MIME Checks**: Requests pass through Multer configuration limits. Rejects any file payload exceeding 5MB, or carrying extensions outside PDF, DOCX, PNG, and JPEG.
* **Random UUID Filename Obfuscation**: Real filenames are stored safely in the database, while physical files are renamed to cryptographically random UUID formats on disk (e.g. `c7a52f9c-1122-4433-8899-abcdef123456.pdf`), mitigating directory traversal and filename sniffing attacks.
* **Permission Recheck on Download**: Access lists are re-verified inside `GET /api/cases/:caseId/documents/:docId/download` to ensure access has not been revoked in the interim.

### D. Tutor Profiles (E)
* **Tutor Profile Separation**: Only tutors can upsert their professional profile or upload corresponding credential attachments.
* **Parent Directory Query**: Parents can execute paginated searches across public tutor profiles, searching by tutor name keyword. Tutors cannot browse other tutors' directories.

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
