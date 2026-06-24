# Tuition Case Workspace - Backend API

This is the backend REST API service for the Tuition Case Workspace platform, built using Node.js, Express, TypeScript, and Prisma ORM with PostgreSQL.

---

## 1. Documentation Index

- Detailed backend roadmap, indices, and database ERD: [plans/PLANNING.md](./plans/PLANNING.md)
- Complete route paths, payloads, and response references: [plans/API.md](./plans/API.md)
- Express middleware logic and secure file constraints: [plans/SYSTEM_ARCHITECTURE.md](./plans/SYSTEM_ARCHITECTURE.md)

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
