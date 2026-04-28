/**
 * Server-side input validation utilities for CrownWing API.
 *
 * These validators mirror (and enforce) the client-side rules
 * defined in app/api/auth/page.tsx, ensuring no bypass via direct API calls.
 */

// RFC 5322-ish email regex — rejects whitespace, requires @ and domain dot.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_MIN_LENGTH = 8;
const NAME_MAX_LENGTH = 100;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate an email address format.
 */
export function validateEmail(email: unknown): ValidationResult {
  if (typeof email !== 'string' || !email.trim()) {
    return { valid: false, error: 'Email is required.' };
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  return { valid: true };
}

/**
 * Validate password strength.
 * Rules (matching client-side):
 *  - Minimum 8 characters
 *  - At least 4 digits
 *  - At least 1 special character
 *  - At least 1 uppercase letter
 *  - At least 1 lowercase letter
 */
export function validatePassword(password: unknown): ValidationResult {
  if (typeof password !== 'string' || !password) {
    return { valid: false, error: 'Password is required.' };
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
    };
  }

  const digitCount = (password.match(/\d/g) || []).length;
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);

  if (digitCount < 4 || !hasSpecialChar || !hasUppercase || !hasLowercase) {
    return {
      valid: false,
      error:
        'Password must include at least 4 numbers, 1 special character, and both uppercase and lowercase letters.',
    };
  }

  return { valid: true };
}

/**
 * Validate a display name.
 */
export function validateName(name: unknown): ValidationResult {
  if (typeof name !== 'string' || !name.trim()) {
    return { valid: false, error: 'Name is required.' };
  }
  if (name.trim().length > NAME_MAX_LENGTH) {
    return {
      valid: false,
      error: `Name must be ${NAME_MAX_LENGTH} characters or fewer.`,
    };
  }
  return { valid: true };
}

/**
 * Validate all signup fields at once. Returns the first error found.
 */
export function validateSignupInput(body: {
  name?: unknown;
  email?: unknown;
  password?: unknown;
}): ValidationResult {
  const nameResult = validateName(body.name);
  if (!nameResult.valid) return nameResult;

  const emailResult = validateEmail(body.email);
  if (!emailResult.valid) return emailResult;

  const passwordResult = validatePassword(body.password);
  if (!passwordResult.valid) return passwordResult;

  return { valid: true };
}

/**
 * Validate login fields. Password is checked for presence only (not strength)
 * since we don't want to reveal password policy to attackers probing credentials.
 */
export function validateLoginInput(body: {
  email?: unknown;
  password?: unknown;
}): ValidationResult {
  const emailResult = validateEmail(body.email);
  if (!emailResult.valid) return emailResult;

  if (typeof body.password !== 'string' || !body.password) {
    return { valid: false, error: 'Password is required.' };
  }

  return { valid: true };
}
