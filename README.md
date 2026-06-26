# Tuition Case Workspace - Backend API

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
| `parent3` | `PARENT` | Parent account with cases |
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
