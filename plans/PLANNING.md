# Backend Planning & Architecture - Tuition Case Workspace

This folder contains the planning specifications, database designs, and API references for the **Tuition Case Workspace** backend service.

---

## 1. Document Index

- **System Architecture**: Read about the Express middleware stack and database pooling in [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md).
- **API Reference**: Read endpoint parameters and payload schemas in [API.md](./API.md).
- **Swagger Documentation**: Interactive OpenAPI explorer is available locally at `/api/docs`.

---

## 2. System Architecture Overview

The backend is built as a TypeScript-based Node/Express service:
- **Language**: TypeScript
- **Runtime**: Node.js
- **Routing Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma ORM

For details on security headers, cookie sessions, file uploads, and error handling, refer to the full [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) document.

---

## 3. Entity Relationship Diagram (ERD)

### Mermaid Specification

```mermaid
erDiagram
    Users {
        string id PK
        string username UK
        string password
        string name
        enum role "PARENT / TUTOR / ADMIN"
        timestamp createdAt
        timestamp updatedAt
    }

    TutorProfiles {
        string id PK
        string userId FK "one-to-one"
        string displayName
        string[] qualifications
        string[] experiences
        timestamp createdAt
        timestamp updatedAt
    }

    TutorDocuments {
        string id PK
        string tutorProfileId FK
        string filename
        integer size
        string mimeType
        timestamp uploadedAt
    }

    Cases {
        string id PK
        string userId FK
        string title
        string subject
        string level
        string location
        float budgetPerHour
        enum status "OPEN / MATCHED / CLOSED"
        timestamp createdAt
        timestamp updatedAt
    }

    CaseDocuments {
        string id PK
        string caseId FK
        string filename
        integer size
        string mimeType
        timestamp uploadedAt
    }

    CaseAccesses {
        string id PK
        string caseId FK
        string parentId FK
        string tutorId FK
        timestamp invitedAt
        timestamp revokedAt
    }

    Users ||--o| TutorProfiles : "has profile"
    Users ||--o{ Cases : "owns cases"
    Users ||--o{ CaseAccesses : "grants/receives access"
    TutorProfiles ||--o{ TutorDocuments : "holds credentials"
    Cases ||--o{ CaseDocuments : "holds study materials"
    Cases ||--o{ CaseAccesses : "holds invited access list"
```
