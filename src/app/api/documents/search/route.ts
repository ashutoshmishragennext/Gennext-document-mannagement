/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from "@/db";
import {
  DocumentSearchKeywordsTable,
  DocumentsTable,
  DocumentTypesTable,
  StudentsTable
} from "@/db/schema";
import { and, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
// import { validateRequest } from "@/lib/auth";

// Advanced search endpoint with metadata searching capabilities
export async function GET(request: NextRequest) {
  try {
    // Validate user session
    // const { user } = await validateRequest();
    // if (!user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId");
    const metadataSearch = searchParams.get("metadata");
    const documentTypeId = searchParams.get("documentTypeId");
    const keyword = searchParams.get("keyword");
    const studentId = searchParams.get("studentId");
    const folderId = searchParams.get("folderId");
    const verificationStatus = searchParams.get("verificationStatus");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Validate organization ID
    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Build query conditions
    const whereConditions = [eq(DocumentsTable.organizationId, organizationId)];

    // Add document type filter if provided
    if (documentTypeId) {
      whereConditions.push(eq(DocumentsTable.documentTypeId, documentTypeId));
    }

    // Add student filter if provided
    if (studentId) {
      whereConditions.push(eq(DocumentsTable.studentId, studentId));
    }

    // Add folder filter if provided
    if (folderId) {
      whereConditions.push(eq(DocumentsTable.folderId, folderId));
    }

    // Add verification status filter if provided
    if (verificationStatus) {
      whereConditions.push(eq(DocumentsTable.verificationStatus, verificationStatus as "PENDING" | "APPROVED" | "REJECTED"));
    }

    // Add metadata search if provided
  // Add metadata search if provided
if (metadataSearch) {
  try {
    // Parse the metadata search JSON
    const metadataObj = JSON.parse(metadataSearch);
    
    // For each key-value pair, add a condition to search in the JSONB metadata
    Object.entries(metadataObj).forEach(([key, value]) => {
      whereConditions.push(
        eq((DocumentsTable.metadata as Record<string, any>)[key].toString(), String(value))
      );
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Invalid metadata search format. Must be valid JSON." },
      { status: 400 }
    );
  }
}


    // Handle keyword search
  
// Handle keyword search
if (keyword) {
  // First find document IDs that match the keyword
  const keywordDocs = await db
    .select({ documentId: DocumentSearchKeywordsTable.documentId })
    .from(DocumentSearchKeywordsTable)
    .where(
      or(
        ilike(DocumentSearchKeywordsTable.extractedText, `%${keyword}%`),
        sql`${keyword} = ANY(${DocumentSearchKeywordsTable.keywords})` // Fixed approach
      )
    );

  if (keywordDocs.length > 0) {
    const documentIds = keywordDocs.map(doc => doc.documentId);
    whereConditions.push(inArray(DocumentsTable.id, documentIds));
  } else {
    // No documents match the keyword search
    return NextResponse.json({
      documents: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }
    });
  }
}




    // Prepare the query with joins
    const documents = await db
      .select({
        documentId: DocumentsTable.id,
        documentUrl: DocumentsTable.uploadThingUrl,
        filename: DocumentsTable.filename,
        fileSize: DocumentsTable.fileSize,
        mimeType: DocumentsTable.mimeType,
        metadata: DocumentsTable.metadata,
        verificationStatus: DocumentsTable.verificationStatus,
        verifiedBy: DocumentsTable.verifiedBy,
        verifiedAt: DocumentsTable.verifiedAt,
        rejectionReason: DocumentsTable.rejectionReason,
        createdAt: DocumentsTable.createdAt,
        updatedAt: DocumentsTable.updatedAt,
        student: {
          id: StudentsTable.id,
          fullName: StudentsTable.fullName,
          fatherName: StudentsTable.fatherName,
          rollNumber: StudentsTable.rollNumber,
          nationalId: StudentsTable.nationalId,
          passportNumber: StudentsTable.passportNumber,
          email: StudentsTable.email,
          phone: StudentsTable.phone,
        },
        documentType: {
          id: DocumentTypesTable.id,
          name: DocumentTypesTable.name,
        }
      })
      .from(DocumentsTable)
      .innerJoin(
        StudentsTable,
        eq(DocumentsTable.studentId, StudentsTable.id)
      )
      .innerJoin(
        DocumentTypesTable,
        eq(DocumentsTable.documentTypeId, DocumentTypesTable.id)
      )
      .where(and(...whereConditions))
      .orderBy(desc(DocumentsTable.createdAt))
      .limit(limit)
      .offset(offset);

    // Count total matching documents for pagination
    const countResult = await db
    .select({ count: count(DocumentsTable.id) })
    .from(DocumentsTable)
    .innerJoin(
      StudentsTable,
      eq(DocumentsTable.studentId, StudentsTable.id)
    )
    .where(and(...whereConditions));

    const totalCount = Number(countResult[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    // Log search history
    // Uncomment this after implementing user authentication
    /* 
    if (user) {
      await db.insert(SearchHistoryTable).values({
        searchTerm: keyword || "",
        searchParams: {
          metadata: metadataSearch ? JSON.parse(metadataSearch) : {},
          documentTypeId,
          studentId,
          folderId,
          verificationStatus
        },
        searchedBy: user.id,
        organizationId
      });
    }
    */

    return NextResponse.json({
      documents,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    });
  } catch (error) {
    console.error("Error searching documents:", error);
    return NextResponse.json(
      { error: "Failed to search documents" },
      { status: 500 }
    );
  }
}