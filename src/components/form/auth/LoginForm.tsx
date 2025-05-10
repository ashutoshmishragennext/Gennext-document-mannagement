"use client";

import { loginUser } from "@/actions/loginUser";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoginSchema } from "@/validaton-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [error, setError] = useState<string | undefined>(undefined);
  const [isRedirecting, setIsRedirecting] = useState<boolean | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof LoginSchema>) {
    if (isPending || isRedirecting) return;

    setError(undefined);
    setSuccess(undefined);

    try {
      startTransition(async () => {
        const result = await loginUser(data);
        
        if (result?.error) {
          setError(result.error);
          return;
        }

        if (result?.success) {
          setSuccess(result.success);
          
          if (result.redirectTo) {
            setIsRedirecting(true);
            // Small delay to show success message
            await new Promise(resolve => setTimeout(resolve, 500));
            window.location.href = result.redirectTo;
          }
        }
      });
    } catch (e) {
      console.error("Login error:", e);
      setError("Authentication failed. Please try again.");
    }
  }

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
          </Link> */}
          {/* <h1 className="text-custom-purple font-bold text-xl mt-2">The - Library</h1> */}
        </CardHeader>

        {/* Login Header */}
        <div className="text-center px-8">
          <h1 className="text-2xl font-bold text-dark-blue">Welcome Back</h1>
          <p className="mt-2 text-sm text-custom-slate">Please login to your account</p>
        </div>

        {/* Login Form */}
        <CardContent className="pt-6 px-8 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                          placeholder="Enter the Email"
                          className="h-12  rounded-lg border-custom-slate/30 focus:border-dark-blue focus:ring-1 focus:ring-dark-blue transition-all duration-200"
                          type="email"
                          disabled={isPending}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-xs mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="text-sm font-medium text-custom-slate">Password</div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-custom-slate h-5 w-5 group-hover:text-dark-blue transition-colors duration-200" />
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="********"
                          className="h-12  pr-10 rounded-lg border-custom-slate/30 focus:border-dark-blue focus:ring-1 focus:ring-dark-blue transition-all duration-200"
                          type={showPassword ? "text" : "password"}
                          disabled={isPending}
                        />
                      </FormControl>
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-custom-slate hover:text-dark-blue transition-colors duration-200"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <FormMessage className="text-xs mt-1" />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-custom-slate/30 text-dark-blue focus:ring-dark-blue h-4 w-4"
                  />
                  <span className="ml-2 text-sm text-custom-slate">Remember me</span>
                </label>
                <Button
                  asChild
                  variant="link"
                  size="sm"
                  className="px-0 text-sm text-custom-purple hover:text-dark-blue"
                >
                  <Link href="/auth/forgot-password">Forgot password?</Link>
                </Button>
              </div>

              <FormError message={error} />
              <FormSuccess message={success} />

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
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>

              <div className="text-center mt-6">
                <Link 
                  href="/auth/register" 
                  className="text-sm font-medium text-custom-slate hover:text-dark-blue transition-colors"
                >
                  Don&apos;t have an account? {" "}
                  <span className="text-custom-purple hover:text-dark-blue font-medium underline-offset-4 hover:underline transition-all duration-200">
                    Register Instead
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

export default LoginForm;