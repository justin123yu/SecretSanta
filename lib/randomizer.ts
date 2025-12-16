import { Person, Assignment } from '@/types';

/**
 * Creates a derangement (permutation with no fixed points) of the given array
 * using Fisher-Yates shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Checks if a permutation is a valid derangement (no element is in its original position)
 */
function isValidDerangement<T>(original: T[], permuted: T[]): boolean {
  for (let i = 0; i < original.length; i++) {
    if (original[i] === permuted[i]) {
      return false;
    }
  }
  return true;
}

/**
 * Fixes self-assignments in a permutation by swapping with other positions
 * Uses a more robust algorithm that ensures no new self-assignments are created
 */
function fixSelfAssignments<T>(original: T[], permuted: T[]): void {
  const fixedPoints: number[] = [];
  
  // Find all fixed points (self-assignments)
  for (let i = 0; i < original.length; i++) {
    if (original[i] === permuted[i]) {
      fixedPoints.push(i);
    }
  }
  
  // If we have fixed points, swap them in pairs
  // This ensures we don't create new fixed points
  for (let i = 0; i < fixedPoints.length; i += 2) {
    if (i + 1 < fixedPoints.length) {
      // Swap two fixed points
      const idx1 = fixedPoints[i];
      const idx2 = fixedPoints[i + 1];
      [permuted[idx1], permuted[idx2]] = [permuted[idx2], permuted[idx1]];
    } else {
      // If odd number of fixed points, swap the last one with a non-fixed point
      const fixedIdx = fixedPoints[i];
      for (let j = 0; j < permuted.length; j++) {
        if (j !== fixedIdx && original[j] !== permuted[fixedIdx] && original[fixedIdx] !== permuted[j]) {
          [permuted[fixedIdx], permuted[j]] = [permuted[j], permuted[fixedIdx]];
          break;
        }
      }
    }
  }
}

/**
 * Validates that assignments form a proper one-to-one mapping
 */
function validateAssignments(assignments: Assignment[], personIds: string[]): void {
  const giverCounts = new Map<string, number>();
  const receiverCounts = new Map<string, number>();
  
  for (const assignment of assignments) {
    giverCounts.set(assignment.giverId, (giverCounts.get(assignment.giverId) || 0) + 1);
    receiverCounts.set(assignment.receiverId, (receiverCounts.get(assignment.receiverId) || 0) + 1);
  }
  
  for (const personId of personIds) {
    if (giverCounts.get(personId) !== 1) {
      throw new Error(`Invalid assignment: Person gives ${giverCounts.get(personId) || 0} times (should be 1)`);
    }
    if (receiverCounts.get(personId) !== 1) {
      throw new Error(`Invalid assignment: Person receives ${receiverCounts.get(personId) || 0} times (should be 1)`);
    }
  }
}

/**
 * Runs the Secret Santa randomizer to create assignments
 * Ensures each person gives to exactly one person and receives from exactly one person
 * with no self-assignments
 */
export function runRandomizer(people: Person[]): Assignment[] {
  if (people.length < 2) {
    throw new Error('Need at least 2 people to create assignments');
  }

  // Ensure no duplicate names (case-insensitive)
  const nameSet = new Set<string>();
  for (const person of people) {
    const nameKey = person.name.toLowerCase();
    if (nameSet.has(nameKey)) {
      throw new Error(`Duplicate name detected: "${person.name}". Please remove duplicates before randomizing.`);
    }
    nameSet.add(nameKey);
  }

  // Create arrays of person IDs
  const personIds = people.map(p => p.id);
  let receivers = shuffleArray(personIds);
  
  // Keep shuffling until we get a valid derangement (no self-assignments)
  const maxAttempts = 100;
  let attempts = 0;
  
  while (attempts < maxAttempts && !isValidDerangement(personIds, receivers)) {
    receivers = shuffleArray(personIds);
    attempts++;
  }
  
  // If we couldn't find a valid derangement after many attempts, manually fix it
  if (!isValidDerangement(personIds, receivers)) {
    fixSelfAssignments(personIds, receivers);
    
    // Double-check after fixing
    if (!isValidDerangement(personIds, receivers)) {
      throw new Error('Failed to create valid assignments. Please try again.');
    }
  }

  // Create assignments from the derangement
  const assignments: Assignment[] = [];
  const peopleById = new Map(people.map(p => [p.id, p]));
  
  for (let i = 0; i < personIds.length; i++) {
    const giverId = personIds[i];
    const receiverId = receivers[i];
    
    const giver = peopleById.get(giverId);
    const receiver = peopleById.get(receiverId);
    
    if (!giver || !receiver) {
      throw new Error('Invalid person ID in assignment');
    }
    
    assignments.push({
      giverId,
      giverName: giver.name,
      receiverId,
      receiverName: receiver.name,
    });
  }

  // Validate the assignments
  validateAssignments(assignments, personIds);

  return assignments;
}

