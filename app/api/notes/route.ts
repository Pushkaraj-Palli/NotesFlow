// Notes CRUD API endpoints
import type { NextRequest } from "next/server";
import { getAuthUser, createApiResponse, createErrorResponse } from "@/lib/api-utils";
import { connectDB, Note } from "@/lib/mongodb";
import type { Note as INote } from "@/lib/types";

export async function GET(request: NextRequest) {
  const authResult = await getAuthUser(request);
  if (!authResult) {
    return createErrorResponse("Unauthorized", 401);
  }
  const { user, tenant } = authResult;

  try {
    await connectDB();

    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const tags = url.searchParams.get("tags")?.split(",").filter(Boolean);

    const query: any = { tenantId: tenant._id };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    const notes = await Note.find(query)
      .sort({ isPinned: -1, updatedAt: -1 })
      .lean();

    return createApiResponse(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return createErrorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  const authResult = await getAuthUser(request);
  if (!authResult) {
    return createErrorResponse("Unauthorized", 401);
  }
  const { user, tenant } = authResult;

  try {
    await connectDB();
    const { title, content, tags = [] } = await request.json();

    if (!title || !content) {
      return createErrorResponse("Title and content are required", 400);
    }

    const newNote = await Note.create({
      title,
      content,
      tags,
      tenantId: tenant._id,
      userId: user.user._id,
      isPinned: false,
    });

    return createApiResponse(newNote.toObject(), 201);
  } catch (error) {
    console.error("Error creating note:", error);
    return createErrorResponse("Invalid request body or internal error", 400);
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await getAuthUser(request);
  if (!authResult) {
    return createErrorResponse("Unauthorized", 401);
  }
  const { user, tenant } = authResult;
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
