import type { NextRequest } from "next/server";
import { getAuthUser, createApiResponse, createErrorResponse } from "@/lib/api-utils";
import { connectDB, Tenant } from "@/lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const authResult = await getAuthUser(request);
    if (!authResult) {
      return createErrorResponse("Unauthorized", 401);
    }
    const { user, tenant } = authResult;

    // Only allow 'admin' role to upgrade subscriptions
    if (user.role !== "admin") {
      return createErrorResponse("Forbidden: Only administrators can upgrade subscriptions", 403);
    }

    await connectDB();

    const { newPlan } = await request.json();

    if (!newPlan || (newPlan !== "free" && newPlan !== "pro")) {
      return createErrorResponse("Invalid plan specified", 400);
    }

    if (tenant.plan === newPlan) {
      return createApiResponse({ message: `Tenant is already on the ${newPlan} plan` }, 200);
    }

    let updatedMaxNotes = tenant.settings.maxNotes;
    let updatedMaxUsers = tenant.settings.maxUsers;

    if (newPlan === "pro") {
      updatedMaxNotes = 999999; // Effectively infinite
      updatedMaxUsers = 1000;
    } else if (newPlan === "free") {
      updatedMaxNotes = 3;
      updatedMaxUsers = 1;
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(
      tenant._id,
      { plan: newPlan, "settings.maxNotes": updatedMaxNotes, "settings.maxUsers": updatedMaxUsers, updatedAt: new Date() },
      { new: true }
    ).lean();

    if (!updatedTenant) {
      return createErrorResponse("Tenant not found", 404);
    }

    console.log(`Tenant ${tenant._id} upgraded to ${newPlan} plan. MaxNotes: ${updatedMaxNotes}, MaxUsers: ${updatedMaxUsers}`);

    return createApiResponse({
      message: `Tenant successfully upgraded to ${newPlan} plan.`,
      tenant: { ...updatedTenant, _id: updatedTenant._id.toString() },
    }, 200);

  } catch (error) {
    console.error("Error upgrading subscription:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export const runtime = 'nodejs'; // Use Node.js runtime
