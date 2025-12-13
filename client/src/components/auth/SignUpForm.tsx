"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { signupSchema, SignupFormValues } from "@/lib/validation-schemas";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignUpForm() {
  const navigate = useNavigate();
  const { register, error: authError, clearError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Use auth context error if available
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  async function onSubmit(data: SignupFormValues) {
    setIsLoading(true);
    setError(null);
    clearError();

    try {
      await register(data.name, data.email, data.password);
      // If registration is successful, navigate to dashboard
      navigate("/dashboard");
    } catch {
      setError("An error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-neutral-800 bg-neutral-900 shadow-xl">
        <div className="flex justify-center mt-6">
          <div className="rounded-full bg-white/10 p-3">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="monogram_grad" x1="8" y1="40" x2="40" y2="8" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#A855F7" /> <stop offset="1" stop-color="#3B82F6" /> </linearGradient>
              </defs>
              <path d="M14 10C14 8.89543 14.8954 8 16 8H20C21.1046 8 22 8.89543 22 10V38C22 39.1046 21.1046 40 20 40H16C14.8954 40 14 39.1046 14 38V10Z" fill="url(#monogram_grad)" />
              <path d="M26 18C26 16.8954 26.8954 16 28 16H32C33.1046 16 34 16.8954 34 18V38C34 39.1046 33.1046 40 32 40H28C26.8954 40 26 39.1046 26 38V18Z" fill="url(#monogram_grad)" fill-opacity="0.8" />
              <path d="M22 22H26" stroke="url(#monogram_grad)" stroke-width="4" stroke-linecap="round" />
              <circle cx="38" cy="12" r="4" fill="#EC4899" /> </svg>
          </div>
        </div>
        <CardHeader className="space-y-1 pt-2 pb-0">
          <CardTitle className="text-xl font-semibold text-center text-white">
            Create your HiringAI account
          </CardTitle>
          <CardDescription className="text-center text-sm text-neutral-400">
            Enter your information to start screening candidates with AI
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-900/50 border-red-900 text-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-300">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-300">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        {...field}
                        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-300">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-neutral-300">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-neutral-200"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center pb-6 pt-2">
          <div className="text-sm text-center text-neutral-500">
            Already have an account?{" "}
            <Link
              to="/signin"
              className="text-white hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
