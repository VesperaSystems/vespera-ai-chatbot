'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { SUBSCRIPTION_TYPES } from '@/lib/ai/entitlements';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  subscriptionType: number;
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

  const updateUserSubscriptionType = async (
    userId: string,
    subscriptionType: number,
  ) => {
    try {
      console.log('Updating subscription type:', { userId, subscriptionType });
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, subscriptionType }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user subscription type');
      }

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, subscriptionType } : user,
        ),
      );
      toast.success('User subscription type updated successfully');
    } catch (error) {
      console.error('Error updating user subscription type:', error);
      toast.error('Failed to update user subscription type');
    }
  };

  const getSubscriptionTypeName = (type: number) => {
    switch (type) {
      case SUBSCRIPTION_TYPES.REGULAR:
        return 'Regular';
      case SUBSCRIPTION_TYPES.PREMIUM:
        return 'Premium';
      case SUBSCRIPTION_TYPES.ENTERPRISE:
        return 'Enterprise';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">User Management</h2>
        <div className="text-sm text-muted-foreground">
          {users.length} {users.length === 1 ? 'user' : 'users'}
        </div>
      </div>
      <div className="grid gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.email}</p>
              <p className="text-sm text-muted-foreground">
                {user.isAdmin ? 'Admin' : 'Regular User'} •{' '}
                {getSubscriptionTypeName(user.subscriptionType)}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <Select
                  value={user.subscriptionType.toString()}
                  onValueChange={(value) =>
                    updateUserSubscriptionType(user.id, Number(value))
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SUBSCRIPTION_TYPES.REGULAR.toString()}>
                      Regular
                    </SelectItem>
                    <SelectItem value={SUBSCRIPTION_TYPES.PREMIUM.toString()}>
                      Premium
                    </SelectItem>
                    <SelectItem
                      value={SUBSCRIPTION_TYPES.ENTERPRISE.toString()}
                    >
                      Enterprise
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
