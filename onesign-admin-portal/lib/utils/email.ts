/**
 * Email validation utilities
 */

/**
 * Basic email regex pattern
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Strict email regex pattern (RFC 5322)
 */
const STRICT_EMAIL_REGEX =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Validate email address (strict)
 */
export function isValidEmailStrict(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return STRICT_EMAIL_REGEX.test(email.trim());
}

/**
 * Validate multiple email addresses (comma or semicolon separated)
 */
export function isValidEmails(emails: string, separator = ','): boolean {
  if (!emails || typeof emails !== 'string') return false;

  const emailList = emails.split(separator).map((e) => e.trim());
  return emailList.every((email) => isValidEmail(email));
}

/**
 * Extract email domain
 */
export function extractDomain(email: string): string | null {
  if (!isValidEmail(email)) return null;

  const parts = email.trim().split('@');
  return parts.length === 2 ? parts[1].toLowerCase() : null;
}

/**
 * Extract email username (local part)
 */
export function extractUsername(email: string): string | null {
  if (!isValidEmail(email)) return null;

  const parts = email.trim().split('@');
  return parts.length === 2 ? parts[0] : null;
}

/**
 * Normalize email address (lowercase, trim)
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Check if email is from a specific domain
 */
export function isFromDomain(email: string, domain: string): boolean {
  const emailDomain = extractDomain(email);
  return emailDomain === domain.toLowerCase();
}

/**
 * Check if email is from any of the specified domains
 */
export function isFromDomains(email: string, domains: string[]): boolean {
  const emailDomain = extractDomain(email);
  return domains.some((domain) => emailDomain === domain.toLowerCase());
}

/**
 * Common disposable email domains
 */
const DISPOSABLE_DOMAINS = [
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.com',
  'throwaway.email',
  'yopmail.com',
  'getnada.com',
  'maildrop.cc',
  'temp-mail.org',
];

/**
 * Check if email is from a disposable email provider
 */
export function isDisposableEmail(email: string): boolean {
  const domain = extractDomain(email);
  if (!domain) return false;

  return DISPOSABLE_DOMAINS.includes(domain);
}

/**
 * Mask email for privacy (e.g., "j***n@example.com")
 */
export function maskEmail(email: string): string {
  if (!isValidEmail(email)) return email;

  const parts = email.split('@');
  const username = parts[0];
  const domain = parts[1];

  if (username.length <= 2) {
    return `${username}@${domain}`;
  }

  const firstChar = username[0];
  const lastChar = username[username.length - 1];
  const masked = '*'.repeat(username.length - 2);

  return `${firstChar}${masked}${lastChar}@${domain}`;
}

/**
 * Parse and validate multiple emails from a string
 */
export function parseEmails(
  input: string,
  separators: string[] = [',', ';', ' ', '\n']
): string[] {
  const regex = new RegExp(`[${separators.join('')}]+`);
  return input
    .split(regex)
    .map((email) => email.trim())
    .filter((email) => email && isValidEmail(email));
}

/**
 * Check if email format is valid for specific use cases
 */
export function isValidForUseCase(
  email: string,
  useCase: 'signup' | 'login' | 'contact' = 'signup'
): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  if (!isValidEmail(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (useCase === 'signup' && isDisposableEmail(email)) {
    return { valid: false, error: 'Disposable email addresses are not allowed' };
  }

  const domain = extractDomain(email);
  if (!domain) {
    return { valid: false, error: 'Invalid email domain' };
  }

  // Additional checks can be added here based on use case

  return { valid: true };
}
