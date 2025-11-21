/**
 * Phone number validation utilities
 */

/**
 * Basic phone number regex (international format)
 */
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

/**
 * US phone number regex
 */
const US_PHONE_REGEX = /^(\+1|1)?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;

/**
 * International phone number regex (E.164 format)
 */
const E164_REGEX = /^\+[1-9]\d{1,14}$/;

/**
 * Validate phone number (basic)
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  return PHONE_REGEX.test(phone.trim());
}

/**
 * Validate US phone number
 */
export function isValidUSPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  return US_PHONE_REGEX.test(phone.trim());
}

/**
 * Validate E.164 format phone number
 */
export function isValidE164(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  return E164_REGEX.test(phone.trim());
}

/**
 * Format phone number to E.164 format
 */
export function formatToE164(phone: string, countryCode = '+1'): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return `+${cleaned}`;
  }

  if (cleaned.length === 10) {
    return `${countryCode}${cleaned}`;
  }

  if (cleaned.startsWith(countryCode.replace('+', ''))) {
    return `+${cleaned}`;
  }

  return `${countryCode}${cleaned}`;
}

/**
 * Format US phone number
 * @example formatUSPhone('1234567890') => '(123) 456-7890'
 */
export function formatUSPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Format international phone number
 * @example formatInternationalPhone('+441234567890') => '+44 123 456 7890'
 */
export function formatInternationalPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length < 7) return phone;

  const countryCode = cleaned[0] === '1' ? cleaned.slice(0, 1) : cleaned.slice(0, 2);
  const rest = cleaned.slice(countryCode.length);

  const parts = [];
  for (let i = 0; i < rest.length; i += 3) {
    parts.push(rest.slice(i, i + 3));
  }

  return `+${countryCode} ${parts.join(' ')}`;
}

/**
 * Remove formatting from phone number
 */
export function stripPhoneFormatting(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Normalize phone number (remove all non-digits)
 */
export function normalizePhone(phone: string): string {
  return stripPhoneFormatting(phone);
}

/**
 * Extract country code from phone number
 */
export function extractCountryCode(phone: string): string | null {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return '+1';
  }

  if (cleaned.length > 10) {
    return `+${cleaned.slice(0, cleaned.length - 10)}`;
  }

  return null;
}

/**
 * Check if phone number is mobile (basic heuristic)
 */
export function isMobilePhone(phone: string): boolean {
  // This is a simplified check and should be enhanced for production
  const cleaned = stripPhoneFormatting(phone);

  // US mobile prefixes (simplified)
  const usMobilePrefixes = ['2', '3', '4', '5', '6', '7', '8', '9'];

  if (cleaned.length === 10) {
    return usMobilePrefixes.includes(cleaned[0]);
  }

  if (cleaned.length === 11 && cleaned[0] === '1') {
    return usMobilePrefixes.includes(cleaned[1]);
  }

  return false;
}

/**
 * Mask phone number for privacy
 * @example maskPhone('1234567890') => '******7890'
 */
export function maskPhone(phone: string, visibleDigits = 4): string {
  const cleaned = stripPhoneFormatting(phone);

  if (cleaned.length <= visibleDigits) return phone;

  const masked = '*'.repeat(cleaned.length - visibleDigits);
  const visible = cleaned.slice(-visibleDigits);

  return masked + visible;
}

/**
 * Validate phone number format for specific country
 */
export function isValidPhoneForCountry(
  phone: string,
  country: 'US' | 'UK' | 'CA' | 'AU'
): boolean {
  const cleaned = stripPhoneFormatting(phone);

  const patterns: Record<string, { length: number; prefix?: string }> = {
    US: { length: 10 },
    UK: { length: 10, prefix: '44' },
    CA: { length: 10 },
    AU: { length: 9, prefix: '61' },
  };

  const pattern = patterns[country];
  if (!pattern) return false;

  if (pattern.prefix) {
    return cleaned.startsWith(pattern.prefix) && cleaned.length === pattern.length + pattern.prefix.length;
  }

  return cleaned.length === pattern.length;
}

/**
 * Parse phone number into components
 */
export function parsePhone(phone: string): {
  countryCode: string | null;
  areaCode: string | null;
  localNumber: string;
  formatted: string;
} {
  const cleaned = stripPhoneFormatting(phone);
  const countryCode = extractCountryCode(phone);

  let areaCode: string | null = null;
  let localNumber = cleaned;

  if (cleaned.length === 10) {
    areaCode = cleaned.slice(0, 3);
    localNumber = cleaned.slice(3);
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    areaCode = cleaned.slice(1, 4);
    localNumber = cleaned.slice(4);
  }

  return {
    countryCode,
    areaCode,
    localNumber,
    formatted: formatUSPhone(phone),
  };
}

/**
 * Validate and format phone number
 */
export function validateAndFormat(
  phone: string
): { valid: boolean; formatted?: string; error?: string } {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }

  const cleaned = stripPhoneFormatting(phone);

  if (cleaned.length < 10) {
    return { valid: false, error: 'Phone number is too short' };
  }

  if (cleaned.length > 15) {
    return { valid: false, error: 'Phone number is too long' };
  }

  if (!isValidPhone(phone)) {
    return { valid: false, error: 'Invalid phone number format' };
  }

  return {
    valid: true,
    formatted: formatUSPhone(phone),
  };
}
