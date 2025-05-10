import { UserRole } from "@/db/schema";
import { z } from "zod";

export type Role = (typeof UserRole.enumValues)[number];

const emailSchema = z
  .string({ required_error: "Email is required!" })
  .min(1, { message: "Email is required!" })
  .email({ message: "Invalid email!" });

const passwordSchema = z
  .string({ required_error: "Password is required!" })
  .min(1, { message: "Password is required!" })
  .min(8, { message: "Password must be at least 8 characters!" });

const nameSchema = z
  .string({ required_error: "Full name is required!" })
  .min(1, { message: "Full name is required!" })
  .min(3, { message: "Full name must be at least 3 characters." })
  .max(50, { message: "Full name must be at most 50 characters." });

export const LoginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const ForgotPasswordSchema = z.object({
  email: emailSchema,
});

export const ResetPasswordSchema = z.object({
  password: passwordSchema,
});

const RoleEnum = z.enum(UserRole.enumValues, {
  invalid_type_error: "Invalid role!",
});

export const RegisterUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  phone: z
    .string({ required_error: "Number is required!" })
    .min(1, { message: "Number is required!" })
    .min(10, { message: "Number must be at least 10 characters." }),
  role: RoleEnum.optional(),
});
