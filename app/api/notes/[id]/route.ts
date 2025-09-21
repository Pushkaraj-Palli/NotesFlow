// Individual note operations (GET, PUT, DELETE)
import type { NextRequest } from "next/server";
import { getAuthUser, createApiResponse, createErrorResponse } from "@/lib/api-utils";
import { connectDB, Note } from "@/lib/mongodb";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await getAuthUser(request);
  if (!authResult) {
    return createErrorResponse("Unauthorized", 401);
  }
  const { user, tenant } = authResult;

  // Check if the user has the 'admin' or 'user' role
  if (user.role !== 'admin' && user.role !== 'user') {
    return createErrorResponse("Forbidden: Insufficient role", 403);
  }

  const { id } = params;

  try {
    await connectDB();
    const note = await Note.findOne({ _id: id, tenantId: tenant._id }).lean();

    if (!note) {
      return createErrorResponse("Note not found or unauthorized", 404);
    }

    return createApiResponse(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await getAuthUser(request);
  if (!authResult) {
    return createErrorResponse("Unauthorized", 401);
  }
  const { user, tenant } = authResult;

  // Check if the user has the 'admin' or 'user' role
  if (user.role !== 'admin' && user.role !== 'user') {
    return createErrorResponse("Forbidden: Insufficient role", 403);
  }

  const { id } = params;

  try {
    await connectDB();
    const updates = await request.json();

    const note = await Note.findOneAndUpdate(
      { _id: id, tenantId: tenant._id },
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();

    if (!note) {
      return createErrorResponse("Note not found or unauthorized", 404);
    }

    return createApiResponse(note);
  } catch (error) {
    console.error("Error updating note:", error);
    return createErrorResponse("Invalid request body or internal error", 400);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await getAuthUser(request);
  if (!authResult) {
    return createErrorResponse("Unauthorized", 401);
  }
  const { user, tenant } = authResult;

  // Check if the user has the 'admin' or 'user' role
  if (user.role !== 'admin' && user.role !== 'user') {
    return createErrorResponse("Forbidden: Insufficient role", 403);
  }

  const { id } = params;

  try {
    await connectDB();

    const result = await Note.deleteOne({ _id: id, tenantId: tenant._id });

    if (result.deletedCount === 0) {
      return createErrorResponse("Note not found or unauthorized", 404);
    }

    return createApiResponse({ message: "Note deleted successfully" }, 200);
  } catch (error) {
    console.error("Error deleting note:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export const runtime = 'nodejs'; // Use Node.js runtime
