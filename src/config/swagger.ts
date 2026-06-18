import { Router } from "express";
import swaggerUi from "swagger-ui-express";

const router = Router();

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Tuition Marketplace API",
    version: "1.0.0",
    description: "API documentation for the Tuition Marketplace backend service, supporting Parents, Tutors, and Admins.",
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "token",
        description: "JWT session token stored in secure http-only cookie.",
      },
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Fallback JWT Bearer token in Authorization header.",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          username: { type: "string" },
          name: { type: "string" },
          role: { type: "string", enum: ["PARENT", "TUTOR", "ADMIN"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      TutorProfile: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          displayName: { type: "string" },
          qualifications: { type: "array", items: { type: "string" } },
          experiences: { type: "array", items: { type: "string" } },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          documents: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                filename: { type: "string" },
                size: { type: "integer" },
                mimeType: { type: "string" },
                uploadedAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
      },
      TuitionCase: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          title: { type: "string" },
          subject: { type: "string" },
          level: { type: "string" },
          location: { type: "string" },
          budgetPerHour: { type: "number" },
          status: { type: "string", enum: ["OPEN", "MATCHED", "CLOSED"] },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  security: [
    { cookieAuth: [] },
    { bearerAuth: [] },
  ],
  paths: {
    "/auth/register": {
      post: {
        summary: "Register a new user",
        description: "Creates a Parent or Tutor account.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password", "name", "role"],
                properties: {
                  username: { type: "string" },
                  password: { type: "string" },
                  name: { type: "string" },
                  role: { type: "string", enum: ["PARENT", "TUTOR"] },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    code: { type: "integer" },
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login",
        description: "Authenticates user and sets session cookie.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Successful login",
            headers: {
              "Set-Cookie": {
                schema: { type: "string" },
                description: "Contains JWT session token",
              },
            },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        summary: "Logout",
        description: "Clears session cookie.",
        responses: {
          200: { description: "Logged out successfully" },
        },
      },
    },
    "/auth/me": {
      get: {
        summary: "Current session",
        description: "Gets the authenticated user's details.",
        responses: {
          200: {
            description: "Current user profile",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    code: { type: "integer" },
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/tutors": {
      get: {
        summary: "List tutor profiles",
        description: "Parents/Admins only. Searches and returns paginated tutor profiles.",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Tutors list retrieved successfully" },
        },
      },
      post: {
        summary: "Upsert profile",
        description: "Tutors only. Creates or updates the authenticated tutor's profile.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["displayName"],
                properties: {
                  displayName: { type: "string" },
                  qualifications: { type: "array", items: { type: "string" } },
                  experiences: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Profile updated successfully" },
        },
      },
    },
    "/tutors/me": {
      get: {
        summary: "Get my tutor profile",
        description: "Tutors only. Fetches the logged-in tutor's profile details.",
        responses: {
          200: { description: "Tutor profile retrieved successfully" },
        },
      },
    },
    "/tutors/:id": {
      get: {
        summary: "Get tutor profile by ID",
        description: "Parents can view any. Tutors can only view their own profile.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Tutor profile retrieved successfully" },
          403: { description: "Access Denied: Tutors cannot view other tutors" },
        },
      },
    },
    "/tutors/documents": {
      post: {
        summary: "Upload tutor document",
        description: "Tutors only. Uploads qualification certifications.",
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Document uploaded successfully" },
        },
      },
    },
    "/tutors/documents/:docId": {
      delete: {
        summary: "Delete tutor document",
        description: "Tutors only. Removes custom document qualification.",
        parameters: [
          { name: "docId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Document deleted successfully" },
        },
      },
    },
    "/cases": {
      get: {
        summary: "List tuition cases",
        description: "Parents view their own cases. Tutors view cases they are invited to.",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "subject", in: "query", schema: { type: "string" } },
          { name: "level", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["OPEN", "MATCHED", "CLOSED"] } },
        ],
        responses: {
          200: { description: "Cases list retrieved successfully" },
        },
      },
      post: {
        summary: "Create a tuition case",
        description: "Parents only. Publishes a new tuition requirement.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "subject", "level", "location", "budgetPerHour"],
                properties: {
                  title: { type: "string" },
                  subject: { type: "string" },
                  level: { type: "string" },
                  location: { type: "string" },
                  budgetPerHour: { type: "number" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Tuition case created successfully" },
        },
      },
    },
    "/cases/:id": {
      get: {
        summary: "Get tuition case detail",
        description: "Restricted to owner parent, invited tutor, or Admin.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Tuition case retrieved successfully" },
        },
      },
      patch: {
        summary: "Update tuition case",
        description: "Owner parent or Admin only. Updates case details.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  subject: { type: "string" },
                  level: { type: "string" },
                  location: { type: "string" },
                  budgetPerHour: { type: "number" },
                  status: { type: "string", enum: ["OPEN", "MATCHED", "CLOSED"] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Tuition case updated successfully" },
        },
      },
    },
    "/cases/:id/access": {
      post: {
        summary: "Invite a tutor",
        description: "Owner parent only. Grants a tutor access to see case details.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["tutorId"],
                properties: {
                  tutorId: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Tutor invited successfully" },
        },
      },
    },
    "/cases/:id/access/:tutorId": {
      delete: {
        summary: "Revoke tutor access",
        description: "Owner parent only. Revokes tutor access to case details.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "tutorId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Tutor access revoked successfully" },
        },
      },
    },
    "/cases/:id/documents": {
      post: {
        summary: "Upload case document",
        description: "Owner parent, invited tutor, or Admin only. Uploads tuition case resources.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Document uploaded successfully" },
        },
      },
    },
    "/cases/:id/documents/:docId/download": {
      get: {
        summary: "Download case document",
        description: "Owner parent, invited tutor, or Admin only. Downloads resource.",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "docId", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "File streaming download" },
        },
      },
    },
  },
};

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
