# 🎓 Tuition Case Workspace - Backend API

This is the backend REST API service for the Tuition Case Workspace platform, built using Node.js, Express, TypeScript, and Prisma ORM with PostgreSQL.

---

## 🌐 Live Deployments & Repositories

- **Frontend Client Web App**: [Live Deployment (Vercel)](https://tuition-workspace-fe.vercel.app/) | [GitHub Repository](https://github.com/ferdianqbl/tuition-workspace-fe)
- **Backend API Gateway**: [Live API Swagger Docs (Vercel)](https://tuition-workspace-api.vercel.app/api/docs) | [GitHub Repository](https://github.com/ferdianqbl/tuition-workspace-api)

---

## 📄 Documentation Index

### Backend Documentation (Local Relative Links)
- **Product Requirement Document**: Read the platform's vision, roles, features, and validation results in [plans/PRD.md](./plans/PRD.md).
- **Validation Results**: Read the backend validation checklist and database config results in [plans/VALIDATION.md](./plans/VALIDATION.md).
- **Backend Master Plan**: Read about planning roadmaps and the database ERD in [plans/PLANNING.md](./plans/PLANNING.md).
- **Backend API Specs**: Read about endpoint paths, payloads, and response interfaces in [plans/API.md](./plans/API.md).
- **Backend System Architecture**: Read about Express middleware configurations and Supabase/Prisma pooling in [plans/SYSTEM_ARCHITECTURE.md](./plans/SYSTEM_ARCHITECTURE.md).

### Connected Frontend Documentation (GitHub Absolute Links)
- **Frontend Product Requirement Document**: Read about system scope, roles, and frontend requirements in [plans/PRD.md](https://github.com/ferdianqbl/tuition-workspace-fe/blob/main/plans/PRD.md).
- **Frontend Validation Results**: Read the frontend validation checklist and compile results in [plans/VALIDATION.md](https://github.com/ferdianqbl/tuition-workspace-fe/blob/main/plans/VALIDATION.md).
- **Frontend Master Plan & Routing**: Read about Next.js page maps and paths in [plans/PLANNING.md](https://github.com/ferdianqbl/tuition-workspace-fe/blob/main/plans/PLANNING.md).
- **Frontend System Architecture**: Read about the Axios interceptors, caching layers, and folder maps in [plans/SYSTEM_ARCHITECTURE.md](https://github.com/ferdianqbl/tuition-workspace-fe/blob/main/plans/SYSTEM_ARCHITECTURE.md).
- **Frontend UI/UX Design System**: Read about colors, typography, roundings, and styled primitives in [plans/DESIGN.md](https://github.com/ferdianqbl/tuition-workspace-fe/blob/main/plans/DESIGN.md).

---

## 🧠 Technical Design Decisions & Justifications (Backend)

Here are the technical explanations and justifications for the backend architecture and security rules as required by the technical test specification.

### 1. Framework & Database Stack Choices
* **Core Framework**: Node.js & Express.js with TypeScript.
  * *Justification*: Express.js was chosen over NestJS to keep the backend lightweight, highly customizable, and easy to inspect. It integrates seamlessly with `swagger-ui-express` for API documentation and allows writing clean, explicit middleware validation pipelines without decorators or configuration overhead.
* **Database & ORM**: PostgreSQL database hosted on Supabase, accessed via **Prisma ORM**.
  * *Justification*: Prisma ORM provides a type-safe client that maps strictly to TypeScript interfaces. It compiles queries cleanly, provides visual migration control, and handles transactional/session connection pooling.

### 2. Authentication, Token Expiry, & Passwords (Section A)
* **Choice**: Stateless **JWT (JSON Web Token)** session tokens generated via `jsonwebtoken` with HMAC-SHA256 signatures.
* **Token Handlers**:
  * Extracted from the `Authorization: Bearer <token>` header for general REST requests.
  * Extracted from cookies using `cookie-parser` for direct file download streams, facilitating native browser file pipes.
* **Session Expiry**:
  * Tokens carry a defined expiration window. If a client sends an expired or invalid token, the auth middleware (`authenticate` in [auth.middleware.ts](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/sibyl/tuition-workspace/be/src/middlewares/auth.middleware.ts)) intercepts the request and throws a `401 Unauthorized` response immediately.
* **Password Hashing**:
  * User passwords are hashed using `bcryptjs` with **10 salt rounds** in [user.service.ts](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/sibyl/tuition-workspace/be/src/modules/user/user.service.ts).
* **Information Leak Prevention**:
  * A global error boundary [error.middleware.ts](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/sibyl/tuition-workspace/be/src/middlewares/error.middleware.ts) intercepts all server errors. In production mode, any internal `500` database or server error hides raw stack traces and returns a generic `"An unexpected database or server error occurred"` response to prevent database leakage.

### 3. Resource Existence & Access Controls (Section C)
* **Status Code Expectations**:
  * `401 Unauthorized`: Unauthenticated session requests.
  * `403 Forbidden`: Authenticated, but lacks role/ownership/invite permission (e.g. Parent viewing another parent's case, Tutor viewing another tutor's profile).
  * `404 Not Found`: Query target does not exist.
* **Existence Leakage Tradeoff**:
  * Returning `404` for unauthorized cases stops attackers from probing if a case ID exists. However, we chose to return `403 Forbidden` for existing unauthorized cases to enable granular frontend alerts (such as rendering clear access-denied pages).
  * To mitigate ID enumeration or scraping risk, **all resource identifiers use random UUIDv4 keys**. Because a UUIDv4 has 122 bits of randomness, database record scanning is mathematically impossible.

### 4. File Upload & Download Security (Section D)
* **File Constraints**:
  * *Max File Size*: Set to **5MB** (enforced by Multer's `limits` in [upload.middleware.ts](file:///Users/ferdianqbl/_WORK/Exploration/FS/tech-test/sibyl/tuition-workspace/be/src/middlewares/upload.middleware.ts)).
  * *Allowed File Types*: Restrict to `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX), `image/png`, and `image/jpeg`.
* **Path Traversal Protection**:
  * To prevent attackers from passing malicious path segments in files, Multer strips the original filename and saves the upload using a randomly generated UUID string (e.g. `documentId + extension`) in the server's uploads folder.
  * Original names are kept solely inside database metadata and restored only inside the `Content-Disposition` header during download.
* **Internal Path Leaks**:
  * Server disk paths are never exposed in API payloads; file metadata only includes UUIDs, filenames, sizes, and timestamps.
* **Download Authorization Re-Check**:
  * Document download routes (`GET /api/cases/:caseId/documents/:docId/download` and `GET /api/tutors/documents/:docId`) re-run the `authenticate` and case-access/ownership validations. They check if the parent is the case owner, or if the tutor is invited (or owns the profile), before streaming the physical file to the client.

### 5. Tutor Profile Directory Access Controls (Section E)
* **Access Rules**:
  * Tutors are strictly **blocked** from searching/browsing the tutor directory or reading other tutors' profile detail pages (`/api/tutors/:id` throws `403 Forbidden` for tutors).
  * *Why*: Protects tutor privacy, blocks competitor scraping/rates scouting, and keeps tutors focused on their active invitations and profiles.

---

## 2. Prerequisites & Environment Variables

Create a `.env` file at the root of the `/be` directory with the following variables:

```ini
PORT=8000
NODE_ENV=development

# Prisma transaction-mode database connection url (pooler port 6543)
DATABASE_URL="postgresql://<user>:<password>@<host>:6543/<db>?pgbouncer=true"

# Prisma session-mode database connection url (direct port 5432 for migrations)
DIRECT_URL="postgresql://<user>:<password>@<host>:5432/<db>"

# JWT Encryption Secret
JWT_SECRET="your-super-secure-jwt-signature-key-secret"
```

---

## Seed Data & Credentials

The database comes pre-seeded with a comprehensive set of mock accounts for testing. All accounts share the same password: **`Password123`**.

| Username | Role | Purpose |
|---|---|---|
| `admin` | `ADMIN` | System administrator with full access to cases/profiles |
| `parent1` | `PARENT` | Parent account with cases (P5 Science, Sec 4 Math) |
| `parent2` | `PARENT` | Parent account with cases (JC 2 Chemistry) |
| `parent3` | `PARENT` | Parent account with cases (Empty profile) |
| `tutor1` | `TUTOR` | Mathematics Specialist (NUS BSc) |
| `tutor2` | `TUTOR` | English & Literature Specialist (NTU MA) |
| `tutor3` | `TUTOR` | Computer Science Tutor (SMU) |
| `tutor4` | `TUTOR` | Chemistry Tutor (NUS PhD) |
| `tutor5` | `TUTOR` | Physics Tutor (NUS BSc) |

---

## 3. Local Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Generate Database Client**:
   Generate the type-safe Prisma client:
   ```bash
   npx prisma generate
   ```

3. **Database Migration** (If creating/modifying schemas):
   ```bash
   npx prisma db push
   ```

4. **Seed Database**:
   Populate the Postgres database with pre-configured Parent, Tutor, and Admin credentials:
   ```bash
   npx prisma db seed
   ```

5. **Start Dev Server**:
   ```bash
   npm run dev
   ```
   *The backend will be live at `http://localhost:8000`. Swagger OpenAPI docs will be available at `http://localhost:8000/api/docs`.*
