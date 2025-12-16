import { sql } from './db';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
  const passwordHash = await bcrypt.hash(password, 10);
  
  const result = await sql`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email}, ${passwordHash}, ${name})
    RETURNING id, email, name, is_admin
  `;
  
  return result[0] as User;
}

export async function verifyUser(email: string, password: string): Promise<User | null> {
  const result = await sql`
    SELECT id, email, password_hash, name, is_admin
    FROM users
    WHERE email = ${email}
  `;
  
  if (result.length === 0) {
    return null;
  }
  
  const user = result[0];
  const isValid = await bcrypt.compare(password, user.password_hash as string);
  
  if (!isValid) {
    return null;
  }
  
  return {
    id: user.id as number,
    email: user.email as string,
    name: user.name as string,
    is_admin: user.is_admin as boolean,
  };
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await sql`
    SELECT id, email, name, is_admin
    FROM users
    WHERE id = ${id}
  `;
  
  if (result.length === 0) {
    return null;
  }
  
  return result[0] as User;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`
    SELECT id, email, name, is_admin
    FROM users
    WHERE email = ${email}
  `;
  
  if (result.length === 0) {
    return null;
  }
  
  return result[0] as User;
}

