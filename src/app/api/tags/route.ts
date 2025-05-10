// File: app/api/tags/route.ts
import { db } from "@/db";
import { NewTag, TagsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    // const session = await auth();
    // if (!session || !session.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await req.json();
    const { name, description, color, organizationId ,createdBy } = body;

    // Validate required fields
    if (!name || !organizationId) {
      return NextResponse.json(
        { error: "Missing required fields: name, organizationId" },
        { status: 400 }
      );
    }

    // Create new tag
    const newTag: NewTag = {
      name,
      description,
      color: color || "#3b82f6", // Default blue
      organizationId,
      createdBy,
    };

    const tag = await db.insert(TagsTable).values(newTag).returning();

    return NextResponse.json(tag[0], { status: 201 });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: "Failed to create tag" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verify user is authenticated
    // const session = await auth();
    // if (!session || !session.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Get query parameters
    const url = new URL(req.url);
    const organizationId = url.searchParams.get("organizationId");

    // Validate required fields
    if (!organizationId) {
      return NextResponse.json(
        { error: "Missing required field: organizationId" },
        { status: 400 }
      );
    }

    const tags = await db
      .select()
      .from(TagsTable)
      .where(eq(TagsTable.organizationId, organizationId));

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}