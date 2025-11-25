import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  loginSchema,
  createUserSchema,
  validateData,
} from '@/utils/validation';

describe('Validation Utilities', () => {
  describe('emailSchema', () => {
    it('validates correct email addresses', () => {
      expect(emailSchema.safeParse('user@example.com').success).toBe(true);
      expect(emailSchema.safeParse('test.user@domain.co.uk').success).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(emailSchema.safeParse('invalid').success).toBe(false);
      expect(emailSchema.safeParse('user@').success).toBe(false);
      expect(emailSchema.safeParse('@example.com').success).toBe(false);
    });
  });

  describe('passwordSchema', () => {
    it('validates strong passwords', () => {
      expect(passwordSchema.safeParse('Password123!').success).toBe(true);
      expect(passwordSchema.safeParse('Secure@Pass1').success).toBe(true);
    });

    it('rejects weak passwords', () => {
      expect(passwordSchema.safeParse('weak').success).toBe(false);
      expect(passwordSchema.safeParse('password').success).toBe(false);
      expect(passwordSchema.safeParse('Password123').success).toBe(false); // No special char
      expect(passwordSchema.safeParse('password123!').success).toBe(false); // No uppercase
    });
  });

  describe('nameSchema', () => {
    it('validates correct names', () => {
      expect(nameSchema.safeParse('John').success).toBe(true);
      expect(nameSchema.safeParse('John Doe').success).toBe(true);
    });

    it('rejects invalid names', () => {
      expect(nameSchema.safeParse('A').success).toBe(false);
      expect(nameSchema.safeParse('').success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid login data', () => {
      const result1 = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result1.success).toBe(false);

      const result2 = loginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });
      expect(result2.success).toBe(false);
    });
  });

  describe('createUserSchema', () => {
    it('validates correct user data', () => {
      const result = createUserSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'admin',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid user data', () => {
      const result = createUserSchema.safeParse({
        name: 'J',
        email: 'invalid',
        password: 'weak',
        role: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('validateData', () => {
    it('returns success for valid data', () => {
      const result = validateData(loginSchema, {
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.errors).toBeNull();
    });

    it('returns errors for invalid data', () => {
      const result = validateData(loginSchema, {
        email: 'invalid',
        password: '',
      });
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.errors).toBeTruthy();
      expect(result.errors?.email).toBeTruthy();
      expect(result.errors?.password).toBeTruthy();
    });
  });
});
