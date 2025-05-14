/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { DocumentsTable } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");
    const folderId = url.searchParams.get("folderId");
    const documentTypeId = url.searchParams.get("documentTypeId");
    const verificationStatus = url.searchParams.get("verificationStatus");
    const organizationId = url.searchParams.get("organizationId");

    const conditions = [];

    if (organizationId) {
      conditions.push(eq(DocumentsTable.organizationId, organizationId));
    }

    if (studentId) {
      conditions.push(eq(DocumentsTable.studentId, studentId));
    }

    if (folderId) {
      conditions.push(eq(DocumentsTable.folderId, folderId));
    }

    if (documentTypeId) {
      conditions.push(eq(DocumentsTable.documentTypeId, documentTypeId));
    }

    if (verificationStatus) {
      const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
      const status = verificationStatus.toUpperCase();
      if (validStatuses.includes(status)) {
        conditions.push(eq(DocumentsTable.verificationStatus, status as any));
      } else {
        return NextResponse.json(
          { error: "Invalid verification status. Must be one of: PENDING, APPROVED, REJECTED" },
          { status: 400 }
        );
      }
    }

    const result = await db
      .select({ count: count() })
      .from(DocumentsTable)
      .where(conditions.length ? and(...conditions) : undefined);

    return NextResponse.json({ count: result[0].count });
  } catch (error) {
    console.error("Error counting documents:", error);
    return NextResponse.json(
      { error: "Failed to count documents" },
      { status: 500 }
    );
  }
}
