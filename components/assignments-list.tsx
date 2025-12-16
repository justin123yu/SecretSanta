import { Assignment } from '@/types';

interface AssignmentsListProps {
  assignments: Assignment[];
}

export function AssignmentsList({ assignments }: AssignmentsListProps) {
  if (assignments.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No assignments yet. Add at least 2 people and click &quot;Randomize Assignments&quot;
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {assignments.map((assignment) => (
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
  );
}

