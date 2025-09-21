// Utility functions for API operations and JWT handling
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB, User, Tenant } from "@/lib/mongodb";
import type { User as AuthUser, Tenant as AuthTenant } from "./types";
import mongoose from "mongoose";

interface JwtPayload {
  userId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
console.log("lib/api-utils.ts: JWT_SECRET used for token ops:", JWT_SECRET); // Log JWT_SECRET

// Helper function to map Mongoose UserDoc to AuthUser
export function mapUserDocToAuthUser(userDoc: mongoose.Document & AuthUser): AuthUser {
  return {
    _id: userDoc._id,
    email: userDoc.email,
    name: userDoc.name,
    tenantId: userDoc.tenantId,
    role: userDoc.role,
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };
}

// Helper function to map Mongoose TenantDoc to AuthTenant
export function mapTenantDocToAuthTenant(tenantDoc: mongoose.Document & AuthTenant): AuthTenant {
  return {
    _id: tenantDoc._id,
    name: tenantDoc.name,
    plan: tenantDoc.plan,
    settings: tenantDoc.settings,
    createdAt: tenantDoc.createdAt,
    updatedAt: tenantDoc.updatedAt,
  };
}

export function createToken(user: AuthUser): string {
  const payload: JwtPayload = {
    userId: user._id,
    tenantId: user.tenantId,
  };
  console.log("lib/api-utils.ts: Creating token with payload:", payload); // Log payload before signing
  return jwt.sign({ ...payload, userId: payload.userId.toString(), tenantId: payload.tenantId.toString() }, JWT_SECRET, { expiresIn: "1d" });
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    console.log("lib/api-utils.ts: Attempting to verify token."); // Log verification attempt
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    console.log("lib/api-utils.ts: Decoded JWT payload:", decoded);
    return decoded;
  } catch (error) {
    console.error("lib/api-utils.ts: JWT verification failed:", error);
    return null;
  }
}

export async function getAuthUser(request: NextRequest): Promise<{ user: AuthUser; tenant: AuthTenant } | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    console.warn("No Authorization header or not a Bearer token.");
    return null;
  }

  const token = authHeader.substring(7);
  const decoded = await verifyToken(token);

  if (!decoded) {
    console.warn("Failed to decode or verify token.");
    return null;
  }

  await connectDB();
  console.log(`Fetching user with ID: ${decoded.userId}, tenant with ID: ${decoded.tenantId}`);
  const userDoc = await User.findById(decoded.userId);
  const tenantDoc = await Tenant.findById(decoded.tenantId);

  if (!userDoc || !tenantDoc) {
    console.error(`User or Tenant not found for decoded IDs. UserDoc: ${!!userDoc}, TenantDoc: ${!!tenantDoc}`);
    return null;
  }

  const user = mapUserDocToAuthUser(userDoc as mongoose.Document & AuthUser);
  const tenant = mapTenantDocToAuthTenant(tenantDoc as mongoose.Document & AuthTenant);

  console.log("AuthUser and AuthTenant successfully retrieved.", { user, tenant });

  return {
    user: user,
    tenant: tenant,
  };
}

export function createApiResponse(data: any, status = 200) {
  return Response.json(data, { status });
}

export function createErrorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

