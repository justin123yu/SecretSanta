import { Person } from '@/types';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface PeopleListProps {
  people: Person[];
  onRemove: (id: string) => void;
}

export function PeopleList({ people, onRemove }: PeopleListProps) {
  if (people.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No people added yet</p>
    );
  }

  return (
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
            onClick={() => onRemove(person.id)}
            className="h-8 w-8 p-0"
            aria-label={`Remove ${person.name}`}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

