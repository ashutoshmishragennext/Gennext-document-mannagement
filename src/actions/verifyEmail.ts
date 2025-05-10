"use server";

import { deleteEmailVerificationToken, findEmailVerificationTokenByToken } from "./email-verification-token";
import { findUserByEmail, markUserEmailVerified } from "./user";

export async function verifyEmail(token: string) {
  const existingToken = await findEmailVerificationTokenByToken(token);

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

  await markUserEmailVerified(existingUser.id);
  await deleteEmailVerificationToken(existingToken.id);

  return { success: "Email verified!" } as const;
}

function isTokenExpired(expiryDate: Date): boolean {
  return expiryDate < new Date();
}
