import { sql } from './db';

export interface Assignment {
  id: number;
  giver_id: number;
  receiver_id: number;
  year: number;
  created_at: Date;
}

export interface ReceiverInfo {
  receiver_id: number;
  receiver_name: string;
  receiver_email: string;
  info_text: string | null;
}

export async function createAssignments(assignments: Array<{ giver_id: number; receiver_id: number; year: number }>) {
  // Delete existing assignments for this year
  if (assignments.length > 0) {
    await sql`
      DELETE FROM assignments
      WHERE year = ${assignments[0].year}
    `;
  }

  // Insert new assignments
  for (const assignment of assignments) {
    await sql`
      INSERT INTO assignments (giver_id, receiver_id, year)
      VALUES (${assignment.giver_id}, ${assignment.receiver_id}, ${assignment.year})
    `;
  }
}

export async function getAssignment(giverId: number, year: number): Promise<ReceiverInfo | null> {
  const result = await sql`
    SELECT 
      a.receiver_id,
      u.name as receiver_name,
      u.email as receiver_email,
      ui.info_text
    FROM assignments a
    JOIN users u ON a.receiver_id = u.id
    LEFT JOIN user_info ui ON a.receiver_id = ui.user_id
    WHERE a.giver_id = ${giverId} AND a.year = ${year}
  `;

  if (result.length === 0) {
    return null;
  }

  return {
    receiver_id: result[0].receiver_id as number,
    receiver_name: result[0].receiver_name as string,
    receiver_email: result[0].receiver_email as string,
    info_text: result[0].info_text as string | null,
  };
}

export interface User {
  id: number;
  email: string;
  name: string;
  is_admin: boolean;
  excluded: boolean;
}

export async function getAllUsers() {
  const result = await sql`
    SELECT id, email, name, is_admin, excluded
    FROM users
    ORDER BY name
  `;

  return result as Array<User>;
}

export async function toggleUserExclusion(userId: number) {
  const result = await sql`
    UPDATE users
    SET excluded = NOT excluded
    WHERE id = ${userId}
    RETURNING id, excluded
  `;

  return result[0] as { id: number; excluded: boolean };
}

export async function getAllAssignments(year: number) {
  const result = await sql`
    SELECT 
      a.id,
      a.giver_id,
      giver.name as giver_name,
      giver.email as giver_email,
      a.receiver_id,
      receiver.name as receiver_name,
      receiver.email as receiver_email,
      a.year,
      a.created_at
    FROM assignments a
    JOIN users giver ON a.giver_id = giver.id
    JOIN users receiver ON a.receiver_id = receiver.id
    WHERE a.year = ${year}
    ORDER BY giver.name
  `;

  return result as Array<{
    id: number;
    giver_id: number;
    giver_name: string;
    giver_email: string;
    receiver_id: number;
    receiver_name: string;
    receiver_email: string;
    year: number;
    created_at: Date;
  }>;
}

export async function updateUserInfo(userId: number, infoText: string) {
  await sql`
    INSERT INTO user_info (user_id, info_text, updated_at)
    VALUES (${userId}, ${infoText}, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id) DO UPDATE
    SET info_text = ${infoText}, updated_at = CURRENT_TIMESTAMP
  `;
}

export async function getUserInfo(userId: number) {
  const result = await sql`
    SELECT info_text
    FROM user_info
    WHERE user_id = ${userId}
  `;

  if (result.length === 0) {
    return null;
  }

  return result[0].info_text as string | null;
}
