"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { findPasswordResetTokenByToken, deletePasswordResetToken } from "./password-reset-token";
import { findUserByEmail } from "./user";
import { UsersTable } from "@/db/schema";
import { db } from "@/db";
import { ResetPasswordSchema } from "@/validaton-schema";

export async function resetPassword(
  values: z.infer<typeof ResetPasswordSchema>,
  token?: string | null
) {
  if (!token) {
    return { error: "Missing token!" } as const;
  }

  const validation = ResetPasswordSchema.safeParse(values);
  if (!validation.success) {
    return { error: "Invalid fields!" } as const;
  }

  const existingToken = await findPasswordResetTokenByToken(token);
  if (!existingToken) {
    return { error: "Token does not exist!" } as const;
  }

  if (isTokenExpired(existingToken.expiresAt)) {
    return { error: "Token has expired!" } as const;
  }

  const existingUser = await findUserByEmail(existingToken.email);
  if (!existingUser) {
    return { error: "Email does not exist!" } as const;
  }

  const { password } = validation.data;
  const hashedPassword = await bcrypt.hash(password, 10);
  await db
    .update(UsersTable)
    .set({
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(UsersTable.id, existingUser.id));

  await deletePasswordResetToken(existingToken.id);

  return { success: "Password updated!" } as const;
}

function isTokenExpired(expiryDate: Date): boolean {
  return expiryDate < new Date();
}
