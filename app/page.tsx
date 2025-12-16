'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { AddMode } from '@/types';
import { runRandomizer } from '@/lib/randomizer';
import { usePeople } from '@/hooks/use-people';
import { NameInput } from '@/components/name-input';
import { PeopleList } from '@/components/people-list';
import { AssignmentsList } from '@/components/assignments-list';

export default function Home() {
  const [singleName, setSingleName] = useState('');
  const [multipleNames, setMultipleNames] = useState('');
  const [addMode, setAddMode] = useState<AddMode>('single');
  const { toast } = useToast();
  
  const {
    people,
    assignments,
    addPerson,
    addMultipleNames,
    removePerson,
    setNewAssignments,
    count,
  } = usePeople();

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addPerson(singleName);
    
    if (result.success) {
      setSingleName('');
      toast({
        title: 'Success!',
        description: 'Person added',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to add person',
        variant: 'destructive',
      });
    }
  };

  const handleAddMultipleNames = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addMultipleNames(multipleNames);
    
    if (result.added > 0) {
      setMultipleNames('');
      toast({
        title: 'Success!',
        description: `Added ${result.added} ${result.added === 1 ? 'person' : 'people'}`,
      });
    } else if (result.skipped > 0) {
      toast({
        title: 'Info',
        description: result.errors[0] || 'All names already exist',
      });
      setMultipleNames('');
    } else {
      toast({
        title: 'Error',
        description: result.errors[0] || 'Failed to add names',
        variant: 'destructive',
      });
    }
  };

  const handleRemovePerson = (id: string) => {
    const success = removePerson(id);
    if (success) {
      toast({
        title: 'Success!',
        description: 'Person removed',
      });
    }
  };

  const handleRandomize = () => {
    if (count < 2) {
      toast({
        title: 'Error',
        description: 'Need at least 2 people to randomize',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newAssignments = runRandomizer(people);
      setNewAssignments(newAssignments);
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
            <NameInput
              mode={addMode}
              singleName={singleName}
              multipleNames={multipleNames}
              onModeChange={setAddMode}
              onSingleNameChange={setSingleName}
              onMultipleNamesChange={setMultipleNames}
              onSingleSubmit={handleAddPerson}
              onMultipleSubmit={handleAddMultipleNames}
            />

            <div className="space-y-2">
              <p className="text-sm font-medium">People ({count}):</p>
              <PeopleList people={people} onRemove={handleRemovePerson} />
            </div>

            <Button
              onClick={handleRandomize}
              disabled={count < 2}
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
            <AssignmentsList assignments={assignments} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
