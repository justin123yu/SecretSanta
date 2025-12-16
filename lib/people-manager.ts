import { Person } from '@/types';

/**
 * Manages people using a Map for O(1) duplicate checking (case-insensitive)
 */
export class PeopleManager {
  private peopleMap: Map<string, Person> = new Map();
  private nextId = 1;

  /**
   * Get all people as an array
   */
  getAllPeople(): Person[] {
    return Array.from(this.peopleMap.values());
  }

  /**
   * Get the number of people
   */
  getCount(): number {
    return this.peopleMap.size;
  }

  /**
   * Add a single person
   * Returns true if added, false if duplicate
   */
  addPerson(name: string): { success: boolean; person?: Person; error?: string } {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { success: false, error: 'Name cannot be empty' };
    }

    const nameKey = trimmedName.toLowerCase();
    
    if (this.peopleMap.has(nameKey)) {
      return { success: false, error: 'This name already exists' };
    }

    const person: Person = {
      id: `person-${this.nextId++}`,
      name: trimmedName,
    };

    this.peopleMap.set(nameKey, person);
    return { success: true, person };
  }

  /**
   * Add multiple people from a string (newline or comma separated)
   * Returns the number of people successfully added
   */
  addMultipleNames(namesInput: string): { 
    added: number; 
    skipped: number; 
    newPeople: Person[];
    errors: string[];
  } {
    const names = namesInput
      .split(/[\n,]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (names.length === 0) {
      return { added: 0, skipped: 0, newPeople: [], errors: ['No valid names found'] };
    }

    // Get unique names (case-insensitive) from input
    const uniqueNamesMap = new Map<string, string>();
    for (const name of names) {
      const key = name.toLowerCase();
      if (!uniqueNamesMap.has(key)) {
        uniqueNamesMap.set(key, name);
      }
    }
    const uniqueNames = Array.from(uniqueNamesMap.values());

    // Filter out names that already exist
    const newNames = uniqueNames.filter(n => !this.peopleMap.has(n.toLowerCase()));
    const skipped = uniqueNames.length - newNames.length;

    // Add new people
    const newPeople: Person[] = [];
    for (const name of newNames) {
      const result = this.addPerson(name);
      if (result.success && result.person) {
        newPeople.push(result.person);
      }
    }

    return {
      added: newPeople.length,
      skipped,
      newPeople,
      errors: skipped > 0 ? [`${skipped} name(s) already exist`] : [],
    };
  }

  /**
   * Remove a person by ID
   */
  removePerson(id: string): boolean {
    for (const [key, person] of this.peopleMap.entries()) {
      if (person.id === id) {
        this.peopleMap.delete(key);
        return true;
      }
    }
    return false;
  }

  /**
   * Clear all people
   */
  clear(): void {
    this.peopleMap.clear();
    this.nextId = 1;
  }

  /**
   * Check if a name exists (case-insensitive)
   */
  hasName(name: string): boolean {
    return this.peopleMap.has(name.toLowerCase());
  }
}

