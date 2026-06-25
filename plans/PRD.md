# Product Requirement Document (PRD) - Tuition Case Workspace

This document defines the product vision, core scope, user roles, security criteria, and compilation/build validation results for the **Tuition Case Workspace** platform.

---

## 1. Product Vision

The Tuition Case Workspace is a secure, role-based platform designed to facilitate interactions between parents and tutors within tuition marketplaces.
- **Parents** can post tuition needs (cases) and invite specific tutors to upload/download study materials.
- **Tutors** can manage their professional credentials and securely browse the cases to which they have been invited.
- **Administrators** possess system-wide visibility to oversee cases and profiles.

---

## 2. Target User Personas & Access Roles

| Role | Description | Core Operations Permitted |
|---|---|---|
| **`PARENT`** | Represents parents searching for tutors. | Create and update own tuition cases, invite/revoke tutor access, upload and download files associated with their own cases. |
| **`TUTOR`** | Represents educators seeking teaching roles. | Browse and view details of cases they are invited to, manage their own tutor profile (qualifications, experiences), upload credentials/certifications, upload/download study materials for invited cases. |
| **`ADMIN`** | System administrators. | Read/write access to all cases, profiles, and documents across the system. |

---

## 3. Feature Scope & Requirements

### A. Authentication & Session Security
- **Goal**: Secure register/login flow ensuring credentials cannot be intercepted or spoofed.
- **Functional Requirements**:
  - Secure bcrypt hashing of user passwords on registration.
  - JWT token generation on successful login, containing role and user identifier.
  - Express authorization middleware to extract cookies/headers and authenticate sessions.
  - Custom require-role controls to enforce permission checks.

### B. Tuition Case Directory
- **Goal**: Allow parents to list teaching vacancies and allow tutors to see relevant invitations.
- **Functional Requirements**:
  - Parent case parameters: Title, Subject, Level, Location, Budget per hour, Status (`OPEN`/`MATCHED`/`CLOSED`).
  - Row-level access control:
    - Parents can only retrieve/query cases they own.
    - Tutors can only retrieve/query cases they have been granted access to.

### C. Secure Document Workspace
- **Goal**: Allow secure file attachments (lesson notes, worksheets, certifications) without exposing underlying filesystems or unauthorized access.
- **Functional Requirements**:
  - File upload restrictions: Type filter (PDF, DOCX, PNG, JPG) and size filter (maximum 5MB).
  - Obfuscated storage: Real filenames are saved in the DB; physical files are renamed to cryptographically random UUID names on disk.
  - Download checks: Re-authenticate download requests and verify user role/case access records prior to serving file streams.

---

## 4. Verification & Validation Results

To ensure the platform is production-ready, we executed the following validation tests:

### A. Compilation & Syntax Verification
- **Backend API Build**:
  - Command: `npm run build` inside `/be`
  - Result: **Passed**. Resolves tsconfig path aliases (`@/`) to relative imports and successfully outputs to clean CommonJS.
- **Frontend App Build**:
  - Command: `npm run build` inside `/fe`
  - Result: **Passed**. Next.js App Router and TypeScript compile successfully without syntax or type errors.

### B. Integration & CORS Verification
- **Dynamic CORS**:
  - Permitted origins list dynamically mirrors request headers to support standard credentials, avoiding browser wildcard rejections.
- **Swagger Documentation**:
  - Live Swagger/OpenAPI explorer successfully resolved on Vercel utilizing CDN static assets.

---

## 🔗 Cross-Repository References

- **Frontend Repository**: [tuition-workspace-fe](https://github.com/ferdianqbl/tuition-workspace-fe)
- **Frontend PRD Document**: [fe/plans/PRD.md](https://github.com/ferdianqbl/tuition-workspace-fe/blob/main/plans/PRD.md)
- **Backend Repository**: [tuition-workspace-api](https://github.com/ferdianqbl/tuition-workspace-api)
- **Live Swagger API Docs**: [Live API Swagger Docs (Vercel)](https://tuition-workspace-api.vercel.app/api/docs)
