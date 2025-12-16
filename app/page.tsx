'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { X } from 'lucide-react';

interface Person {
  id: string;
  name: string;
}

interface Assignment {
  giverId: string;
  giverName: string;
  receiverId: string;
  receiverName: string;
}

function runRandomizer(people: Person[]): Assignment[] {
  if (people.length < 2) {
    throw new Error('Need at least 2 people to create assignments');
  }

  // Create arrays of person IDs
  const personIds = people.map(p => p.id);
  const receivers = [...personIds];
  
  // Fisher-Yates shuffle to randomize the receiver order
  for (let i = receivers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
  }

  // Create a cycle: person at index i gives to person at index (i+1) mod n
  const assignments: Assignment[] = [];
  
  for (let i = 0; i < personIds.length; i++) {
    const giverId = personIds[i];
    let receiverIndex = (i + 1) % receivers.length;
    let receiverId = receivers[receiverIndex];
    
    // If someone would get themselves, find the next available receiver
    let attempts = 0;
    while (giverId === receiverId && attempts < receivers.length) {
      receiverIndex = (receiverIndex + 1) % receivers.length;
      receiverId = receivers[receiverIndex];
      attempts++;
    }
    
    // If we still have a self-assignment, swap with previous
    if (giverId === receiverId && receivers.length > 1) {
      const prevIndex = (i - 1 + receivers.length) % receivers.length;
      [receivers[receiverIndex], receivers[prevIndex]] = [receivers[prevIndex], receivers[receiverIndex]];
      receiverId = receivers[receiverIndex];
    }
    
    const giver = people.find(p => p.id === giverId)!;
    const receiver = people.find(p => p.id === receiverId)!;
    
    assignments.push({
      giverId,
      giverName: giver.name,
      receiverId,
      receiverName: receiver.name,
    });
  }

  // Validate: ensure each person gives and receives exactly once
  const giverCounts = new Map<string, number>();
  const receiverCounts = new Map<string, number>();
  
  for (const assignment of assignments) {
    giverCounts.set(assignment.giverId, (giverCounts.get(assignment.giverId) || 0) + 1);
    receiverCounts.set(assignment.receiverId, (receiverCounts.get(assignment.receiverId) || 0) + 1);
  }
  
  // Verify each person gives and receives exactly once
  for (const personId of personIds) {
    if (giverCounts.get(personId) !== 1) {
      throw new Error(`Invalid assignment: Person gives ${giverCounts.get(personId) || 0} times (should be 1)`);
    }
    if (receiverCounts.get(personId) !== 1) {
      throw new Error(`Invalid assignment: Person receives ${receiverCounts.get(personId) || 0} times (should be 1)`);
    }
  }

  return assignments;
}

export default function Home() {
  const [name, setName] = useState('');
  const [namesInput, setNamesInput] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [nextId, setNextId] = useState(1);
  const [addMode, setAddMode] = useState<'single' | 'multiple'>('single');

  const { toast } = useToast();

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name',
        variant: 'destructive',
      });
      return;
    }

    const newPerson: Person = {
      id: `person-${nextId}`,
      name: name.trim(),
    };

    setPeople([...people, newPerson]);
    setNextId(nextId + 1);
    setName('');
    // Clear assignments when adding a new person
    setAssignments([]);
    toast({
      title: 'Success!',
      description: 'Person added',
    });
  };

  const handleAddMultipleNames = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namesInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter at least one name',
        variant: 'destructive',
      });
      return;
    }

    // Split by newlines or commas, filter out empty strings, and trim
    const names = namesInput
      .split(/[\n,]+/)
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (names.length === 0) {
      toast({
        title: 'Error',
        description: 'Please enter at least one valid name',
        variant: 'destructive',
      });
      return;
    }

    // Filter out duplicate names (case-insensitive)
    const uniqueNames = Array.from(
      new Map(names.map(n => [n.toLowerCase(), n])).values()
    );

    // Filter out names that already exist
    const existingNames = new Set(people.map(p => p.name.toLowerCase()));
    const newNames = uniqueNames.filter(n => !existingNames.has(n.toLowerCase()));

    if (newNames.length === 0) {
      toast({
        title: 'Info',
        description: 'All names already exist',
      });
      setNamesInput('');
      return;
    }

    const newPeople: Person[] = newNames.map(name => ({
      id: `person-${nextId + newNames.indexOf(name)}`,
      name,
    }));

    setPeople([...people, ...newPeople]);
    setNextId(nextId + newNames.length);
    setNamesInput('');
    // Clear assignments when adding new people
    setAssignments([]);
    toast({
      title: 'Success!',
      description: `Added ${newNames.length} ${newNames.length === 1 ? 'person' : 'people'}`,
    });
  };

  const handleRemovePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
    setAssignments([]);
    toast({
      title: 'Success!',
      description: 'Person removed',
    });
  };

  const handleRandomize = () => {
    if (people.length < 2) {
      toast({
        title: 'Error',
        description: 'Need at least 2 people to randomize',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newAssignments = runRandomizer(people);
      setAssignments(newAssignments);
      toast({
        title: 'Success!',
        description: 'Secret Santa assignments have been created!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to randomize',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">🎅 Secret Santa</h1>
        <p className="text-muted-foreground">Add names and randomize assignments</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add People</CardTitle>
            <CardDescription>Enter names to participate in Secret Santa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant={addMode === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAddMode('single')}
              >
                Single
              </Button>
              <Button
                type="button"
                variant={addMode === 'multiple' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAddMode('multiple')}
              >
                Multiple
              </Button>
            </div>

            {addMode === 'single' ? (
              <form onSubmit={handleAddPerson} className="flex gap-2">
                <Input
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Button type="submit">Add</Button>
              </form>
            ) : (
              <form onSubmit={handleAddMultipleNames} className="space-y-2">
                <Textarea
                  placeholder="Enter names (one per line or comma-separated)"
                  value={namesInput}
                  onChange={(e) => setNamesInput(e.target.value)}
                  rows={4}
                />
                <Button type="submit" className="w-full">Add All</Button>
              </form>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">People ({people.length}):</p>
              {people.length === 0 ? (
                <p className="text-sm text-muted-foreground">No people added yet</p>
              ) : (
                <div className="space-y-2">
                  {people.map((person) => (
                    <div
                      key={person.id}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <span>{person.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePerson(person.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleRandomize}
              disabled={people.length < 2}
              className="w-full"
              size="lg"
            >
              Randomize Assignments
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
            <CardDescription>
              {assignments.length > 0
                ? 'Secret Santa pairings'
                : 'Randomize to see assignments'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No assignments yet. Add at least 2 people and click &quot;Randomize Assignments&quot;
              </p>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment, index) => (
                  <div
                    key={assignment.giverId}
                    className="p-4 border rounded-md bg-muted/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{assignment.giverName}</p>
                      </div>
                      <div className="text-2xl text-muted-foreground">→</div>
                      <div className="text-right">
                        <p className="font-semibold">{assignment.receiverName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
