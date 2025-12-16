'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { User } from '@/lib/auth';
import { ReceiverInfo } from '@/lib/assignments';
import Link from 'next/link';

interface DashboardClientProps {
  user: User;
  assignment: ReceiverInfo | null;
  userInfo: string | null;
}

export default function DashboardClient({ user, assignment, userInfo: initialUserInfo }: DashboardClientProps) {
  const [userInfo, setUserInfo] = useState(initialUserInfo || '');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const handleSaveInfo = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ infoText: userInfo }),
      });

      if (!response.ok) {
        throw new Error('Failed to save information');
      }

      toast({
        title: 'Success!',
        description: 'Your information has been saved.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save information',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🎅 Secret Santa Dashboard</h1>
        <div className="flex gap-2">
          {user.is_admin && (
            <Link href="/admin">
              <Button variant="outline">Admin Panel</Button>
            </Link>
          )}
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Partner</CardTitle>
            <CardDescription>
              {assignment
                ? 'Here is your Secret Santa assignment'
                : 'Assignments have not been made yet'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignment ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-lg font-semibold">{assignment.receiver_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{assignment.receiver_email}</p>
                </div>
                {assignment.info_text && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Information from your partner</p>
                    <p className="text-lg whitespace-pre-wrap">{assignment.info_text}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Check back later! Assignments will be revealed on the assigned date.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>
              Share information with your Secret Santa partner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="info">Information for your Secret Santa</Label>
              <Textarea
                id="info"
                placeholder="Share your interests, wishlist, sizes, or any helpful information..."
                value={userInfo}
                onChange={(e) => setUserInfo(e.target.value)}
                rows={8}
              />
            </div>
            <Button onClick={handleSaveInfo} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Information'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

