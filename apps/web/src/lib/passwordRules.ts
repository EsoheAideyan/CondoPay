/** Shared password rules for register UI + API. */

export interface PasswordChecks {
  minLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= 8,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[^a-zA-Z0-9]/.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  const c = getPasswordChecks(password);
  return c.minLength && c.hasLetter && c.hasNumber && c.hasSpecial;
}

/** Human-readable reason for API / form errors */
export function passwordValidationError(password: string): string | null {
  if (!password) return 'Password is required';
  const c = getPasswordChecks(password);
  if (!c.minLength) return 'Password must be at least 8 characters';
  if (!c.hasLetter) return 'Password must include at least one letter';
  if (!c.hasNumber) return 'Password must include at least one number';
  if (!c.hasSpecial) {
    return 'Password must include at least one special character (e.g. !@#$)';
  }
  return null;
}

export const PASSWORD_RULES = [
  { key: 'minLength' as const, label: 'At least 8 characters' },
  { key: 'hasLetter' as const, label: 'At least one letter' },
  { key: 'hasNumber' as const, label: 'At least one number' },
  { key: 'hasSpecial' as const, label: 'At least one special character (!@#$…)' },
];
