// /app/api/students/bulk-upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { StudentsTable, FoldersTable } from "@/db/schema";
import { parse } from "csv-parse/sync";
import { z } from "zod";

// Define validation schema for each student row
const StudentRowSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  dateOfBirth: z.string().min(1, "Date must be in YYYY-MM-DD format"),
  sessionYear: z.string().min(1, "Session year is required"),
  // Add optional fields with appropriate fallbacks
  fatherName: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  nationalId: z.string().optional(),
  passportNumber: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Use FormData to handle file upload
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    // console.log("file",file);
    
    const organizationId = formData.get("organizationId") as string;
    const userId = formData.get("userId") || "de2575c0-4c7d-4171-b420-a67a7e72e48f"; // Default userId or from auth

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    if (!organizationId) {
      return NextResponse.json(
        { success: false, message: "Organization ID is required" },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();
    
    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (!records.length) {
      return NextResponse.json(
        { success: false, message: "CSV file is empty" },
        { status: 400 }
      );
    }

    // Validate and transform the data
    const results = {
      success: 0,
      failed: 0,
      errors: [] as { row: number; error: string }[],
    };

    const studentsToInsert: { fullName: string; rollNumber: string; dateOfBirth: Date; sessionYear: string; fatherName: string | undefined; email: string | undefined; phone: string | undefined; address: string | undefined; nationalId: string | undefined; passportNumber: string | undefined; organizationId: string; createdBy: string; }[] = [];

    // Process each row
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      try {
        // Validate the row data
        const validatedData = StudentRowSchema.parse(row);
        
        // Check if student with this roll number already exists in this organization
        const existingStudent = await db.query.StudentsTable.findFirst({
          where: (students, { and, eq }) => 
            and(
              // eq(students.rollNumber, validatedData.rollNumber),
              eq(students.organizationId, organizationId)
            )
        });

        if (existingStudent) {
          results.failed++;
          results.errors.push({
            row: i + 1,
            error: `Student with roll number ${validatedData.rollNumber} already exists`
          });
          continue;
        }

        // Format the date correctly
        const dateOfBirth = new Date(validatedData.dateOfBirth);
        
        // Make sure it's a valid date before proceeding
        if (isNaN(dateOfBirth.getTime())) {
          throw new Error(`Invalid date format for dateOfBirth: ${validatedData.dateOfBirth}`);
        }

        // Add to the list of students to insert
        studentsToInsert.push({
          fullName: validatedData.fullName,
          rollNumber: validatedData.rollNumber,
          dateOfBirth: dateOfBirth,
          sessionYear: validatedData.sessionYear,
          fatherName: validatedData.fatherName,
          email: validatedData.email,
          phone: validatedData.phone,
          address: validatedData.address,
          nationalId: validatedData.nationalId,
          passportNumber: validatedData.passportNumber,
          organizationId,
          createdBy: userId as string,
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          error: error instanceof z.ZodError 
            ? error.errors.map(e => `${e.path}: ${e.message}`).join(", ")
            : error instanceof Error ? error.message : "Invalid data format"
        });
      }
    }

    // Insert all valid students in a single transaction and create folders for each student
    if (studentsToInsert.length > 0) {
      try {
        await db.transaction(async (tx) => {
          for (const student of studentsToInsert) {
            // Insert student record
            const newStudentResult = await tx.insert(StudentsTable).values(student).returning();
            const newStudent = newStudentResult[0];
            
            // Create folder name based on student's name, roll number, and session year
            // const folderName = `${newStudent.fullName}_${newStudent.rollNumber}_${newStudent.sessionYear}`;
            
            // Create folder record in the FoldersTable
            await tx.insert(FoldersTable).values({
              name: "folderName",
              description: `Main folder for student ${newStudent.fullName}`,
              studentId: newStudent.id,
              organizationId: newStudent.organizationId,
              createdBy: newStudent.createdBy
            });
          }
        });
      } catch (dbError) {
        console.error("Database insertion error:", dbError);
        return NextResponse.json(
          { 
            success: false, 
            message: dbError instanceof Error ? dbError.message : "Failed to insert students and create folders" 
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${records.length} records. ${results.success} students added with folders, ${results.failed} failed.`,
      results
    });
  } catch (error) {
    console.error("Error processing CSV upload:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Failed to process CSV file" 
      },
      { status: 500 }
    );
  }
}