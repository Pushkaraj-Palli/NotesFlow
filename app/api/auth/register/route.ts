import type { NextRequest } from "next/server";
import { createToken, createApiResponse, createErrorResponse } from "@/lib/api-utils";
import { connectDB, User, Tenant } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { mapUserDocToAuthUser, mapTenantDocToAuthTenant } from "@/lib/api-utils";
import { AuthUser, AuthTenant } from "@/lib/types";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    console.log("Registration attempt received.");
    await connectDB();
    console.log("Database connected for registration.");

    const { email, password, name } = await request.json();
    console.log(`Registration attempt for email: ${email}, name: ${name}`);

    if (!email || !password || !name) {
      console.error("Email, password, and name are required for registration.");
      return createErrorResponse("Email, password, and name are required", 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error(`User with email ${email} already exists.`);
      return createErrorResponse("User with this email already exists", 409);
    }
    console.log("No existing user found.");

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Password hashed.");

    const newTenant = await Tenant.create({ name: `${name}'s Tenant`, plan: 'free' });
    console.log(`New tenant created with ID: ${newTenant._id}, plan: ${newTenant.plan}`);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      tenantId: newTenant._id as mongoose.Types.ObjectId, // Explicitly cast to ObjectId
    });
    console.log(`New user created with ID: ${newUser._id}`);

    const token = createToken(mapUserDocToAuthUser(newUser as mongoose.Document & AuthUser));
    console.log("JWT token created for new user.");

    return createApiResponse({
      user: mapUserDocToAuthUser(newUser as mongoose.Document & AuthUser),
      tenant: mapTenantDocToAuthTenant(newTenant as mongoose.Document & AuthTenant),
      token,
    }, 201);
  } catch (error) {
    console.error("Registration error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export const runtime = 'nodejs'; // Use Node.js runtime
