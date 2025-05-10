import {
  createEmailVerificationToken,
  deleteEmailVerificationToken,
  findEmailVerificationTokenByEmail,
} from "@/actions/email-verification-token";
import {
  createPasswordResetToken,
  deletePasswordResetToken,
  findPasswordResetTokenByEmail,
} from "@/actions/password-reset-token";

import { v4 as uuidv4 } from "uuid";

export async function generateEmailVerificationToken(email: string) {
  const expirationTimeMs = parseInt(
    process.env.EMAIL_VERIFICATION_TOKEN_EXPIRY_TIME_MS!
  );

  try {
    const existingToken = await findEmailVerificationTokenByEmail(email);
    if (existingToken) {
      await deleteEmailVerificationToken(existingToken.id);
    }

    const token = uuidv4();
    const expiresAt = new Date(new Date().getTime() + expirationTimeMs);
    return await createEmailVerificationToken({ email, token, expiresAt });
  } catch (error) {
    console.error(`Error generating token`, error);
    return null;
  }
}

export async function generatePasswordResetToken(email: string) {
  const expirationTimeMs = parseInt(
    process.env.PASSWORD_RESET_TOKEN_EXPIRY_TIME_MS!
  );

  try {
    const existingToken = await findPasswordResetTokenByEmail(email);
    if (existingToken) {
      await deletePasswordResetToken(existingToken.id);
    }

    const token = uuidv4();
    const expiresAt = new Date(new Date().getTime() + expirationTimeMs);
    return await createPasswordResetToken({ email, token, expiresAt });
  } catch (error) {
    console.error(`Error generating token`, error);
    return null;
  }
}
