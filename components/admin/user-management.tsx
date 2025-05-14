'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

export function UserManagement({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers] = useState(initialUsers);

  const updateUserAdminStatus = async (userId: string, isAdmin: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, isAdmin }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      setUsers(
        users.map((user) => (user.id === userId ? { ...user, isAdmin } : user)),
      );
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">User Management</h2>
      <div className="grid gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.email}</p>
              <p className="text-sm text-muted-foreground">
                {user.isAdmin ? 'Admin' : 'Regular User'}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <Switch
                  checked={user.isAdmin}
                  onCheckedChange={(checked: boolean) =>
                    updateUserAdminStatus(user.id, checked)
                  }
                />
                <span className="text-sm whitespace-nowrap">Admin</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
