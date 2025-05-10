"use client";

import { FormError } from "@/components/form/form-error";
import { FormSuccess } from "@/components/form/form-success";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { initiatePasswordReset } from "@/actions/initiatePasswordReset";
import { ForgotPasswordSchema } from "@/validaton-schema";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Mail } from "lucide-react";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof ForgotPasswordSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      initiatePasswordReset(values)
        .then((data) => {
          if (data?.error) {
            form.reset();
            setError(data.error);
          }
          if (data?.success) {
            form.reset();
            setSuccess(data?.success);
          }
        })
        .catch(() => {
          setError("Something went wrong!");
        });
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-gray">
      <Card className="w-full max-w-md overflow-hidden border-0 shadow-xl">
        <div className="h-2 bg-gradient-to-r from-dark-blue to-custom-purple"></div>
        
        {/* Logo Section */}
        <CardHeader className="pt-8 pb-2 flex flex-col items-center space-y-2">
          {/* <Link href="/">
            <div className="rounded-full bg-white p-4 shadow-md hover:shadow-xl transition-all duration-300">
              <Image
                alt="logo"
                src="/next.svg"
                height={80}
                width={80}
              />
            </div>
          </Link>
          <h1 className="text-custom-purple font-bold text-xl mt-2">The - Library</h1> */}
        </CardHeader>

        {/* Header */}
        <div className="text-center px-8">
          <h1 className="text-2xl font-bold text-dark-blue">Forgot Password</h1>
          <p className="mt-2 text-sm text-custom-slate">
            Enter your email address to reset your password
          </p>
        </div>

        {/* Form */}
        <CardContent className="pt-6 px-8 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <div className="text-sm font-medium text-custom-slate">Email</div>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-slate h-5 w-5 group-hover:text-dark-blue transition-colors duration-200" />
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="john.snow@gmail.com"
                          className="h-12 pl-10 rounded-lg border-custom-slate/30 focus:border-dark-blue focus:ring-1 focus:ring-dark-blue transition-all duration-200"
                          type="email"
                          disabled={isPending}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-xs mt-1" />
                  </FormItem>
                )}
              />

              {error && <FormError message={error} />}
              {success && <FormSuccess message={success} />}

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-12 bg-gradient-to-r from-dark-blue to-custom-purple hover:from-custom-purple hover:to-dark-blue text-white rounded-lg font-medium transition-all duration-500 transform hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <div className="text-center mt-4">
                <Link 
                  href="/auth/login" 
                  className="text-sm font-medium text-custom-slate hover:text-dark-blue transition-colors"
                >
                  Remember your password? {" "}
                  <span className="text-custom-purple hover:text-dark-blue font-medium underline-offset-4 hover:underline transition-all duration-200">
                    Login Instead
                  </span>
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}