'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/toast';

interface User {
  id: string;
  email: string;
  organizationName?: string;
  tenantType: string;
  organizationDomain?: string;
  subscriptionType: number;
  isAdmin: boolean;
  tenantId?: string;
  tenant?: {
    id: string;
    name: string;
    domain: string | null;
    tenantType: string;
  };
}

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    isAdmin: false,
    subscriptionType: 1,
    tenantId: '',
    tenantType: 'quant',
  });

  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>(
    [],
  );

  useEffect(() => {
    fetchUsers();
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/admin/tenants');
      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants.map((t: any) => ({ id: t.id, name: t.name })));
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users?all=true');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        toast({
          type: 'error',
          description: 'Failed to fetch users',
        });
      }
    } catch (error) {
      toast({
        type: 'error',
        description: 'Error fetching users',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user.id);
    setEditForm({
      isAdmin: user.isAdmin,
      subscriptionType: user.subscriptionType,
      tenantId: user.tenantId || '',
      tenantType: user.tenantType,
    });
  };

  const handleSave = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...editForm,
        }),
      });

      if (response.ok) {
        toast({
          type: 'success',
          description: 'User updated successfully',
        });
        setEditingUser(null);
        fetchUsers();
      } else {
        toast({
          type: 'error',
          description: 'Failed to update user',
        });
      }
    } catch (error) {
      toast({
        type: 'error',
        description: 'Error updating user',
      });
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <p className="text-muted-foreground mb-6">
        Manage all users in the system. This includes individual users and
        organization members.
      </p>

      <div className="grid gap-6">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{user.email}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.isAdmin
                      ? 'bg-white text-red-600 border border-red-200'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  {user.isAdmin ? 'Admin' : 'User'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingUser === user.id ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="isAdmin">Admin Status</Label>
                    <Select
                      value={editForm.isAdmin ? 'true' : 'false'}
                      onValueChange={(value) =>
                        setEditForm({
                          ...editForm,
                          isAdmin: value === 'true',
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="false">User</SelectItem>
                        <SelectItem value="true">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subscriptionType">Subscription Type</Label>
                    <Select
                      value={editForm.subscriptionType.toString()}
                      onValueChange={(value) =>
                        setEditForm({
                          ...editForm,
                          subscriptionType: Number.parseInt(value, 10),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Regular</SelectItem>
                        <SelectItem value="2">Premium</SelectItem>
                        <SelectItem value="3">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tenantId">Tenant</Label>
                    <Select
                      value={editForm.tenantId}
                      onValueChange={(value) =>
                        setEditForm({
                          ...editForm,
                          tenantId: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a tenant" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="tenantType">Tenant Type</Label>
                    <Select
                      value={editForm.tenantType}
                      onValueChange={(value) =>
                        setEditForm({
                          ...editForm,
                          tenantType: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenant type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quant">Quantitative</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleSave(user.id)}>Save</Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <strong>Email:</strong> {user.email}
                  </div>
                  <div>
                    <strong>Admin:</strong> {user.isAdmin ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <strong>Subscription:</strong>{' '}
                    {user.subscriptionType === 1
                      ? 'Regular'
                      : user.subscriptionType === 2
                        ? 'Premium'
                        : 'Enterprise'}
                  </div>
                  <div>
                    <strong>Tenant:</strong>{' '}
                    {user.tenant?.name || 'Not assigned'}
                  </div>
                  <div>
                    <strong>Tenant Type:</strong> {user.tenantType}
                  </div>
                  <Button onClick={() => handleEdit(user)}>Edit</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
