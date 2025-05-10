"use server";

import { sendEmail } from "@/lib/mailer";
import { generateEmailVerificationToken } from "@/lib/token";
import { RegisterUserSchema } from "@/validaton-schema";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createUser, findUserByEmail } from "./user";

export async function registerUser(values: z.infer<typeof RegisterUserSchema>) {
  const validation = RegisterUserSchema.safeParse(values);
  if (!validation.success) {
    return { error: "Invalid fields!" } as const;
  }

  const { email, name, password, phone, role } = validation.data;

  const existingUser = await findUserByEmail(email!);
  if (existingUser) {
    return { error: "User with this email already exists!" } as const;
  }

  const hashedPassword = await bcrypt.hash(password!, 10);
  await createUser({
    name,
    email,
    password: hashedPassword,
    phone,
    role: role || "USER",
  });

  const verificationToken = await generateEmailVerificationToken(email);
  if (verificationToken) {
    const emailVerificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_EMAIL_VERIFICATION_ENDPOINT}`;
    const url = `${emailVerificationUrl}?token=${verificationToken.token}`;

    await sendEmail(
      "Nextjs Auth",
      verificationToken.email,
      "Activate your account",
      `<p>Click <a href="${url}">here</a> to activate your account.</p>`
    );

    return {
      success: "User created successfully and confirmation email sent!",
    } as const;
  } else {
    return { error: "Some error occurred!" } as const;
  }
}
