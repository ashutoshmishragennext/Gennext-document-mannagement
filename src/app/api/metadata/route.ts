// app/api/user-metadata/route.ts
import { db } from "@/db";
import { DocumentTypeMetadataTable, DocumentsTable } from "@/db/schema"; // Updated imports
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    const metadata = await db
      .select()
      .from(DocumentTypeMetadataTable) // Updated to reflect new table name
      .where(eq(DocumentTypeMetadataTable.documentTypeId, documentId)); // Ensure we reference the right column

    return NextResponse.json({ metadata }, { status: 200 });
  } catch (error) {
    console.error("Error fetching document metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch document metadata" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { documentId, metadata ,createdBy } = await request.json();

    if (!documentId || !metadata) {
      return NextResponse.json(
        { error: "Document ID and metadata are required" },
        { status: 400 }
      );
    }

    // Verify document exists
    const document = await db
      .select()
      .from(DocumentsTable) // Updated to reflect new table name
      .where(eq(DocumentsTable.id, documentId)); // Ensure we're querying the correct field

    if (document.length === 0) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    const newMetadata = await db
      .insert(DocumentTypeMetadataTable) // Updated to reflect new table name
      .values({
        documentTypeId: documentId,
        schema: metadata, // Assuming `metadata` is the schema
        isActive:true,
        createdBy:createdBy,
      })
      .returning();

    return NextResponse.json(
      { metadata: newMetadata[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating document metadata:", error);
    return NextResponse.json(
      { error: "Failed to create document metadata" },
      { status: 500 }
    );
  }
}
