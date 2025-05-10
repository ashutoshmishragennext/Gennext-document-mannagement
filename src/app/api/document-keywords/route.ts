/* eslint-disable @typescript-eslint/no-explicit-any */
// api/document-keywords.ts
import { db } from "@/db";
import {
  DocumentSearchKeywordsTable,
  DocumentsTable,
  NewDocumentSearchKeywords
} from "@/db/schema";
import { and, eq, ilike } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// POST - Create new document search keywords
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = body;

    // Verify document exists
    const document = await db.select()
      .from(DocumentsTable)
      .where(eq(DocumentsTable.id, validatedData.documentId))
      .limit(1);

    if (document.length === 0) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Create new document keywords
    const newKeywords: NewDocumentSearchKeywords = {
      documentId: validatedData.documentId,
      studentId: validatedData.studentId,
      extractedText: validatedData.extractedText,
      keywords: validatedData.keywords || []
    };

    const [createdKeywords] = await db.insert(DocumentSearchKeywordsTable)
      .values(newKeywords)
      .returning();

    return NextResponse.json(createdKeywords, { status: 201 });
  } catch (error: any) {
    console.error("Error creating document keywords:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create document keywords" },
      { status: 500 }
    );
  }
}

// GET - Search documents by keywords
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const documentId = searchParams.get("documentId");
    const studentId = searchParams.get("studentId");
    // const keyword = searchParams.get("keyword");
    const textSearch = searchParams.get("textSearch");
    
    // Run a single query with conditional filtering
    const keywords = await db
      .select({
        id: DocumentSearchKeywordsTable.id,
        documentId: DocumentSearchKeywordsTable.documentId,
        studentId: DocumentSearchKeywordsTable.studentId,
        keywords: DocumentSearchKeywordsTable.keywords,
        extractedText: DocumentSearchKeywordsTable.extractedText,
        createdAt: DocumentSearchKeywordsTable.createdAt,
        updatedAt: DocumentSearchKeywordsTable.updatedAt
      })
      .from(DocumentSearchKeywordsTable)
      .where(
        and(
          // Only include filters that are provided
          documentId ? eq(DocumentSearchKeywordsTable.documentId, documentId) : undefined,
          studentId ? eq(DocumentSearchKeywordsTable.studentId, studentId) : undefined,
          textSearch ? ilike(DocumentSearchKeywordsTable.extractedText, `%${textSearch}%`) : undefined,
          // keyword ? inArray([keyword], DocumentSearchKeywordsTable.keywords) : undefined
        )
      );
    
    return NextResponse.json(keywords, { status: 200 });
  } catch (error: any) {
    console.error("Error searching documents:", error);
    return NextResponse.json(
      { error: "Failed to search documents" },
      { status: 500 }
    );
  }
}