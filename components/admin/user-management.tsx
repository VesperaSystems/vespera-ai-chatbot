'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
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
  tenantType: string;
}

interface SubscriptionType {
  id: number;
  name: string;
}

// Available tenant types
const TENANT_TYPES = [
  { value: 'quant', label: 'Quantitative' },
  { value: 'legal', label: 'Legal' },
  { value: 'finance', label: 'Finance' },
];

async function fetchSubscriptionTypes(): Promise<SubscriptionType[]> {
  const res = await fetch('/api/admin/subscription-types');
  if (!res.ok) throw new Error('Failed to fetch subscription types');
  return res.json();
}

export function UserManagement({ users: initialUsers }: { users: User[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [subscriptionTypes, setSubscriptionTypes] = useState<
    SubscriptionType[]
  >([]);

  useEffect(() => {
    fetchSubscriptionTypes()
      .then(setSubscriptionTypes)
      .catch(() => toast.error('Failed to load subscription types'));
  }, []);

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

  const updateUserTenantType = async (userId: string, tenantType: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, tenantType }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user tenant type');
      }

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, tenantType } : user,
        ),
      );
      toast.success('User tenant type updated successfully');
    } catch (error) {
      console.error('Error updating user tenant type:', error);
      toast.error('Failed to update user tenant type');
    }
  };

  const getSubscriptionTypeName = (type: number) => {
    const found = subscriptionTypes.find((t) => t.id === type);
    return found ? found.name : 'Unknown';
  };

  const getTenantTypeLabel = (type: string) => {
    const found = TENANT_TYPES.find((t) => t.value === type);
    return found ? found.label : type;
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
                {getSubscriptionTypeName(user.subscriptionType)} •{' '}
                {getTenantTypeLabel(user.tenantType)}
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2">
                <Select
                  value={user.tenantType}
                  onValueChange={(value) =>
                    updateUserTenantType(user.id, value)
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    {TENANT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                    {subscriptionTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
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
