import { sql } from './db';
import { randomBytes } from 'crypto';

export interface PasswordResetToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Create a password reset token for a user
 * Token expires in 24 hours
 */
export async function createPasswordResetToken(userId: number): Promise<string> {
  // Delete any existing unused tokens for this user
  await sql`
    DELETE FROM password_reset_tokens
    WHERE user_id = ${userId} AND used = FALSE
  `;

  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now

  await sql`
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `;

  return token;
}

/**
 * Validate a password reset token
 */
export async function validatePasswordResetToken(token: string): Promise<{ valid: boolean; userId: number | null }> {
  const result = await sql`
    SELECT user_id, expires_at, used
    FROM password_reset_tokens
    WHERE token = ${token}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  if (result.length === 0) {
    return { valid: false, userId: null };
  }

  const resetToken = result[0];
  const now = new Date();
  const expiresAt = new Date(resetToken.expires_at as string);

  if (resetToken.used || expiresAt < now) {
    return { valid: false, userId: null };
  }

  return { valid: true, userId: resetToken.user_id as number };
}

/**
 * Delete a password reset token after use
 */
export async function deleteToken(token: string): Promise<void> {
  await sql`
    DELETE FROM password_reset_tokens
    WHERE token = ${token}
  `;
}

/**
 * Reset a user's password using a token
 */
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  const validation = await validatePasswordResetToken(token);

  if (!validation.valid || !validation.userId) {
    return false;
  }

  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash(newPassword, 10);

  await sql`
    UPDATE users
    SET password_hash = ${passwordHash}
    WHERE id = ${validation.userId}
  `;

  // Delete the token after successful password reset
  await deleteToken(token);

  return true;
}

