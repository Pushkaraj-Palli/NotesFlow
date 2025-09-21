// Authentication API endpoint
import type { NextRequest } from "next/server";
import { createToken, createApiResponse, createErrorResponse } from "@/lib/api-utils";
import { connectDB, User, Tenant } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { mapUserDocToAuthUser, mapTenantDocToAuthTenant } from "@/lib/api-utils";
import { AuthUser, AuthTenant } from "@/lib/types"; // Re-import AuthUser and AuthTenant
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    console.log("Login attempt received.");
    await connectDB();
    console.log("Database connected.");

    const { email, password } = await request.json();
    console.log(`Login attempt for email: ${email}`);

    if (!email || !password) {
      console.error("Email and password are required.");
      return createErrorResponse("Email and password are required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.error(`User with email ${email} not found.`);
      return createErrorResponse("Invalid credentials", 401);
    }
    console.log("User found.");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.error("Invalid password.");
      return createErrorResponse("Invalid credentials", 401);
    }
    console.log("Password valid.");

    let tenant = null;
    if (user.tenantId) {
      tenant = await Tenant.findById(user.tenantId);
    }

    if (!tenant) {
      console.warn(`Tenant not found for user ${user.email}. Creating a new default tenant.`);
      // Create a default tenant for the user
      const newTenant = await Tenant.create({ name: `${user.name || user.email}'s Default Tenant` });
      user.tenantId = newTenant._id as mongoose.Types.ObjectId; // Explicitly cast to ObjectId
      await user.save(); // Save the updated user with the new tenantId
      tenant = newTenant;
    }
    console.log("Tenant found (or created).");

    const token = createToken(mapUserDocToAuthUser(user as mongoose.Document & AuthUser));
    console.log("JWT token created.");

    return createApiResponse({
      user: mapUserDocToAuthUser(user as mongoose.Document & AuthUser),
      tenant: mapTenantDocToAuthTenant(tenant as mongoose.Document & AuthTenant),
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export const runtime = 'nodejs'; // Use Node.js runtime
