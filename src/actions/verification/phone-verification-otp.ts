import { db } from "@/db";
import { PhoneVerificationTable } from "@/db/schema";

import { eq } from "drizzle-orm";

interface PhoneVerificationOTP {
  phone: string;
  otp: string;
  expiresAt: Date;
}

export async function createPhoneVerificationOTP(
  data: PhoneVerificationOTP
) {
  try {
    console.log(
      `Creating phone-verification-token for user with phone: ${data.phone}`
    );
    const [results] = await db
      .insert(PhoneVerificationTable)
      .values({
        phone: data.phone,
        otp: data.otp,
        expiresAt: data.expiresAt,
      })
      .returning();
    return results || null;
  } catch (error) {
    console.log(
      `Error creating phone-verification-token for user with phone: ${data.phone}`
    );
    throw error;
  }
}

export async function deletePhoneVerificationOTP(id: string) {
  try {
    // console.log(`Deleting phone-verification-token with id: ${id}`);
    await db
      .delete(PhoneVerificationTable)
      .where(eq(PhoneVerificationTable.id, id));
  } catch (error) {
    console.error(
      `Error deleting phone-verification-token with id: ${id}`,
      error
    );
    throw error;
  }
}

export async function findPhoneVerificationOTPByToken(otp: string) {
  try {
    // console.log(`Finding phone-verification-token by token: ${token}`);
    return await db.query.PhoneVerificationTable.findFirst({
      where: eq(PhoneVerificationTable.otp, otp),
    });
  } catch (error) {
    console.error(
      `Error finding phone-verification-token by token ${otp}`,
      error
    );
    throw error;
  }
}

export async function findPhoneVerificationOTPByEmail(phone: string) {
  try {
    // console.log(`Finding phone-verification-token by phone: ${phone}`);
    return await db.query.PhoneVerificationTable.findFirst({
      where: eq(PhoneVerificationTable.phone, phone),
    });
  } catch (error) {
    console.error(
      `Error finding phone-verification-token by phone ${phone}`,
      error
    );
    throw error;
  }
}
