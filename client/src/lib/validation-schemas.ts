import { z } from "zod";

/**
 * Sign-in form validation schema
 */
export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(1, { message: "Password must be at least 6 characters" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Sign-up form validation schema
 */
export const signupSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(1, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

/**
 * Validates sign-in form data and returns validation result
 */
export function validateLoginForm(data: unknown): { success: boolean; errors?: Record<string, string> } {
  const result = loginSchema.safeParse(data);
  if (result.success) {
    return { success: true };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return { success: false, errors };
}

/**
 * Validates sign-up form data and returns validation result
 */
export function validateSignupForm(data: unknown): { success: boolean; errors?: Record<string, string> } {
  const result = signupSchema.safeParse(data);
  if (result.success) {
    return { success: true };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });
  return { success: false, errors };
}
