/**
 * Password validation and strength utilities
 */

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  feedback: string[];
}

/**
 * Minimum password requirements
 */
export interface PasswordRequirements {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  minUppercase?: number;
  minLowercase?: number;
  minNumbers?: number;
  minSpecialChars?: number;
}

/**
 * Default password requirements
 */
const DEFAULT_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  minUppercase: 1,
  minLowercase: 1,
  minNumbers: 1,
  minSpecialChars: 1,
};

/**
 * Common weak passwords
 */
const COMMON_PASSWORDS = [
  'password',
  '12345678',
  'password123',
  'qwerty',
  'abc123',
  'monkey',
  '1234567890',
  'letmein',
  'trustno1',
  'dragon',
  'baseball',
  'iloveyou',
  'master',
  'sunshine',
  'ashley',
  'bailey',
  'passw0rd',
  'shadow',
  '123123',
  '654321',
];

/**
 * Validate password against requirements
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_REQUIREMENTS
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return { valid: false, errors };
  }

  const {
    minLength = 8,
    maxLength = 128,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
    minUppercase = 1,
    minLowercase = 1,
    minNumbers = 1,
    minSpecialChars = 1,
  } = requirements;

  // Length checks
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`);
  }

  if (password.length > maxLength) {
    errors.push(`Password must not exceed ${maxLength} characters`);
  }

  // Character type checks
  const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
  const lowercaseCount = (password.match(/[a-z]/g) || []).length;
  const numberCount = (password.match(/[0-9]/g) || []).length;
  const specialCharCount = (password.match(/[^A-Za-z0-9]/g) || []).length;

  if (requireUppercase && uppercaseCount < minUppercase) {
    errors.push(
      `Password must contain at least ${minUppercase} uppercase ${
        minUppercase === 1 ? 'letter' : 'letters'
      }`
    );
  }

  if (requireLowercase && lowercaseCount < minLowercase) {
    errors.push(
      `Password must contain at least ${minLowercase} lowercase ${
        minLowercase === 1 ? 'letter' : 'letters'
      }`
    );
  }

  if (requireNumbers && numberCount < minNumbers) {
    errors.push(
      `Password must contain at least ${minNumbers} ${minNumbers === 1 ? 'number' : 'numbers'}`
    );
  }

  if (requireSpecialChars && specialCharCount < minSpecialChars) {
    errors.push(
      `Password must contain at least ${minSpecialChars} special ${
        minSpecialChars === 1 ? 'character' : 'characters'
      }`
    );
  }

  // Check for common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('Password is too common');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: 'Very Weak',
      feedback: ['Password is required'],
    };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length < 8) {
    feedback.push('Use at least 8 characters');
  }

  // Character variety
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[^A-Za-z0-9]/.test(password);

  if (hasLowercase && hasUppercase) score++;
  if (hasNumbers) score++;
  if (hasSpecialChars) score++;

  if (!hasUppercase) feedback.push('Add uppercase letters');
  if (!hasLowercase) feedback.push('Add lowercase letters');
  if (!hasNumbers) feedback.push('Add numbers');
  if (!hasSpecialChars) feedback.push('Add special characters (!@#$%^&*)');

  // Common password check
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    score = Math.max(0, score - 2);
    feedback.push('Avoid common passwords');
  }

  // Sequential characters
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    feedback.push('Avoid repeating characters');
  }

  // Clamp score between 0 and 4
  score = Math.min(4, Math.max(0, score)) as 0 | 1 | 2 | 3 | 4;

  const labels: Record<number, 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong'> = {
    0: 'Very Weak',
    1: 'Weak',
    2: 'Fair',
    3: 'Good',
    4: 'Strong',
  };

  return {
    score,
    label: labels[score],
    feedback: feedback.length > 0 ? feedback : ['Password looks good!'],
  };
}

/**
 * Generate a random password
 */
export function generatePassword(length = 16, options: {
  includeUppercase?: boolean;
  includeLowercase?: boolean;
  includeNumbers?: boolean;
  includeSpecialChars?: boolean;
} = {}): string {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSpecialChars = true,
  } = options;

  let charset = '';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (includeUppercase) charset += uppercase;
  if (includeLowercase) charset += lowercase;
  if (includeNumbers) charset += numbers;
  if (includeSpecialChars) charset += specialChars;

  if (charset.length === 0) {
    throw new Error('At least one character set must be included');
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  // Ensure at least one character from each selected set
  if (includeUppercase && !/[A-Z]/.test(password)) {
    password = password.slice(0, -1) + uppercase[Math.floor(Math.random() * uppercase.length)];
  }
  if (includeLowercase && !/[a-z]/.test(password)) {
    password = password.slice(0, -1) + lowercase[Math.floor(Math.random() * lowercase.length)];
  }
  if (includeNumbers && !/[0-9]/.test(password)) {
    password = password.slice(0, -1) + numbers[Math.floor(Math.random() * numbers.length)];
  }
  if (includeSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
    password = password.slice(0, -1) + specialChars[Math.floor(Math.random() * specialChars.length)];
  }

  return password;
}

/**
 * Check if two passwords match
 */
export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword;
}

/**
 * Hash password (client-side - for demonstration only, use server-side hashing in production)
 */
export async function hashPassword(password: string): Promise<string> {
  // This is a simple example using Web Crypto API
  // In production, use proper server-side hashing (bcrypt, argon2, etc.)
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API not available');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * Check if password contains user information
 */
export function containsUserInfo(password: string, userInfo: {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}): boolean {
  const lowerPassword = password.toLowerCase();

  if (userInfo.email) {
    const emailParts = userInfo.email.split('@')[0].toLowerCase();
    if (lowerPassword.includes(emailParts)) return true;
  }

  if (userInfo.username && lowerPassword.includes(userInfo.username.toLowerCase())) {
    return true;
  }

  if (userInfo.firstName && lowerPassword.includes(userInfo.firstName.toLowerCase())) {
    return true;
  }

  if (userInfo.lastName && lowerPassword.includes(userInfo.lastName.toLowerCase())) {
    return true;
  }

  return false;
}

/**
 * Get password requirements as human-readable text
 */
export function getRequirementsText(
  requirements: PasswordRequirements = DEFAULT_REQUIREMENTS
): string[] {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
  } = requirements;

  const text: string[] = [];

  text.push(`At least ${minLength} characters`);

  if (requireUppercase) text.push('At least one uppercase letter');
  if (requireLowercase) text.push('At least one lowercase letter');
  if (requireNumbers) text.push('At least one number');
  if (requireSpecialChars) text.push('At least one special character');

  return text;
}
