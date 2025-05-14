/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/db";
import { FoldersTable } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

// GET a specific folder by ID
export async function GET(
) {
  try {
    const folder = await db
      .select()
      .from(FoldersTable)
      .limit(1);

    if (!folder || folder.length === 0) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(folder[0]);
  } catch (error) {
    console.error("Error fetching folder:", error);
    return NextResponse.json(
      { error: "Failed to fetch folder" },
      { status: 500 }
    );
  }
}



// import { db } from "@/db";
// import { FoldersTable } from "@/db/schema";
// import { eq } from "drizzle-orm";
// import { NextRequest, NextResponse } from "next/server";

// // GET a specific folder by ID
// export async function GET(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const folderId = params.id;

//     if (!folderId) {
//       return NextResponse.json(
//         { error: "Missing required parameter: id" },
//         { status: 400 }
//       );
//     }

//     const folder = await db
//       .select()
//       .from(FoldersTable)
//       .where(eq(FoldersTable.id, folderId))
//       .limit(1);

//     if (!folder || folder.length === 0) {
//       return NextResponse.json(
//         { error: "Folder not found" },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(folder[0]);
//   } catch (error) {
//     console.error("Error fetching folder:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch folder" },
//       { status: 500 }
//     );
//   }
// }