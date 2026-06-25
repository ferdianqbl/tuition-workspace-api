import path from "node:path";
import fs from "node:fs";

// Vercel serverless environments have a read-only filesystem, except for the /tmp folder.
// We resolve the uploads path to /tmp in production/Vercel or a local folder in development.
export const UPLOADS_DIR = process.env.VERCEL || process.env.NODE_ENV === "production"
  ? "/tmp"
  : path.join(process.cwd(), "uploads");

// Ensure the directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
