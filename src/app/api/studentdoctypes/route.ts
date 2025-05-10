import { db } from "@/db";
import { DocumentsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get("studentId");
    
    // Check if studentId exists
    if (!studentId) {
      return NextResponse.json(
        { error: "studentId is required" },
        { status: 400 }
      );
    }

    const documentType = await db
      .select({id: DocumentsTable.documentTypeId})
      .from(DocumentsTable)
      .where(eq(DocumentsTable.studentId, studentId));

    return NextResponse.json({ documentType }, { status: 200 });
  } catch (error) {
    console.error("Error fetching document types:", error);
    return NextResponse.json(
      { error: "Failed to fetch document types" },
      { status: 500 }
    );
  }
}