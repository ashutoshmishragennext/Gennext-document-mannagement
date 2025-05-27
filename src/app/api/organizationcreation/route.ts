/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/db";
import { OrganizationsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Helper function to generate organization code from name
function generateOrgCode(name:any) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 20); // Limit to 20 characters
}

export async function POST(request:any) {
  try {
    const body = await request.json();
    const { name, description } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Generate the organization code
    const baseCode = generateOrgCode(name.trim());
    let code = baseCode;
    let counter = 1;

    // Check if code already exists and make it unique
    while (true) {
      const existingOrg = await db
        .select()
        .from(OrganizationsTable)
        .where(eq(OrganizationsTable.code, code))
        .limit(1);

      if (existingOrg.length === 0) {
        break; // Code is unique
      }

      code = `${baseCode}_${counter}`;
      counter++;
    }

    // Create the organization
    const newOrganization = await db
      .insert(OrganizationsTable)
      .values({
        name: name.trim(),
        code: code,
        description: description?.trim() || null,
      })
      .returning();

    return NextResponse.json(newOrganization[0], { status: 201 });

  } catch (error:any) {
    console.error("Error creating organization:", error);
    
    // Handle database constraint errors
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      return NextResponse.json(
        { error: "An organization with this code already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}