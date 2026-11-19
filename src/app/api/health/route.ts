import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "not set";
  const prismaDbPath = path.resolve(process.cwd(), "prisma", "dev.db");
  const rootDbPath = path.resolve(process.cwd(), "dev.db");

  let dbStatus = "unknown";
  let userCount = 0;
  let dbError = null;

  try {
    userCount = await prisma.user.count();
    dbStatus = "connected";
  } catch (err: any) {
    dbStatus = "error";
    dbError = err.message;
  }

  return NextResponse.json({
    status: dbStatus === "connected" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
    database: {
      status: dbStatus,
      configuredUrl: dbUrl,
      error: dbError,
      userCount,
      files: {
        prismaDevDbExists: fs.existsSync(prismaDbPath),
        rootDevDbExists: fs.existsSync(rootDbPath),
      },
    },
  });
}
