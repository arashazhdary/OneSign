import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const nameSchema = z.string().min(2, 'Name must be at least 2 characters');
export const requiredStringSchema = z.string().min(1, 'This field is required');
export const urlSchema = z.string().url('Invalid URL');
export const phoneSchema = z
  .string()
  .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Invalid phone number');

// User validation schemas
export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: requiredStringSchema,
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

export const updateUserSchema = z.object({
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  role: requiredStringSchema.optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

// Tenant validation schemas
export const createTenantSchema = z.object({
  name: nameSchema,
  domain: z.string().min(3, 'Domain must be at least 3 characters'),
  contactEmail: emailSchema,
  plan: z.enum(['free', 'pro', 'enterprise']),
  status: z.enum(['active', 'inactive', 'trial']).optional(),
});

export const updateTenantSchema = createTenantSchema.partial();

// Role validation schemas
export const createRoleSchema = z.object({
  name: nameSchema,
  description: requiredStringSchema,
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
});

export const updateRoleSchema = createRoleSchema.partial();

// API Key validation schemas
export const createApiKeySchema = z.object({
  name: nameSchema,
  description: z.string().optional(),
  expiresAt: z.string().or(z.date()).optional(),
  permissions: z.array(z.string()).optional(),
});

// Settings validation schemas
export const generalSettingsSchema = z.object({
  systemName: requiredStringSchema,
  companyName: requiredStringSchema,
  timezone: requiredStringSchema,
  dateFormat: requiredStringSchema,
  timeFormat: z.enum(['12h', '24h']),
  language: z.enum(['en', 'fa']),
});

export const securitySettingsSchema = z.object({
  twoFactorAuth: z.boolean(),
  sessionTimeout: z.number().min(5).max(120),
  passwordPolicy: z
    .object({
      minLength: z.number().min(8),
      requireUppercase: z.boolean(),
      requireLowercase: z.boolean(),
      requireNumbers: z.boolean(),
      requireSpecialChars: z.boolean(),
    })
    .optional(),
});

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  slackNotifications: z.boolean().optional(),
  webhookUrl: urlSchema.optional(),
});

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Helper function to validate data against schema
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  try {
    return {
      success: true as const,
      data: schema.parse(data),
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false as const,
        data: null,
        errors: error.errors.reduce(
          (acc, err) => {
            const path = err.path.join('.');
            acc[path] = err.message;
            return acc;
          },
          {} as Record<string, string>
        ),
      };
    }
    return {
      success: false as const,
      data: null,
      errors: { general: 'Validation failed' },
    };
  }
};

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>;
export type SecuritySettingsInput = z.infer<typeof securitySettingsSchema>;
export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
