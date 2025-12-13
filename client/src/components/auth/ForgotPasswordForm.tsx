import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Mail, AlertCircle, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define the form schema
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Password reset requested for:", values.email);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);
    } catch (error) {
      setError(error.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <Card className="w-full max-w-md border shadow-sm">
      <div className="flex justify-center mt-6">
        <div className="rounded-full bg-green-100 p-3">
          <Mail className="h-6 w-6 text-green-600" />
        </div>
      </div>
      <CardHeader className="space-y-1 pt-2 pb-0">
        <CardTitle className="text-xl font-semibold text-center">
          Reset Password
        </CardTitle>
        <CardDescription className="text-center text-sm">
          Enter your email and we'll send you a link to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
            <button
              className="ml-auto text-sm font-medium text-red-600 hover:text-red-800"
              onClick={clearError}
              aria-label="Dismiss error"
            >
              Dismiss
            </button>
          </div>
        )}

        {success ? (
          <div className="text-center py-6">
            <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-5">
              <p className="font-medium">Reset link sent!</p>
              <p className="text-sm mt-1">
                Check your email for instructions to reset your password.
              </p>
            </div>
            <Link
              to="/signin"
              className="text-green-600 hover:text-green-500 font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        type="email"
                        className="bg-gray-50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center pb-6 pt-2">
        <div className="text-sm text-center text-muted-foreground">
          Remember your password?{" "}
          <Link
            to="/signin"
            className="text-green-600 hover:text-green-500 font-medium"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
