import { db } from "@/db";
import { FoldersTable, StudentsTable } from "@/db/schema";
import { count, desc, eq, like, or } from "drizzle-orm";
import { PgSelect } from "drizzle-orm/pg-core";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId");
    const createdBy = searchParams.get("createdBy");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Construct base query
    let query = db
      .select()
      .from(StudentsTable)
      .orderBy(desc(StudentsTable.createdAt))
      .limit(limit)
      .offset(offset) as unknown as PgSelect;

    // Add organization filter if provided
    if (organizationId) {
      query = query.where(eq(StudentsTable.organizationId, organizationId));
    }
    if (createdBy) {
      query = query.where(eq(StudentsTable.createdBy, createdBy));
    }

    // Add search filter if search term provided
    if (search) {
      query = query.where(
        or(
          like(StudentsTable.rollNumber, `%${search}%`),
          like(StudentsTable.fullName, `%${search}%`)
          // Add more fields to search as needed
        )
      );
    }

    // Execute query to get paginated students
    const students = await query;

    // Get total count for pagination metadata
    let countQuery = db
      .select({ count: count() })
      .from(StudentsTable) as unknown as PgSelect;
    if (organizationId) {
      countQuery = countQuery.where(
        eq(StudentsTable.organizationId, organizationId)
      );
    }

    if (search) {
      // Make sure to use the same field names here as in the main query
      countQuery = countQuery.where(
        or(
          like(StudentsTable.rollNumber, `%${search}%`),
          like(StudentsTable.fullName, `%${search}%`)
          // Add more fields to search as needed
        )
      );
    }

    const [{ count: totalStudents }] = await countQuery;
    const totalPages = Math.ceil(totalStudents / limit);

    return NextResponse.json(
      {
        students,
        pagination: {
          total: totalStudents,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.fullName ||
      !body.rollNumber ||
      !body.organizationId ||
      !body.createdBy ||
      !body.sessionYear
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert new student record into the database
    const newStudent = await db
      .insert(StudentsTable)
      .values({
        fullName: body.fullName,
        fatherName: body.fatherName,
        rollNumber: body.rollNumber,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        nationalId: body.nationalId,
        passportNumber: body.passportNumber,
        email: body.email,
        phone: body.phone,
        address: body.address,
        sessionYear: body.sessionYear,
        organizationId: body.organizationId,
        createdBy: body.createdBy,
      })
      .returning();

    const student = newStudent[0]; // Get the newly created student record

    // Create folder name based on student's name, roll number, and current year
    const currentYear = body.sessionYear;
    const folderName = `${student.fullName}_${student.rollNumber}_${currentYear}`;

    // Create folder record in the FoldersTable with only the essential fields
    const folderData = {
      name: folderName,
      description: `Main folder for student ${student.fullName}`,
      studentId: student.id,
      organizationId: student.organizationId,
      createdBy: body.createdBy,
    };

    // Insert folder record
    const newFolderResult = await db
      .insert(FoldersTable)
      .values(folderData)
      .returning();

    // Use type assertion or check if the result is an array
    const folder = Array.isArray(newFolderResult) ? newFolderResult[0] : null;

    // Return the student record along with folder information
    return NextResponse.json(
      {
        student,
        folder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating student:", error);
    console.error("Error details:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
