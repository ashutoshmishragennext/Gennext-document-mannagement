/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/folders/route.ts
// app/api/folders/route.ts
// app/api/folders/route.ts
// app/api/folders/route.ts
// app/api/folders/route.ts
// app/api/folders/route.ts
import { db } from "@/db";
import { FoldersTable, NewFolder, StudentsTable, DocumentsTable } from "@/db/schema";
import { uploadthingClient } from "@/utils/uploadthingClient";
import { and, desc, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const studentId = searchParams.get("studentId");
    const ID = searchParams.get("id");
    const parentFolderId = searchParams.get("parentFolderId");
    const organizationId = searchParams.get("organizationId");
    const includeFiles = searchParams.get("includeFiles") !== 'false'; // Default to true
    
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
              // isNull(FoldersTable.parentFolderId)
            )
          )
          .orderBy(desc(FoldersTable.createdAt));
      } else if (parentFolderId) {
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
      const conditions = [];
      
      if (parentFolderId === 'null' || parentFolderId === '') {
        // Only root folders
        conditions.push(isNull(FoldersTable.parentFolderId));
      } else if (parentFolderId) {
        // Only subfolders of specified parent
        conditions.push(eq(FoldersTable.parentFolderId, parentFolderId));
      }
      
      if (organizationId) {
        conditions.push(eq(FoldersTable.organizationId, organizationId));
      }
      
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
        
      // Apply conditions if any exist
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      query = query.orderBy(desc(FoldersTable.createdAt));
    }

    const result = await query;
    
    // If includeFiles is true, fetch files for the appropriate folders
    let foldersWithFiles = result;
    
    if (includeFiles && result.length > 0) {
      const folderFilesMap = new Map();
      
      // Only fetch files if we have a valid parentFolderId (not null, empty, or 'null')
      if (parentFolderId && parentFolderId !== 'null' && parentFolderId !== '') {
        // Fetch files for the specific parent folder
        console.log('Fetching files for parent folder:', parentFolderId);
        
        const fileConditions = [eq(DocumentsTable.folderId, parentFolderId)];
        if (organizationId) {
          fileConditions.push(eq(DocumentsTable.organizationId, organizationId));
        }
        
        const folderFiles = await db
          .select()
          .from(DocumentsTable)
          .where(and(...fileConditions));
          
        console.log(`Files found for parent folder ${parentFolderId}:`, folderFiles.length);
        folderFilesMap.set(parentFolderId, folderFiles);
      } else {
        // For root folders, fetch files for each individual folder
        const folderIds = studentId 
          ? (result as any[]).map((folder: any) => folder.id)
          : (result as any[]).map(({ folder }: any) => folder.id);
        
        console.log('Fetching files for individual folders:', folderIds);
        
        for (const folderId of folderIds) {
          const fileConditions = [eq(DocumentsTable.folderId, folderId)];
          if (organizationId) {
            fileConditions.push(eq(DocumentsTable.organizationId, organizationId));
          }
          
          const folderFiles = await db
            .select()
            .from(DocumentsTable)
            .where(and(...fileConditions));
            
          console.log(`Files found for folder ${folderId}:`, folderFiles.length);
          folderFilesMap.set(folderId, folderFiles);
        }
      }
      
      // Add files to each folder
      if (studentId) {
        foldersWithFiles = (result as any[]).map((folder: any) => ({
          ...folder,
          files: parentFolderId && parentFolderId !== 'null' && parentFolderId !== '' 
            ? folderFilesMap.get(parentFolderId) || [] // Files from parent folder
            : folderFilesMap.get(folder.id) || [] // Files from individual folder
        }));
      } else {
        foldersWithFiles = (result as any[]).map(({ folder, student }: any) => ({
          id: folder.id,
          name: folder.name,
          description: folder.description,
          parentFolderId: folder.parentFolderId,
          studentId: folder.studentId,
          organizationId: folder.organizationId,
          createdBy: folder.createdBy,
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt,
          uploadThingFolderId: folder.uploadThingFolderId,
          student: student ? {
            id: student.id,
            fullName: student.fullName,
          } : null,
          files: parentFolderId && parentFolderId !== 'null' && parentFolderId !== '' 
            ? folderFilesMap.get(parentFolderId) || [] // Files from parent folder
            : folderFilesMap.get(folder.id) || [] // Files from individual folder
        }));
      }
    } else {
      // Format the result if it contains joined student data and no files needed
      if (!studentId) {
        const formattedResult = (result as any[]).map(({ folder, student }: any) => ({
          id: folder.id,
          name: folder.name,
          description: folder.description,
          parentFolderId: folder.parentFolderId,
          studentId: folder.studentId,
          organizationId: folder.organizationId,
          createdBy: folder.createdBy,
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt,
          uploadThingFolderId: folder.uploadThingFolderId,
          student: student ? {
            id: student.id,
            fullName: student.fullName,
          } : null,
          files: [] // Empty files array when not including files
        }));
        return NextResponse.json(formattedResult);
      } else {
        // Add empty files array to student-specific queries
        foldersWithFiles = (result as any[]).map((folder: any) => ({
          ...folder,
          files: []
        }));
      }
    }

    return NextResponse.json(foldersWithFiles);
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}



