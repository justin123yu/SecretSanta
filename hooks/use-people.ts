import { useState, useCallback } from 'react';
import { Assignment } from '@/types';
import { PeopleManager } from '@/lib/people-manager';

export function usePeople() {
  const [peopleManager] = useState(() => new PeopleManager());
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const people = peopleManager.getAllPeople();

  const addPerson = useCallback((name: string) => {
    const result = peopleManager.addPerson(name);
    if (result.success) {
      setAssignments([]); // Clear assignments when adding
    }
    return result;
  }, [peopleManager]);

  const addMultipleNames = useCallback((namesInput: string) => {
    const result = peopleManager.addMultipleNames(namesInput);
    if (result.added > 0) {
      setAssignments([]); // Clear assignments when adding
    }
    return result;
  }, [peopleManager]);

  const removePerson = useCallback((id: string) => {
    const success = peopleManager.removePerson(id);
    if (success) {
      setAssignments([]); // Clear assignments when removing
    }
    return success;
  }, [peopleManager]);

  const clearAssignments = useCallback(() => {
    setAssignments([]);
  }, []);

  const setNewAssignments = useCallback((newAssignments: Assignment[]) => {
    setAssignments(newAssignments);
  }, []);

  return {
    people,
    assignments,
    addPerson,
    addMultipleNames,
    removePerson,
    clearAssignments,
    setNewAssignments,
    count: peopleManager.getCount(),
  };
}

