'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
}

export default function TenantsPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    organizationName: '',
    tenantType: 'quant',
    organizationDomain: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
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
      organizationName: user.organizationName || '',
      tenantType: user.tenantType || 'quant',
      organizationDomain: user.organizationDomain || '',
    });
  };

  const handleSave = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
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

  const getTenantTypeColor = (tenantType: string) => {
    switch (tenantType.toLowerCase()) {
      case 'legal':
        return 'bg-blue-100 text-blue-800';
      case 'quant':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Tenant Management</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Tenant Management</h1>

      <div className="grid gap-6">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{user.email}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getTenantTypeColor(user.tenantType)}`}
                >
                  {user.tenantType}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editingUser === user.id ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input
                      id="organizationName"
                      value={editForm.organizationName}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          organizationName: e.target.value,
                        })
                      }
                      placeholder="Enter organization name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tenantType">Tenant Type</Label>
                    <Select
                      value={editForm.tenantType}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, tenantType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quant">Quant</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="organizationDomain">
                      Organization Domain
                    </Label>
                    <Input
                      id="organizationDomain"
                      value={editForm.organizationDomain}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          organizationDomain: e.target.value,
                        })
                      }
                      placeholder="Enter organization domain"
                    />
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
                    <strong>Organization:</strong>{' '}
                    {user.organizationName || 'Not set'}
                  </div>
                  <div>
                    <strong>Domain:</strong>{' '}
                    {user.organizationDomain || 'Not set'}
                  </div>
                  <div>
                    <strong>Subscription:</strong>{' '}
                    {user.subscriptionType === 1
                      ? 'Regular'
                      : user.subscriptionType === 2
                        ? 'Premium'
                        : 'Enterprise'}
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