// import { db } from "@/db";
// import { FoldersTable, NewFolder, StudentsTable } from "@/db/schema";
// import { uploadthingClient } from "@/utils/uploadthingClient";
// import { and, desc, eq, isNull } from "drizzle-orm";
// import { NextRequest, NextResponse } from "next/server";



// export async function GET(req: NextRequest) {
//   try {
//     const searchParams = req.nextUrl.searchParams;
//     const studentId = searchParams.get("studentId");
//     const ID =searchParams.get("id");
//     const parentFolderId = searchParams.get("parentFolderId");
//     const organizationId = searchParams.get("organizationId");
    
//     // Build the query based on provided params
//     let query;
    
//     if (studentId) {
//       if (parentFolderId === 'null' || parentFolderId === '') {
//         // Get root folders for the student
//         query = db.select()
//           .from(FoldersTable)
//           .where(
//             and(
//               eq(FoldersTable.studentId, studentId),
//               isNull(FoldersTable.parentFolderId)
//             )
//           )
//           .orderBy(desc(FoldersTable.createdAt));
//       } else if (parentFolderId) {
//         // Get subfolders under the specified parent folder
//         query = db.select()
//           .from(FoldersTable)
//           .where(
//             and(
//               eq(FoldersTable.studentId, studentId),
//               eq(FoldersTable.parentFolderId, parentFolderId)
//             )
//           )
//           .orderBy(desc(FoldersTable.createdAt));
//       } else {
//         // Get all folders for the student
//         query = db.select()
//           .from(FoldersTable)
//           .where(eq(FoldersTable.studentId, studentId))
//           .orderBy(desc(FoldersTable.createdAt));
//       }
//     } else {
//       // If no studentId, return folders with student information
//       query = db
//         .select({
//           folder: FoldersTable,
//           student: StudentsTable,
//         })
//         .from(FoldersTable)
//         .leftJoin(
//           StudentsTable,
//           eq(FoldersTable.studentId, StudentsTable.id)
//         );
      
//       if (parentFolderId === 'null' || parentFolderId === '') {
//         // Only root folders
//         query = query.where(isNull(FoldersTable.parentFolderId));
//       } else if (parentFolderId) {
//         // Only subfolders of specified parent
//         query = query.where(eq(FoldersTable.parentFolderId, parentFolderId));
//       }

//       else if (organizationId) {
//         query = query.where(eq(FoldersTable.organizationId, organizationId));
//       }
      
//       query = query.orderBy(desc(FoldersTable.createdAt));
//     }

//     const result = await query;
    
//     // Format the result if it contains joined student data
//     if (!studentId) {
//       const formattedResult = result.map(({ folder, student }:any) => ({
//         id: folder.id,
//         name: folder.name,
//         description: folder.description,
//         parentFolderId: folder.parentFolderId,
//         studentId: folder.studentId,
//         organizationId: folder.organizationId,
//         createdAt: folder.createdAt,
//         updatedAt: folder.updatedAt,
//         uploadThingFolderId: folder.uploadThingFolderId,
//         student: student ? {
//           id: student.id,
//           fullName: student.fullName,
//         } : null
//       }));
//       return NextResponse.json(formattedResult);
//     }

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error("Error fetching folders:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch folders" },
//       { status: 500 }
//     );
//   }
// }

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