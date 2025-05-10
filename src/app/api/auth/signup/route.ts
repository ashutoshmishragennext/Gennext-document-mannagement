
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest } from "next/server";
import { UserRole } from "@/db/schema";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { findUserByEmail, createUser } from "@/actions/user";

const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Invalid mobile number"),
  role: z.enum(UserRole.enumValues),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = signupSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await findUserByEmail(validatedData.email);
    if (existingUser) {
      return Response.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    
    // Create new user
    const user = await createUser({
      ...validatedData,
      password: hashedPassword,
    });
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return Response.json(
      { message: "User created successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    
    console.error("Signup error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


