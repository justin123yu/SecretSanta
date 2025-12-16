import { sql } from './db';
import { getAllUsers, createAssignments } from './assignments';

export interface RandomizerConfig {
  id: number;
  assignment_date: Date;
  is_completed: boolean;
  year: number;
}

export async function setRandomizerDate(date: Date, year: number) {
  // Delete existing config for this year
  await sql`
    DELETE FROM randomizer_config
    WHERE year = ${year}
  `;

  await sql`
    INSERT INTO randomizer_config (assignment_date, year, is_completed)
    VALUES (${date.toISOString().split('T')[0]}, ${year}, FALSE)
  `;
}

export async function getRandomizerConfig(year: number): Promise<RandomizerConfig | null> {
  const result = await sql`
    SELECT id, assignment_date, is_completed, year
    FROM randomizer_config
    WHERE year = ${year}
    ORDER BY id DESC
    LIMIT 1
  `;

  if (result.length === 0) {
    return null;
  }

  return {
    id: result[0].id as number,
    assignment_date: new Date(result[0].assignment_date as string),
    is_completed: result[0].is_completed as boolean,
    year: result[0].year as number,
  };
}

export async function shouldRunRandomizer(): Promise<boolean> {
  const currentYear = new Date().getFullYear();
  const config = await getRandomizerConfig(currentYear);

  if (!config || config.is_completed) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const assignmentDate = new Date(config.assignment_date);
  assignmentDate.setHours(0, 0, 0, 0);

  return today >= assignmentDate;
}

export async function runRandomizer(): Promise<void> {
  const currentYear = new Date().getFullYear();
  const users = await getAllUsers();

  // Filter out excluded users
  const eligibleUsers = users.filter(u => !u.excluded);

  if (eligibleUsers.length < 2) {
    throw new Error('Need at least 2 eligible (non-excluded) users to create assignments');
  }

  // Create arrays of user IDs
  const userIds = eligibleUsers.map(u => u.id);
  const receivers = [...userIds];
  
  // Fisher-Yates shuffle to randomize the receiver order
  for (let i = receivers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
  }

  // Create a cycle: person at index i gives to person at index (i+1) mod n
  // This ensures:
  // - Each person gives to exactly one person (we iterate through all givers once)
  // - Each person receives from exactly one person (each position receives from previous)
  // - No self-assignments (as long as we handle the case where someone might get themselves)
  const assignments = [];
  
  // Build assignments ensuring no self-assignment
  for (let i = 0; i < userIds.length; i++) {
    const giverId = userIds[i];
    let receiverIndex = (i + 1) % receivers.length;
    let receiverId = receivers[receiverIndex];
    
    // If someone would get themselves, find the next available receiver
    // This should be rare with proper shuffling, but we handle it
    let attempts = 0;
    while (giverId === receiverId && attempts < receivers.length) {
      receiverIndex = (receiverIndex + 1) % receivers.length;
      receiverId = receivers[receiverIndex];
      attempts++;
    }
    
    // If we still have a self-assignment after trying all positions, 
    // swap with the previous assignment (this should never happen with 2+ people)
    if (giverId === receiverId && receivers.length > 1) {
      // Swap the current receiver with the previous one
      const prevIndex = (i - 1 + receivers.length) % receivers.length;
      [receivers[receiverIndex], receivers[prevIndex]] = [receivers[prevIndex], receivers[receiverIndex]];
      receiverId = receivers[receiverIndex];
    }
    
    assignments.push({
      giver_id: giverId,
      receiver_id: receiverId,
      year: currentYear,
    });
  }

  // Validate: ensure each person gives exactly once and receives exactly once
  const giverCounts = new Map<number, number>();
  const receiverCounts = new Map<number, number>();
  
  for (const assignment of assignments) {
    giverCounts.set(assignment.giver_id, (giverCounts.get(assignment.giver_id) || 0) + 1);
    receiverCounts.set(assignment.receiver_id, (receiverCounts.get(assignment.receiver_id) || 0) + 1);
  }
  
  // Verify each person gives and receives exactly once
  for (const userId of userIds) {
    if (giverCounts.get(userId) !== 1) {
      throw new Error(`Invalid assignment: User ${userId} gives ${giverCounts.get(userId) || 0} times (should be 1)`);
    }
    if (receiverCounts.get(userId) !== 1) {
      throw new Error(`Invalid assignment: User ${userId} receives ${receiverCounts.get(userId) || 0} times (should be 1)`);
    }
  }

  await createAssignments(assignments);

  // Mark randomizer as completed
  await sql`
    UPDATE randomizer_config
    SET is_completed = TRUE
    WHERE year = ${currentYear}
  `;
}

