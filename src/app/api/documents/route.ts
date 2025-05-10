
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { DocumentsTable, NewDocument, StudentsTable, DocumentTypesTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
// import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Verify user is authenticated
    // const session = await auth();
    // if (!session || !session.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    const body = await req.json();
    const {
      studentId,
      folderId,
      // documentTypeId,
      filename,
      fileSize,
      mimeType,
      // uploadThingFileId,
      uploadThingUrl,
      metadata,
      metadataSchemaId,
      organizationId,
      uploadedBy,
    } = body;

    // Validate required fields
    if (
      !studentId ||
      !folderId ||
      // !documentTypeId ||
      !filename ||
      !fileSize ||
      !mimeType ||
      // !uploadThingFileId ||
      !uploadThingUrl ||
      !organizationId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify student exists
    const student = await db
      .select()
      .from(StudentsTable)
      .where(
        and(
          eq(StudentsTable.id, studentId),
          eq(StudentsTable.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!student.length) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Verify document type exists
    const documentType = await db
      .select()
      .from(DocumentTypesTable)
      .where(
        and(
          // eq(DocumentTypesTable.id, documentTypeId),
          eq(DocumentTypesTable.organizationId, organizationId)
        )
      )
      .limit(1);

    // if (!documentType.length) {
    //   return NextResponse.json(
    //     { error: "" },
    //     { status: 404 }
    //   );
    // }

    // Create new document
    const newDocument: NewDocument = {
      studentId,
      folderId,
      // documentTypeId,
      filename,
      fileSize,
      mimeType,
      // uploadThingFileId,
      uploadThingUrl,
      metadata: metadata || {},
      metadataSchemaId: metadataSchemaId || null,
      organizationId,
      uploadedBy,
    };

    const document = await db
      .insert(DocumentsTable)
      .values(newDocument)
      .returning();

    return NextResponse.json(document[0], { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
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
    const studentId = url.searchParams.get("studentId");
    const folderId = url.searchParams.get("folderId");
    const documentTypeId = url.searchParams.get("documentTypeId");
    const organizationId = url.searchParams.get("organizationId");
    const verificationStatus = url.searchParams.get("verificationStatus");

    // Validate required fields
    if (!organizationId) {
      return NextResponse.json(
        { error: "Missing required field: organizationId" },
        { status: 400 }
      );
    }

    // Build conditions array
    const conditions = [eq(DocumentsTable.organizationId, organizationId)];
    
    if (studentId) {
      conditions.push(eq(DocumentsTable.studentId, studentId));
    }
    
    if (folderId) {
      conditions.push(eq(DocumentsTable.folderId, folderId));
    }
    
    if (documentTypeId) {
      conditions.push(eq(DocumentsTable.documentTypeId, documentTypeId));
    }
    
    // Handle the verification status enum type correctly
    if (verificationStatus) {
      // Check if the provided value is a valid enum value
      const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
      if (validStatuses.includes(verificationStatus.toUpperCase())) {
        // Type assertion to tell TypeScript that this is a valid enum value
        conditions.push(eq(DocumentsTable.verificationStatus, verificationStatus.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED"));
      } else {
        return NextResponse.json(
          { error: "Invalid verification status. Must be one of: PENDING, APPROVED, REJECTED" },
          { status: 400 }
        );
      }
    }

    // Apply all conditions at once using and()
    const documents = await db
      .select()
      .from(DocumentsTable)
      .where(and(...conditions));
      
    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// import { auth } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    // Verify user is authenticated
    // const session = await auth();
    // if (!session || !session.user) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // Get the document ID from the URL
    const url = new URL(req.url);
    const documentId = url.searchParams.get("id");

    if (!documentId) {
      return NextResponse.json(
        { error: "Missing document ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      studentId,
      folderId,
      documentTypeId,
      filename,
      fileSize,
      mimeType,
      uploadThingUrl,
      metadata,
      metadataSchemaId,
      organizationId,
      verificationStatus,
      verifiedBy,
      verifiedAt,
      uploadedBy,
    } = body;

    // Validate required fields
    if (!organizationId) {
      return NextResponse.json(
        { error: "Missing required field: organizationId" },
        { status: 400 }
      );
    }

    // Check if document exists
    const existingDoc = await db
      .select()
      .from(DocumentsTable)
      .where(
        and(
          eq(DocumentsTable.id, documentId),
          eq(DocumentsTable.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!existingDoc.length) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Create update object with only the fields that are provided
    const updateData: Record<string, any> = {};

    // Only add fields that are present in the request
    if (studentId !== undefined) {
      // Verify student exists
      const student = await db
        .select()
        .from(StudentsTable)
        .where(
          and(
            eq(StudentsTable.id, studentId),
            eq(StudentsTable.organizationId, organizationId)
          )
        )
        .limit(1);

      if (!student.length) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }
      updateData.studentId = studentId;
    }

    if (documentTypeId !== undefined) {
      // Verify document type exists
      const documentType = await db
        .select()
        .from(DocumentTypesTable)
        .where(
          and(
            eq(DocumentTypesTable.id, documentTypeId),
            eq(DocumentTypesTable.organizationId, organizationId)
          )
        )
        .limit(1);

      if (!documentType.length) {
        return NextResponse.json(
          { error: "" },
          { status: 404 }
        );
      }
      updateData.documentTypeId = documentTypeId;
    }

    // Add other fields if they exist in the request
    if (folderId !== undefined) updateData.folderId = folderId;
    if (filename !== undefined) updateData.filename = filename;
    if (fileSize !== undefined) updateData.fileSize = fileSize;
    if (mimeType !== undefined) updateData.mimeType = mimeType;
    if (uploadThingUrl !== undefined) updateData.uploadThingUrl = uploadThingUrl;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (metadataSchemaId !== undefined) updateData.metadataSchemaId = metadataSchemaId;
    if (uploadedBy !== undefined) updateData.uploadedBy = uploadedBy;

    // Handle verification status updates
    // if (verificationStatus !== undefined) {
    //   // Check if the provided value is a valid enum value
    //   const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
    //   if (validStatuses.includes(verificationStatus.toUpperCase())) {
    //     updateData.verificationStatus = verificationStatus.toUpperCase();
        
    //     // If status is being updated, also update the verification metadata
    //     if (verifiedBy !== undefined) updateData.verifiedBy = verifiedBy;
        
    //     // Set verified timestamp if it's provided or if it's an approval/rejection
    //     if (verifiedAt !== undefined) {
    //       updateData.verifiedAt = verifiedAt;
    //     } else if (["APPROVED", "REJECTED"].includes(verificationStatus.toUpperCase())) {
    //       updateData.verifiedAt = new Date();
    //     }
    //   } else {
    //     return NextResponse.json(
    //       { error: "Invalid verification status. Must be one of: PENDING, APPROVED, REJECTED" },
    //       { status: 400 }
    //     );
    //   }
    // }

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields provided for update" },
        { status: 400 }
      );
    }

    // Update document
    const updatedDocument = await db
      .update(DocumentsTable)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(DocumentsTable.id, documentId),
          eq(DocumentsTable.organizationId, organizationId)
        )
      )
      .returning();

    if (!updatedDocument.length) {
      return NextResponse.json(
        { error: "Failed to update document" },
        { status: 500 }
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