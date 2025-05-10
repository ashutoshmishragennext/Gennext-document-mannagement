"use server";


import { sendEmail } from "@/lib/mailer";
import { generatePasswordResetToken } from "@/lib/token";
import { z } from "zod";
import { findUserByEmail } from "./user";
import { ForgotPasswordSchema } from "@/validaton-schema";

export async function initiatePasswordReset(
  values: z.infer<typeof ForgotPasswordSchema>
) {
  const validation = ForgotPasswordSchema.safeParse(values);
  if (!validation.success) {
    return { error: "Invalid email!" } as const;
  }

  const { email } = validation.data;

  const existingUser = await findUserByEmail(email);
  if (!existingUser) {
    return { error: "Email not found!" } as const;
  }

  const passwordResetToken = await generatePasswordResetToken(email);
  if (passwordResetToken) {
    const resetPasswordUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.NEXT_PUBLIC_RESET_PASSWORD_ENDPOINT}`;
    const url = `${resetPasswordUrl}?token=${passwordResetToken.token}`;

    await sendEmail(
      "Nextjs Auth",
      passwordResetToken.email,
      "Reset your password",
      `<p>Click <a href="${url}">here</a> to reset your password.</p>`
    );



    return { success: "Reset email sent!" } as const;
  }

  return { error: "Email not sent!" } as const;
}
