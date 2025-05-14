import { NextRequest, NextResponse } from "next/server";
import { UsersTable, StudentsTable, FoldersTable } from "@/db/schema";
import { eq, like, and, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { hash } from "bcryptjs";
import { sendEmail, testEmailConfig } from "@/lib/mail";

// Zod schema for user creation
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().nullable(),
  role: z.enum(["ADMIN", "USER"]),
  organizationId: z.string().uuid("Invalid organization ID"),
  password: z.string().optional(),
  sendEmail: z.boolean().default(true),
  // Additional profile fields
  // fatherName: z.string().optional(),
  // dateOfBirth: z.string().optional(), // Will be converted to Date
  // rollNumber: z.string().optional(),
  // nationalId: z.string().optional(),
  // passportNumber: z.string().optional(),
  // sessionYear: z.string().optional(),
  // address: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const organizationId = searchParams.get("organizationId");
    const testEmail = searchParams.get("testEmail") === "true";
    
    // Special route to test email configuration
    if (testEmail) {
      const result = await testEmailConfig();
      return NextResponse.json(result);
    }
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build query conditions
    let conditions = [];
    
    // Add search condition if search parameter is provided
    if (search) {
      conditions.push(
        or(
          like(UsersTable.name, `%${search}%`),
          like(UsersTable.email, `%${search}%`),
          like(UsersTable.phone || "", `%${search}%`) // Use empty string as fallback for nullable field
        )
      );
    }
    
    // Add organization filter if provided
    if (organizationId) {
      conditions.push(eq(UsersTable.organizationId, organizationId));
    }
    
    // Combine conditions with AND if there are any
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Get total count for pagination
    const totalCountResult = await db
      .select()
      .from(UsersTable)
      .where(whereClause)
      .execute();
    
    const total = totalCountResult.length;
    const totalPages = Math.ceil(total / limit);
    
    // Get users with pagination
    const users = await db
  .select()
  .from(UsersTable)
  // .innerJoin(StudentsTable, eq(StudentsTable.user, UsersTable.id))
  .where(whereClause)
  .orderBy(UsersTable.createdAt)
  .limit(limit)
  .offset(offset)
  .execute();

    
    // Don't return password field
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    return NextResponse.json({
      users: safeUsers,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = createUserSchema.parse(body);
    
    // Check if user with email already exists
    const existingUser = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.email, validatedData.email))
      .execute();
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }
    
    // Generate random password if not provided
    const password = validatedData.password || generateRandomPassword();
    
    // Hash password
    const hashedPassword = await hash(password, 10);
    
    // Start a transaction for creating user, profile, and folders
    let result;
    try {
      result = await db.transaction(async (tx) => {
        // 1. Create user
        const newUser = await tx
          .insert(UsersTable)
          .values({
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone || null,
            password: hashedPassword,
            role: validatedData.role,
            organizationId: validatedData.organizationId,
          })
          .returning()
          .execute();
        
        const user = newUser[0];
        
        // 2. Create student profile (user profile)
        // Generate a roll number if not provided
        // const rollNumber = validatedData.rollNumber || 
        //                   generateRollNumber(validatedData.name);
        
        const studentProfile = await tx
          .insert(StudentsTable)
          .values({
            fullName: validatedData.name,
            // fatherName: validatedData.fatherName || null,
            // rollNumber: rollNumber,
            // dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
            // nationalId: validatedData.nationalId || null,
            // passportNumber: validatedData.passportNumber || null,
            // sessionYear: validatedData.sessionYear || new Date().getFullYear().toString(),
            email: validatedData.email,
            user:user.id,
            phone: validatedData.phone || null,
            // address: validatedData.address || null,
            organizationId: validatedData.organizationId,
            createdBy: user.id,
          })
          .returning()
          .execute();
        
        const profile = studentProfile[0];
        
        // 3. Create root folder for the student
        // const rootFolder = await tx
        //   .insert(FoldersTable)
        //   .values({
        //     name: `${validatedData.name}'s Files`,
        //     description: `Main folder for ${validatedData.name}`,
        //     studentId: profile.id,
        //     organizationId: validatedData.organizationId,
        //     createdBy: user.id,
        //   })
        //   .returning()
        //   .execute();
        
        // Return the data
        return {
          user,
          profile,
          // folder: rootFolder[0],
        };
      });
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
    
    // Remove password from returned user
    const { password: _, ...safeUser } = result.user;
    
    // Send welcome email with credentials if requested
    let emailResult = null;
    let emailError = null;
    
    if (validatedData.sendEmail) {
      try {
        console.log("Sending welcome email to:", validatedData.name, validatedData.email);
        // Get organization name (you may need to fetch this from the database)
        const organization = "Gennext IT"; // This should be fetched from DB in production
        emailResult = await sendWelcomeEmail(validatedData.name, validatedData.email, password, organization);
      } catch (error) {
        console.error("Failed to send welcome email:", error);
      
      }
    }
    
    return NextResponse.json({
      message: "User created successfully with profile and folder",
      user: safeUser,
      profile: result.profile,
      // folder: result.folder,
      email: {
        sent: emailResult !== null,
        error: emailError
      }
    });
  } catch (error) {
    console.error("Error creating user:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}

// Helper function to generate random password
function generateRandomPassword() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  const length = 12;
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    password += characters.charAt(randomIndex);
  }
  
  return password;
}

// Helper function to generate a roll number based on name and current timestamp
function generateRollNumber(name: string): string {
  // Extract initials from name
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
    
  // Get current timestamp in milliseconds and take last 6 digits
  const timestamp = Date.now().toString().slice(-6);
  
  return `${initials}${timestamp}`;
}

// Helper function to send welcome email with credentials
async function sendWelcomeEmail(name: string, email: string, password: string, organization: string) {
  const subject = "Welcome to our platform - Your login credentials";
  const senderHeader = `${organization}`;
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Welcome to our platform, ${name}!</h2>
      <p>Your account has been created successfully. Here are your login credentials:</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      
      <p>Please log in using these credentials and change your password as soon as possible.</p>
      
      <p>We've also created a personal profile and file storage folder for you in the system.</p>
      
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br>${organization}</p>
    </div>
  `;
  
  return await sendEmail(
    senderHeader,
    email,
    subject,
    htmlContent
  );
}