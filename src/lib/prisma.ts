import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string | undefined {
  const envUrl = process.env.DATABASE_URL;
  if (!envUrl) return undefined;

  if (envUrl.startsWith("file:")) {
    const rawPath = envUrl.replace("file:", "");
    if (path.isAbsolute(rawPath) && fs.existsSync(rawPath)) {
      return `file:${rawPath}`;
    }

    const candidate1 = path.resolve(process.cwd(), rawPath);
    if (fs.existsSync(candidate1)) {
      return `file:${candidate1}`;
    }

    const candidate2 = path.resolve(process.cwd(), "prisma", "dev.db");
    if (fs.existsSync(candidate2)) {
      return `file:${candidate2}`;
    }

    const candidate3 = path.resolve(process.cwd(), "dev.db");
    if (fs.existsSync(candidate3)) {
      return `file:${candidate3}`;
    }
  }

  return envUrl;
}

export function createPrismaClient(): PrismaClient {
  const dbUrl = getDatabaseUrl();
  return new PrismaClient({
    datasources: dbUrl ? { db: { url: dbUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
