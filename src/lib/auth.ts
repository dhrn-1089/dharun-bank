import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "afs_super_secure_jwt_secret_key_2026_financial_platform";

export interface TokenPayload {
  userId: string;
  userType: "CUSTOMER" | "ADMIN";
  role?: string; // If admin: SUPER_ADMIN, etc.
  customerId?: string; // If customer: AFS10001
  adminProfileId?: string;
  branchId?: string | null;
  email?: string | null;
  phone: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentSession(): Promise<TokenPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("afs_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}
