// app/api/folders/route.ts
import { db } from "@/db";
import { FoldersTable, NewFolder, StudentsTable } from "@/db/schema";
import { uploadthingClient } from "@/utils/uploadthingClient";
import { and, desc, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, parentFolderId, studentId, organizationId, createdBy } = body;

    // Validate required fields
    if (!name || !studentId || !organizationId) {
      return NextResponse.json(
        { error: "Missing required fields: name, studentId, organizationId" },
        { status: 400 }
      );
    }

    // Step 1: Create Folder in UploadThing
    // const uploadThingFolder = await uploadthingClient.createFolder({
    //   name,
    //   parentFolderId, // If parentFolderId exists, pass it here to support nested folders
    // });

    // if (!uploadThingFolder || !uploadThingFolder.folderId) {
    //   return NextResponse.json(
    //     { error: "Failed to create folder in UploadThing" },
    //     { status: 500 }
    //   );
    // }

    // Step 2: Create a new folder record in Drizzle ORM with the UploadThing folder ID
    const newFolder: NewFolder = {
      name,
      description,
      parentFolderId: parentFolderId || null,
      studentId,
      organizationId,
      createdBy,
      // uploadThingFolderId: uploadThingFolder.folderId, // Store UploadThing folder ID
    };

    const insertedFolders = await db.insert(FoldersTable).values(newFolder).returning();

    // Check if insertedFolders exists and is an array with at least one element
    if (!insertedFolders || !Array.isArray(insertedFolders) || insertedFolders.length === 0) {
      return NextResponse.json(
        { error: "Failed to insert folder record" },
        { status: 500 }
      );
    }
    
    // Return the folder response
    return NextResponse.json(insertedFolders[0], { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json(
      { error: "Failed to create folder" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const studentId = searchParams.get("studentId");
    const parentFolderId = searchParams.get("parentFolderId");
    const organizationId = searchParams.get("organizationId");
    
    // Build the query based on provided params
    let query;
    
    if (studentId) {
      if (parentFolderId === 'null' || parentFolderId === '') {
        // Get root folders for the student
        query = db.select()
          .from(FoldersTable)
          .where(
            and(
              eq(FoldersTable.studentId, studentId),
              isNull(FoldersTable.parentFolderId)
            )
          )
          .orderBy(desc(FoldersTable.createdAt));
      } else if (parentFolderId) {
        // Get subfolders under the specified parent folder
        query = db.select()
          .from(FoldersTable)
          .where(
            and(
              eq(FoldersTable.studentId, studentId),
              eq(FoldersTable.parentFolderId, parentFolderId)
            )
          )
          .orderBy(desc(FoldersTable.createdAt));
      } else {
        // Get all folders for the student
        query = db.select()
          .from(FoldersTable)
          .where(eq(FoldersTable.studentId, studentId))
          .orderBy(desc(FoldersTable.createdAt));
      }
    } else {
      // If no studentId, return folders with student information
      query = db
        .select({
          folder: FoldersTable,
          student: StudentsTable,
        })
        .from(FoldersTable)
        .leftJoin(
          StudentsTable,
          eq(FoldersTable.studentId, StudentsTable.id)
        );
      
      if (parentFolderId === 'null' || parentFolderId === '') {
        // Only root folders
        query = query.where(isNull(FoldersTable.parentFolderId));
      } else if (parentFolderId) {
        // Only subfolders of specified parent
        query = query.where(eq(FoldersTable.parentFolderId, parentFolderId));
      }

      if (organizationId) {
        query = query.where(eq(FoldersTable.organizationId, organizationId));
      }
      
      query = query.orderBy(desc(FoldersTable.createdAt));
    }

    const result = await query;
    
    // Format the result if it contains joined student data
    if (!studentId) {
      const formattedResult = result.map(({ folder, student }) => ({
        id: folder.id,
        name: folder.name,
        description: folder.description,
        parentFolderId: folder.parentFolderId,
        studentId: folder.studentId,
        organizationId: folder.organizationId,
        createdAt: folder.createdAt,
        updatedAt: folder.updatedAt,
        uploadThingFolderId: folder.uploadThingFolderId,
        student: student ? {
          id: student.id,
          fullName: student.fullName,
        } : null
      }));
      return NextResponse.json(formattedResult);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const folderId = url.searchParams.get("id");

    if (!folderId) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    // 1. Get the folder to find its UploadThing ID
    const folderResult = await db
      .select()
      .from(FoldersTable)
      .where(eq(FoldersTable.id, folderId));

    if (!folderResult || folderResult.length === 0) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }

    const folder = folderResult[0];

    // 2. Delete from UploadThing if we have an uploadThingFolderId
    if (folder.uploadThingFolderId) {
      try {
        await uploadthingClient.deleteFolder(folder.uploadThingFolderId);
      } catch (error) {
        console.error("Error deleting folder from UploadThing:", error);
        // Continue with database deletion even if UploadThing deletion fails
      }
    }

    // 3. Delete from database
    await db
      .delete(FoldersTable)
      .where(eq(FoldersTable.id, folderId));

    return NextResponse.json(
      { success: true, message: "Folder deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting folder:", error);
    return NextResponse.json(
      { error: "Failed to delete folder" },
      { status: 500 }
    );
  }
}