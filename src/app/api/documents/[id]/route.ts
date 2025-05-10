/* eslint-disable @typescript-eslint/no-explicit-any */
// File: app/api/documents/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { DocumentsTable, VerificationHistoryTable } from "@/db/schema";
import { eq } from "drizzle-orm";
// import { auth } from "@/lib/auth";
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    const document = await db
      .select()
      .from(DocumentsTable)
      .where(eq(DocumentsTable.id, id))
      .limit(1);

    if (!document.length) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(document[0]);
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Document ID is required" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const {
      folderId,
      metadata,
      verificationStatus,
      rejectionReason,
      verifiedBy,
    } = body;

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (folderId) updateData.folderId = folderId;
    if (metadata) updateData.metadata = metadata;

    // Handle verification status changes
    if (verificationStatus) {
      updateData.verificationStatus = verificationStatus;
      updateData.verifiedBy = verifiedBy;
      updateData.verifiedAt = new Date();

      if (verificationStatus === "REJECTED" && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }

      // Create verification history entry
      await db.insert(VerificationHistoryTable).values({
        documentId: id,
        status: verificationStatus,
        comment: rejectionReason || null,
        verifiedBy: verifiedBy,
        organizationId: body.organizationId,
      });
    }

    // Update document
    const updatedDocument = await db
      .update(DocumentsTable)
      .set(updateData)
      .where(eq(DocumentsTable.id, id))
      .returning();

    if (!updatedDocument.length) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedDocument[0]);
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  try {
    if (!id) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    const documentId = id;

    // Get document details before deletion
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

    // Delete document
    await db.delete(DocumentsTable).where(eq(DocumentsTable.id, documentId));

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
