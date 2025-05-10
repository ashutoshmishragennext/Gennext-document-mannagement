/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { registerUser } from "@/actions/registerUser";
import MainButton from "@/components/common/MainButton";
import { PhoneInput } from "@/components/otp-verify/input-phone";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { RegisterUserSchema, Role } from "@/validaton-schema";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";

const FormSchema = RegisterUserSchema;

type RegisterFormProps = {
  text: string;
  role: Role;
};

const RegisterForm = ({ text, role }: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  

  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "USER",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    if (role) {
      data.role = role;
    }

    setError(undefined);
    setSuccess(undefined);

    startTransition(() => {
      registerUser(data)
        .then((data) => {
          if (data?.error) {
            setError(data.error);
          }
          if (data?.success) {
            form.reset();
            setSuccess(data.success);
            toast({
              title: "🎉 Registration success",
              description: data.success,
            });
          }
        })
        .catch((e) =>{          
          setError("Something went wrong!")}
        );
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-gray py-4 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md overflow-hidden border-0 shadow-xl">
        <div className="h-2 bg-gradient-to-r from-dark-blue to-custom-purple"></div>
        <CardHeader className="pb-0">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-dark-blue">Hello!</h2>
            <p className="mt-2 text-sm text-custom-slate">{text}</p>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-left font-medium text-custom-slate">Full Name</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-slate h-5 w-5 group-hover:text-dark-blue transition-colors duration-200" />
                        <Input
                          {...field}
                          className="h-12  w-full rounded-lg border-custom-slate/30 focus:border-dark-blue focus:ring-1 focus:ring-dark-blue transition-all duration-200"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-left font-medium text-custom-slate">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-slate h-5 w-5 group-hover:text-dark-blue transition-colors duration-200" />
                        <Input
                          {...field}
                          className="h-12  w-full rounded-lg border-custom-slate/30 focus:border-dark-blue focus:ring-1 focus:ring-dark-blue transition-all duration-200"
                          placeholder="Enter your email address"
                          type="email"
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-left">
                      We&aposll never share your email with anyone else
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Field */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-left block font-medium text-custom-slate">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        placeholder="Enter your phone number"
                        {...field}
                        defaultCountry="IN"
                        className="h-8 r-10 w-full rounded-lg border-custom-slate/30 focus:border-dark-blue focus:ring-1 focus:ring-dark-blue transition-all duration-200"
                      />
                    </FormControl>
                    {/* <FormDescription className="text-left text-xs text-custom-slate/80">
                      Enter a phone number to receive messages
                    </FormDescription> */}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-left font-medium text-custom-slate">Password</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-slate h-5 w-5 group-hover:text-dark-blue transition-colors duration-200" />
                        <Input
                          {...field}
                          className="h-12  pr-10 w-full rounded-lg border-custom-slate/30 focus:border-dark-blue focus:ring-1 focus:ring-dark-blue transition-all duration-200"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-custom-slate hover:text-dark-blue transition-colors duration-200"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription className="text-left text-xs text-custom-slate/80">
                      Must be at least 8 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormError message={error} />
              <FormSuccess message={success} />

              <MainButton
                text="Create Account"
                classes="h-12 rounded-lg shadow-lg hover:shadow-xl bg-gradient-to-r from-dark-blue to-custom-purple hover:from-custom-purple hover:to-dark-blue transition-all duration-500"
                width="full_width"
                isSubmitable
                isLoading={isPending}
              />

              <div className="text-center mt-5">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-custom-slate hover:text-dark-blue transition-colors duration-200 underline-offset-4 "
                >
                  Already have an account? <span className="text-dark-blue hover:underline">Login Instead</span>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterForm;