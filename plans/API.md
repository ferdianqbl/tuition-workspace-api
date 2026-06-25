# API Reference - Tuition Case Workspace

This document defines the REST API endpoints, method paths, request payloads, response bodies, and role-based permissions enforced by the backend service.

---

## 1. Authentication Module (`/api/auth`)

### Register User
* **Path**: `POST /api/auth/register`
* **Role**: Public
* **Payload**:
  ```json
  {
    "username": "tutor5",
    "password": "Password123",
    "name": "Physics Tutor",
    "role": "TUTOR" // or "PARENT"
  }
  ```
* **Success (201)**: Returns user model.

### Login Session
* **Path**: `POST /api/auth/login`
* **Role**: Public
* **Payload**:
  ```json
  {
    "username": "tutor5",
    "password": "Password123"
  }
  ```
* **Success (200)**: Returns user info and issues token.

### Current Session (Who Am I)
* **Path**: `GET /api/auth/me`
* **Role**: Authenticated
* **Success (200)**: Returns current user object.

### Logout Session
* **Path**: `POST /api/auth/logout`
* **Role**: Authenticated
* **Success (200)**: Clears token cookie.

---

## 2. Tutor Module (`/api/tutors`)

### Browse Tutor Directory
* **Path**: `GET /api/tutors`
* **Role**: `PARENT` / `ADMIN`
* **Query Parameters**: `page` (number), `limit` (number), `search` (keyword filter)
* **Success (200)**: Paginated tutor profile lists.

### Fetch Public Tutor Details
* **Path**: `GET /api/tutors/:id`
* **Role**: `PARENT` / `ADMIN` / `TUTOR`
* **Success (200)**: Tutor profile object with credentials list.

### Get Self Tutor Profile
* **Path**: `GET /api/tutors/me`
* **Role**: `TUTOR`
* **Success (200)**: Returns profile for logged-in tutor.

### Upsert Tutor Profile
* **Path**: `POST /api/tutors`
* **Role**: `TUTOR` (owner only)
* **Payload**:
  ```json
  {
    "displayName": "Tutor User 5 (H2 Physics)",
    "qualifications": ["BSc Physics (NUS)"],
    "experiences": ["10 years teaching"]
  }
  ```
* **Success (200)**: Updated tutor profile.

### Upload Tutor Document
* **Path**: `POST /api/tutors/documents`
* **Role**: `TUTOR` (owner only)
* **Payload**: Multipart file upload (`file`)
* **Success (201)**: Document meta payload.

### Delete Tutor Document
* **Path**: `DELETE /api/tutors/documents/:docId`
* **Role**: `TUTOR` (owner only)
* **Success (200)**: Returns success status.

---

## 3. Cases Module (`/api/cases`)

### Browse Cases List
* **Path**: `GET /api/cases`
* **Role**: `PARENT` / `TUTOR`
* **Filtering**: Enforces role constraints. Parents see only their own cases; Tutors see only cases they are invited to.
* **Success (200)**: Paginated cases list.

### Create Case
* **Path**: `POST /api/cases`
* **Role**: `PARENT`
* **Payload**:
  ```json
  {
    "title": "Primary 5 Math Tuition",
    "subject": "Mathematics",
    "level": "Primary 5",
    "location": "Jurong East",
    "budgetPerHour": 45
  }
  ```
* **Success (201)**: Created Case payload.

### Update Case Info
* **Path**: `PATCH /api/cases/:id`
* **Role**: `PARENT` (owner only) / `ADMIN`
* **Payload**: Optional update fields (`title`, `subject`, `level`, `location`, `budgetPerHour`, `status`).
* **Success (200)**: Updated Case payload.

### Invite Tutor to Case
* **Path**: `POST /api/cases/:id/access`
* **Role**: `PARENT` (owner only)
* **Payload**:
  ```json
  {
    "tutorId": "tutor-uuid"
  }
  ```
* **Success (200)**: Access record payload.

### Revoke Tutor Access
* **Path**: `DELETE /api/cases/:id/access/:tutorId`
* **Role**: `PARENT` (owner only)
* **Success (200)**: Returns success status.

### Upload Case Document
* **Path**: `POST /api/cases/:id/documents`
* **Role**: `PARENT` (owner) / `TUTOR` (invited only)
* **Payload**: Multipart file upload (`file`)
* **Success (201)**: Document details.

### Download Case Document
* **Path**: `GET /api/cases/:id/documents/:docId/download`
* **Role**: `PARENT` (owner) / `TUTOR` (invited only)
* **Success (200)**: Returns file stream.

---

## 🔗 Cross-Repository References

- **Frontend Repository**: [tuition-workspace-fe](https://github.com/ferdianqbl/tuition-workspace-fe)
- **Frontend services directory (API callers)**: [src/services](https://github.com/ferdianqbl/tuition-workspace-fe/tree/main/src/services)
- **Frontend Master Plan & Routing**: [plans/PLANNING.md](https://github.com/ferdianqbl/tuition-workspace-fe/blob/main/plans/PLANNING.md)
- **Frontend System Architecture**: [plans/SYSTEM_ARCHITECTURE.md](https://github.com/ferdianqbl/tuition-workspace-fe/blob/main/plans/SYSTEM_ARCHITECTURE.md)
- **Live Frontend Web App**: [Live Deployment (Vercel)](https://tuition-workspace-fe.vercel.app/)
