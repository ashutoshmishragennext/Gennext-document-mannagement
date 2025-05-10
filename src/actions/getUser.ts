"use server";

import { findUserById } from "./user";

export async function getUser(userId: string) {
  const existingUser = await findUserById(userId!);

  console.log("existingUser", existingUser);

  return existingUser;
}
