// Pin/unpin note endpoint
import type { NextRequest } from "next/server";
import { getAuthUser, createApiResponse, createErrorResponse } from "@/lib/api-utils";
import { connectDB, Note } from "@/lib/mongodb";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const note = await Note.findOne({ _id: id, tenantId: tenant._id });
    if (!note) {
      return createErrorResponse("Note not found or unauthorized", 404);
    }

    note.isPinned = !note.isPinned;
    note.updatedAt = new Date();
    await note.save();

    return createApiResponse(note.toObject());
  } catch (error) {
    console.error("Error toggling pin status:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export const runtime = 'nodejs'; // Use Node.js runtime
