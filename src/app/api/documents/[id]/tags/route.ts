// File: app/api/documents/tags/route.ts
import { db } from "@/db";
import { DocumentsTable, DocumentTagsTable, TagsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    // const session = await auth();
    // if (!session || !session.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { searchParams } = req.nextUrl;
    const documentId = searchParams.get("id");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { tagId, addedBy } = body;

    // Validate required fields
    if (!tagId) {
      return NextResponse.json(
        { error: "Missing required field: tagId" },
        { status: 400 }
      );
    }

    // Verify document exists
    const document = await db
      .select()
      .from(DocumentsTable)
      .where(eq(DocumentsTable.id, documentId))
      .limit(1);

    if (!document.length) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Verify tag exists
    const tag = await db
      .select()
      .from(TagsTable)
      .where(eq(TagsTable.id, tagId))
      .limit(1);

    if (!tag.length) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    // Add tag to document
    const documentTag = await db
      .insert(DocumentTagsTable)
      .values({
        documentId,
        tagId,
        addedBy,
      })
      .returning();

    return NextResponse.json(documentTag[0], { status: 201 });
  } catch (error) {
    console.error("Error adding tag to document:", error);
    return NextResponse.json(
      { error: "Failed to add tag to document" },
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

    const { searchParams } = req.nextUrl;
    const documentId = searchParams.get("id");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Get all tags for this document
    const documentTags = await db
      .select({
        id: DocumentTagsTable.id,
        documentId: DocumentTagsTable.documentId,
        tagId: DocumentTagsTable.tagId,
        addedBy: DocumentTagsTable.addedBy,
        createdAt: DocumentTagsTable.createdAt,
        tag: TagsTable,
      })
      .from(DocumentTagsTable)
      .innerJoin(TagsTable, eq(DocumentTagsTable.tagId, TagsTable.id))
      .where(eq(DocumentTagsTable.documentId, documentId));

    return NextResponse.json(documentTags);
  } catch (error) {
    console.error("Error fetching document tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch document tags" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Verify user is authenticated
    // const session = await auth();
    // if (!session || !session.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const { searchParams } = req.nextUrl;
    const documentId = searchParams.get("id");
    const tagId = searchParams.get("tagId");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    if (!tagId) {
      return NextResponse.json(
        { error: "Missing required field: tagId" },
        { status: 400 }
      );
    }

    // Remove tag from document
    const deleted = await db
      .delete(DocumentTagsTable)
      .where(
        and(
          eq(DocumentTagsTable.documentId, documentId),
          eq(DocumentTagsTable.tagId, tagId)
        )
      )
      .returning();

    if (!deleted.length) {
      return NextResponse.json(
        { error: "Document tag not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Tag removed from document successfully",
    });
  } catch (error) {
    console.error("Error removing tag from document:", error);
    return NextResponse.json(
      { error: "Failed to remove tag from document" },
      { status: 500 }
    );
  }
}
