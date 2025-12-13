import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { validateSignupForm } from '@/lib/validation-schemas';

/**
 * Property-based tests for SignUpForm validation
 * 
 * **Feature: landing-page, Property 2: Invalid field validation on registration**
 * **Validates: Requirements 6.3**
 * 
 * *For any* registration form submission with invalid data (invalid email format, 
 * password too short, mismatched passwords, empty required fields), the form 
 * SHALL display specific validation errors for each invalid field.
 */
describe('SignUpForm Validation Properties', () => {
  /**
   * **Feature: landing-page, Property 2: Invalid field validation on registration**
   * **Validates: Requirements 6.3**
   */
  describe('Property 2: Invalid field validation on registration', () => {
    it('should reject invalid email formats and return email-specific error', () => {
      // Generate strings that are NOT valid emails
      const invalidEmailArbitrary = fc.oneof(
        fc.string().filter(s => !s.includes('@')), // No @ symbol
        fc.string().filter(s => s.includes('@') && !s.includes('.')), // @ but no domain
        fc.constant(''), // Empty string
        fc.constant('plaintext'), // No @ or domain
        fc.constant('@nodomain.com'), // Missing local part
        fc.constant('missing@'), // Missing domain
      );

      fc.assert(
        fc.property(
          invalidEmailArbitrary,
          fc.string({ minLength: 6 }), // Valid password length
          fc.string({ minLength: 2 }), // Valid name length
          (email, password, name) => {
            const result = validateSignupForm({
              name,
              email,
              password,
              confirmPassword: password,
            });

            // If email is invalid, validation should fail with email error
            if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
              expect(result.success).toBe(false);
              expect(result.errors).toBeDefined();
              expect(result.errors?.email).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject empty required fields and return field-specific errors', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.oneof(fc.constant(''), fc.constant(' ')),
            email: fc.oneof(fc.constant(''), fc.emailAddress()),
            password: fc.oneof(fc.constant(''), fc.string({ minLength: 6 })),
            confirmPassword: fc.string(),
          }),
          (formData) => {
            const result = validateSignupForm(formData);

            // If name is empty or too short, should have name error
            if (formData.name.trim().length < 2) {
              expect(result.success).toBe(false);
              expect(result.errors?.name).toBeDefined();
            }

            // If email is empty, should have email error
            if (formData.email === '') {
              expect(result.success).toBe(false);
              expect(result.errors?.email).toBeDefined();
            }

            // If password is empty, should have password error
            if (formData.password === '') {
              expect(result.success).toBe(false);
              expect(result.errors?.password).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject mismatched passwords and return confirmPassword error', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 2 }), // Valid name
          fc.emailAddress(), // Valid email
          fc.string({ minLength: 6 }), // Valid password
          fc.string({ minLength: 6 }), // Different confirm password
          (name, email, password, confirmPassword) => {
            // Only test when passwords are actually different
            fc.pre(password !== confirmPassword);

            const result = validateSignupForm({
              name,
              email,
              password,
              confirmPassword,
            });

            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
            expect(result.errors?.confirmPassword).toBe('Passwords do not match');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * **Feature: landing-page, Property 3: Short password rejection**
   * **Validates: Requirements 6.4**
   * 
   * *For any* password input with fewer than 6 characters on the registration form, 
   * the form SHALL display a validation error indicating the minimum length requirement.
   */
  describe('Property 3: Short password rejection', () => {
    it('should reject passwords shorter than 6 characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 2 }), // Valid name
          fc.emailAddress(), // Valid email
          fc.string({ minLength: 0, maxLength: 5 }), // Short password (0-5 chars)
          (name, email, shortPassword) => {
            const result = validateSignupForm({
              name,
              email,
              password: shortPassword,
              confirmPassword: shortPassword,
            });

            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
            expect(result.errors?.password).toBe('Password must be at least 6 characters');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept passwords with exactly 6 or more characters', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 2 }), // Valid name
          fc.emailAddress(), // Valid email
          fc.string({ minLength: 6, maxLength: 50 }), // Valid password (6+ chars)
          (name, email, validPassword) => {
            const result = validateSignupForm({
              name,
              email,
              password: validPassword,
              confirmPassword: validPassword,
            });

            // Password validation should pass (no password error)
            // Note: other fields might still cause validation to fail
            if (!result.success && result.errors) {
              expect(result.errors.password).toBeUndefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
