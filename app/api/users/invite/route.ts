import type { NextRequest } from "next/server";
import { getAuthUser, createApiResponse, createErrorResponse } from "@/lib/api-utils";
import { connectDB, User, Tenant } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { AuthUser } from "@/lib/types";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser(request);
    if (!authResult) {
      return createErrorResponse("Unauthorized", 401);
    }
    const { user, tenant } = authResult;

    // Only allow 'admin' role to invite users
    if (user.role !== "admin") {
      return createErrorResponse("Forbidden: Only administrators can invite users", 403);
    }

    await connectDB();

    const { email, role = "user" } = await request.json();

    if (!email) {
      return createErrorResponse("Email is required for invitation", 400);
    }

    if (!["admin", "user"].includes(role)) {
      return createErrorResponse("Invalid role specified", 400);
    }

    const existingUser = await User.findOne({ email, tenantId: tenant._id });
    if (existingUser) {
      return createErrorResponse("User with this email already exists in your tenant", 409);
    }

    // Set a default password for the invited user
    const temporaryPassword = "password";
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const invitedUser = await User.create({
      email,
      password: hashedPassword,
      name: `Invited User (${email})`, // Placeholder name
      tenantId: tenant._id as mongoose.Types.ObjectId,
      role,
    });

    console.log(`Invited user ${email} with role ${role} to tenant ${tenant._id}. Temporary password: ${temporaryPassword}`);
    // In a real application, you would send an email with the invitation and temporary password.

    return createApiResponse({
      message: `User ${email} invited successfully as ${role}. Temporary password set.`,
      user: {
        _id: invitedUser._id,
        email: invitedUser.email,
        name: invitedUser.name,
        role: invitedUser.role,
        tenantId: invitedUser.tenantId,
      },
    }, 201);

  } catch (error) {
    console.error("Error inviting user:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export const runtime = 'nodejs'; // Use Node.js runtime
