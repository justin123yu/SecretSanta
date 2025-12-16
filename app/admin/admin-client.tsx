'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { RandomizerConfig } from '@/lib/randomizer';
import { User } from '@/lib/assignments';

interface AdminClientProps {
  config: RandomizerConfig | null;
}

interface Assignment {
  id: number;
  giver_id: number;
  giver_name: string;
  giver_email: string;
  receiver_id: number;
  receiver_name: string;
  receiver_email: string;
  year: number;
  created_at: Date;
}

export default function AdminClient({ config: initialConfig }: AdminClientProps) {
  const [assignmentDate, setAssignmentDate] = useState(
    initialConfig
      ? new Date(initialConfig.assignment_date).toISOString().split('T')[0]
      : ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showAssignments, setShowAssignments] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [resetUrls, setResetUrls] = useState<Record<number, string>>({});
  const [generatingReset, setGeneratingReset] = useState<Record<number, boolean>>({});
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
    loadAssignments();
  }, []);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadAssignments = async () => {
    setIsLoadingAssignments(true);
    try {
      const response = await fetch('/api/admin/assignments');
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  const handleToggleExclude = async (userId: number) => {
    try {
      const response = await fetch('/api/admin/users/toggle-exclude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle exclusion');
      }

      const data = await response.json();
      
      // Update local state
      setUsers(users.map(u => 
        u.id === userId ? { ...u, excluded: data.excluded } : u
      ));

      toast({
        title: 'Success!',
        description: data.excluded 
          ? 'User excluded from randomizer' 
          : 'User included in randomizer',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to toggle exclusion',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateResetToken = async (userId: number) => {
    setGeneratingReset({ ...generatingReset, [userId]: true });
    try {
      const response = await fetch('/api/admin/users/generate-reset-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate reset token');
      }

      const data = await response.json();
      
      // Store the reset URL
      setResetUrls({ ...resetUrls, [userId]: data.resetUrl });

      toast({
        title: 'Success!',
        description: 'Password reset link generated. Copy the URL to send to the user.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate reset token',
        variant: 'destructive',
      });
    } finally {
      setGeneratingReset({ ...generatingReset, [userId]: false });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Reset URL copied to clipboard',
    });
  };

  const handleSetDate = async () => {
    if (!assignmentDate) {
      toast({
        title: 'Error',
        description: 'Please select a date',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/set-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: assignmentDate }),
      });

      if (!response.ok) {
        throw new Error('Failed to set assignment date');
      }

      toast({
        title: 'Success!',
        description: 'Assignment date has been set.',
      });

      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to set date',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunRandomizer = async () => {
    const eligibleCount = users.filter(u => !u.excluded).length;
    if (!confirm(`Are you sure you want to run the randomizer now? This will assign partners to ${eligibleCount} eligible (non-excluded) users.`)) {
      return;
    }

    setIsRunning(true);
    try {
      const response = await fetch('/api/admin/run-randomizer', {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to run randomizer');
      }

      toast({
        title: 'Success!',
        description: 'Randomizer has been run and partners have been assigned.',
      });

      loadAssignments();
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to run randomizer',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Set Assignment Date</CardTitle>
            <CardDescription>
              Choose when the Secret Santa assignments should be revealed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {initialConfig && (
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">Current assignment date:</p>
                <p className="font-semibold">
                  {new Date(initialConfig.assignment_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Status: {initialConfig.is_completed ? 'Completed' : 'Pending'}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="date">Assignment Date</Label>
              <Input
                id="date"
                type="date"
                value={assignmentDate}
                onChange={(e) => setAssignmentDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <Button onClick={handleSetDate} disabled={isSaving} className="w-full">
              {isSaving ? 'Saving...' : 'Set Date'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Run Randomizer</CardTitle>
            <CardDescription>
              Manually trigger the randomizer to assign partners now
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will immediately assign Secret Santa partners to all registered users.
              Use this if you want to run the randomizer before the scheduled date.
            </p>
            <Button
              onClick={handleRunRandomizer}
              disabled={isRunning}
              variant="destructive"
              className="w-full"
            >
              {isRunning ? 'Running...' : 'Run Randomizer Now'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Users</CardTitle>
          <CardDescription>
            Exclude users from the Secret Santa randomizer and manage password resets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <p className="text-muted-foreground">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-muted-foreground">No users found</p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-4 border rounded-md space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.excluded && (
                        <span className="inline-block mt-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                          Excluded
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={user.excluded ? 'default' : 'outline'}
                        onClick={() => handleToggleExclude(user.id)}
                        size="sm"
                      >
                        {user.excluded ? 'Include' : 'Exclude'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleGenerateResetToken(user.id)}
                        size="sm"
                        disabled={generatingReset[user.id]}
                      >
                        {generatingReset[user.id] ? 'Generating...' : 'Reset Password'}
                      </Button>
                    </div>
                  </div>
                  {resetUrls[user.id] && (
                    <div className="p-3 bg-muted rounded-md space-y-2">
                      <p className="text-sm font-medium">Password Reset URL:</p>
                      <div className="flex gap-2">
                        <Input
                          value={resetUrls[user.id]}
                          readOnly
                          className="flex-1 text-xs font-mono"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(resetUrls[user.id])}
                        >
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This link expires in 24 hours. Send this URL to the user to reset their password.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Assignments</CardTitle>
              <CardDescription>
                View all Secret Santa assignments
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setShowAssignments(!showAssignments);
                if (!showAssignments) {
                  loadAssignments();
                }
              }}
            >
              {showAssignments ? 'Hide' : 'Reveal'} Assignments
            </Button>
          </div>
        </CardHeader>
        {showAssignments && (
          <CardContent>
            {isLoadingAssignments ? (
              <p className="text-muted-foreground">Loading assignments...</p>
            ) : assignments.length === 0 ? (
              <p className="text-muted-foreground">
                No assignments have been made yet. Run the randomizer to create assignments.
              </p>
            ) : (
              <div className="space-y-3">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="p-4 border rounded-md bg-muted/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{assignment.giver_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.giver_email}
                        </p>
                      </div>
                      <div className="text-2xl text-muted-foreground">→</div>
                      <div className="text-right">
                        <p className="font-semibold">{assignment.receiver_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.receiver_email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}

