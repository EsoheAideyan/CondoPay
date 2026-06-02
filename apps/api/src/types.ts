/**
 * Shared TypeScript types for the API.
 *
 * These mirror concepts in the database (users.role, users.status) but use
 * camelCase in JSON responses — a common API convention.
 */

/** Who the user is in the system. Admins manage tenants; tenants pay rent. */
export type UserRole = 'tenant' | 'admin';

/**
 * Tenant approval workflow.
 * New registrations start as `pending` until an admin sets `active`.
 */
export type UserStatus = 'pending' | 'active' | 'inactive';

/** Safe user shape returned to clients — never includes password_hash. */
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  firstName: string;
  lastName: string;
  phone: string | null;
}

/**
 * Data stored inside a JWT after login/register.
 * `sub` (subject) is the standard JWT claim for user id.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

/**
 * Extend Express so `req.user` is typed after auth middleware runs.
 * Without this, TypeScript wouldn't know about req.user.
 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
