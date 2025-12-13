"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Bot } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { loginSchema, LoginFormValues } from "@/lib/validation-schemas";

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

export default function SignInForm() {
  const navigate = useNavigate();
  const { login, error: authError, clearError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Use auth context error if available
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setError(null);
    clearError();

    try {
      await login(data.email, data.password);
      // If login is successful, the auth context will update and we'll navigate to dashboard
      navigate("/dashboard");
    } catch (err: Error | unknown) {
      console.log(err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-neutral-800 bg-neutral-900 shadow-xl">
        <div className="flex justify-center mt-6">
          <div className="rounded-full bg-white/10 p-3">
            <Bot className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardHeader className="space-y-1 pt-2 pb-0">
          <CardTitle className="text-xl font-semibold text-center text-white">
            Sign in to HiringAI
          </CardTitle>
          <CardDescription className="text-center text-sm text-neutral-400">
            Enter your email and password to access your recruiter dashboard
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
              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-neutral-200"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center pb-6 pt-2 space-y-2">
          <Link
            to="/forgot-password"
            className="text-sm text-neutral-400 hover:text-white font-medium"
          >
            Forgot Password?
          </Link>
          <div className="text-sm text-center text-neutral-500">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-white hover:underline font-medium"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
