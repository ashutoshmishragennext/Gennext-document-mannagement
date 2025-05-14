import { db } from "@/db";
import {
  DocumentSearchKeywordsTable,
  DocumentsTable,
  SearchHistoryTable,
  StudentsTable
} from "@/db/schema";
import { and, arrayContains, eq, ilike, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Get the search keyword from the query params
    const searchParams = req.nextUrl.searchParams;
    const keyword = searchParams.get("keyword");
    
    if (!keyword || keyword.trim() === "") {
      return NextResponse.json(
        { error: "Search keyword is required" },
        { status: 400 }
      );
    }
    
    // Get the authenticated user
    // const session = await auth();
    // if (!session?.user?.id) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }
    
    // Using a standard UUID format - this needs to be a valid UUID in your database
    // Format: 8-4-4-4-12 hexadecimal digits
    const organizationId = "0cb46f34-0d7d-48f8-8195-e664dbe6dd80";
    const userId = "de2575c0-4c7d-4171-b420-a67a7e72e48f"; // For search history

    // Search for documents with matching keywords
    // Using both array contains and ilike for the extracted text
    const results = await db
      .select({
        documentId: DocumentSearchKeywordsTable.documentId,
        studentId: DocumentSearchKeywordsTable.studentId,
        extractedText: DocumentSearchKeywordsTable.extractedText,
        keywords: DocumentSearchKeywordsTable.keywords,
        documentUrl: DocumentsTable.uploadThingUrl,
        originalFilename: DocumentsTable.filename,
        documentType: DocumentsTable.documentTypeId,
        verificationStatus: DocumentsTable.verificationStatus,
        fullName: StudentsTable.fullName,
        // dateOfBirth: StudentsTable.dateOfBirth,
        // nationalId: StudentsTable.nationalId,
      })
      .from(DocumentSearchKeywordsTable)
      .leftJoin(
        DocumentsTable,
        eq(DocumentSearchKeywordsTable.documentId, DocumentsTable.id)
      )
      .leftJoin(
        StudentsTable,
        eq(DocumentSearchKeywordsTable.studentId, StudentsTable.id)
      )
      .where(
        and(
          eq(DocumentsTable.organizationId, organizationId),
          or(
            arrayContains(DocumentSearchKeywordsTable.keywords, [keyword]),
            ilike(DocumentSearchKeywordsTable.extractedText, `%${keyword}%`)
          )
        )
      );

    // Log the search
    if (results.length > 0) {
      // Get unique student IDs from results
      const studentIds = [...new Set(results.map(r => r.studentId))];
      
      // Log search history
      await db.insert(SearchHistoryTable).values({
        searchTerm: keyword,
        searchParams: { type: "keyword", studentIds },
        searchedBy: userId,
        organizationId: organizationId,
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        error: "Failed to perform search",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}