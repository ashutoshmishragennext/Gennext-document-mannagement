import { db } from "@/db";
import { PasswordResetTokenTable } from "@/db/schema";
import { eq } from "drizzle-orm";

interface PasswordResetTokenData {
  email: string;
  token: string;
  expiresAt: Date;
}

export async function createPasswordResetToken(data: PasswordResetTokenData) {
  try {
    // console.log(
    //   `Creating password-reset-token for user with email: ${data.email}`
    // );
    const results = await db
      .insert(PasswordResetTokenTable)
      .values({
        email: data.email,
        token: data.token,
        expiresAt: data.expiresAt,
      })
      .returning();
    return results[0] || null;
  } catch (error) {
    console.error(
      `Error creating password-reset-token for user with email: ${data.email}`,
      error
    );
    throw error;
  }
}

export async function deletePasswordResetToken(id: string) {
  try {
    // console.log(`Deleting password-reset-token with id: ${id}`);
    await db
      .delete(PasswordResetTokenTable)
      .where(eq(PasswordResetTokenTable.id, id));
  } catch (error) {
    console.error(`Error deleting password-reset-token with id: ${id}`, error);
    throw error;
  }
}

export async function findPasswordResetTokenByToken(token: string) {
  try {
    // console.log(`Finding password-reset-token by token: ${token}`);
    return await db.query.PasswordResetTokenTable.findFirst({
      where: eq(PasswordResetTokenTable.token, token),
    });
  } catch (error) {
    console.error(
      `Error finding password-reset-token by token: ${token}`,
      error
    );
    throw error;
  }
}

export async function findPasswordResetTokenByEmail(email: string) {
  try {
    // console.log(`Finding password-reset-token by email: ${email}`);
    return await db.query.PasswordResetTokenTable.findFirst({
      where: eq(PasswordResetTokenTable.email, email),
    });
  } catch (error) {
    console.error(
      `Error finding password-reset-token by email: ${email}`,
      error
    );
    throw error;
  }
}
