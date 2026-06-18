import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "tuition-marketplace-fallback-secret-key-9988";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as Exclude<
      jwt.SignOptions["expiresIn"],
      undefined
    >,
  });
}

export function verifyToken(token: string): jwt.JwtPayload | string | null {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
