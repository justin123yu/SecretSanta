import { AddMode } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface NameInputProps {
  mode: AddMode;
  singleName: string;
  multipleNames: string;
  onModeChange: (mode: AddMode) => void;
  onSingleNameChange: (name: string) => void;
  onMultipleNamesChange: (names: string) => void;
  onSingleSubmit: (e: React.FormEvent) => void;
  onMultipleSubmit: (e: React.FormEvent) => void;
}

export function NameInput({
  mode,
  singleName,
  multipleNames,
  onModeChange,
  onSingleNameChange,
  onMultipleNamesChange,
  onSingleSubmit,
  onMultipleSubmit,
}: NameInputProps) {
  return (
    <>
      <div className="flex gap-2 mb-2">
        <Button
          type="button"
          variant={mode === 'single' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('single')}
        >
          Single
        </Button>
        <Button
          type="button"
          variant={mode === 'multiple' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('multiple')}
        >
          Multiple
        </Button>
      </div>

      {mode === 'single' ? (
        <form onSubmit={onSingleSubmit} className="flex gap-2">
          <Input
            placeholder="Enter name"
            value={singleName}
            onChange={(e) => onSingleNameChange(e.target.value)}
          />
          <Button type="submit">Add</Button>
        </form>
      ) : (
        <form onSubmit={onMultipleSubmit} className="space-y-2">
          <Textarea
            placeholder="Enter names (one per line or comma-separated)"
            value={multipleNames}
            onChange={(e) => onMultipleNamesChange(e.target.value)}
            rows={4}
          />
          <Button type="submit" className="w-full">Add All</Button>
        </form>
      )}
    </>
  );
}

