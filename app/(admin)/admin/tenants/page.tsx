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
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/toast';
import {
  Building2,
  Users,
  ChevronDownIcon,
  ChevronRightIcon,
} from 'lucide-react';

interface TenantUser {
  id: string;
  email: string;
  isAdmin: boolean;
  subscriptionType: number;
  tenantType: string;
}

interface Tenant {
  id: string;
  name: string;
  domain: string | null;
  tenantType: string;
  createdAt: Date;
  updatedAt: Date;
  users: TenantUser[];
}

export default function TenantsPage() {
  const { data: session } = useSession();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTenants, setExpandedTenants] = useState<Set<string>>(
    new Set(),
  );
  const [editingTenant, setEditingTenant] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    tenantType: 'quant',
    domain: '',
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/admin/tenants');
      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants);
      } else {
        toast({
          type: 'error',
          description: 'Failed to fetch tenants',
        });
      }
    } catch (error) {
      toast({
        type: 'error',
        description: 'Error fetching tenants',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTenantExpansion = (tenantKey: string) => {
    const newExpanded = new Set(expandedTenants);
    if (newExpanded.has(tenantKey)) {
      newExpanded.delete(tenantKey);
    } else {
      newExpanded.add(tenantKey);
    }
    setExpandedTenants(newExpanded);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant.name);
    setEditForm({
      name: tenant.name,
      tenantType: tenant.tenantType,
      domain: tenant.domain || '',
    });
  };

  const handleSaveTenant = async (tenant: Tenant) => {
    try {
      const response = await fetch(`/api/admin/tenants`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: tenant.id,
          name: editForm.name,
          domain: editForm.domain,
          tenantType: editForm.tenantType,
        }),
      });

      if (response.ok) {
        toast({
          type: 'success',
          description: 'Tenant updated successfully',
        });
        setEditingTenant(null);
        fetchTenants(); // Refresh the list
      } else {
        toast({
          type: 'error',
          description: 'Failed to update tenant',
        });
      }
    } catch (error) {
      toast({
        type: 'error',
        description: 'Error updating tenant',
      });
    }
  };

  const handleCancel = () => {
    setEditingTenant(null);
  };

  const getTenantTypeColor = (tenantType: string) => {
    switch (tenantType) {
      case 'legal':
        return 'bg-blue-600 text-white';
      case 'quant':
        return 'bg-green-600 text-white';
      case 'finance':
        return 'bg-purple-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getSubscriptionTypeName = (type: number) => {
    switch (type) {
      case 1:
        return 'Regular';
      case 2:
        return 'Premium';
      case 3:
        return 'Enterprise';
      default:
        return 'Unknown';
    }
  };

  const handleMoveUser = async (userId: string, currentTenantId: string) => {
    try {
      // Get all tenants for the dropdown
      const response = await fetch('/api/admin/tenants');
      if (!response.ok) {
        toast({
          type: 'error',
          description: 'Failed to fetch tenants',
        });
        return;
      }

      const data = await response.json();
      const availableTenants = data.tenants.filter(
        (t: Tenant) => t.id !== currentTenantId,
      );

      // For now, we'll move to the first available tenant
      // In a real implementation, you'd show a modal with tenant selection
      if (availableTenants.length > 0) {
        const targetTenant = availableTenants[0];

        const moveResponse = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tenantId: targetTenant.id,
          }),
        });

        if (moveResponse.ok) {
          toast({
            type: 'success',
            description: `User moved to ${targetTenant.name}`,
          });
          fetchTenants(); // Refresh the list
        } else {
          toast({
            type: 'error',
            description: 'Failed to move user',
          });
        }
      } else {
        toast({
          type: 'error',
          description: 'No other tenants available',
        });
      }
    } catch (error) {
      toast({
        type: 'error',
        description: 'Error moving user',
      });
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
      <p className="text-muted-foreground mb-6">
        Manage organization tenants and their associated users.
      </p>

      {tenants.length === 0 ? (
        <div className="text-center py-8">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Tenants Found</h3>
          <p className="text-muted-foreground">
            No organizations with multiple users found. Individual users are not
            shown in tenant management.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {tenants.map((tenant) => {
            const tenantKey = `${tenant.name}-${tenant.domain}-${tenant.tenantType}`;
            const isEditing = editingTenant === tenant.name;
            const isExpanded = expandedTenants.has(tenantKey);

            return (
              <Card key={tenantKey}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5" />
                      <span>{tenant.name}</span>
                      <Badge className={getTenantTypeColor(tenant.tenantType)}>
                        {tenant.tenantType}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="bg-white text-red-600 border-red-200"
                      >
                        {tenant.users.length}{' '}
                        {tenant.users.length === 1 ? 'user' : 'users'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTenantExpansion(tenantKey)}
                      >
                        {isExpanded ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTenant(tenant)}
                      >
                        Edit
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="organizationName">
                          Organization Name
                        </Label>
                        <Input
                          id="organizationName"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              name: e.target.value,
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
                          value={editForm.domain}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              domain: e.target.value,
                            })
                          }
                          placeholder="Enter organization domain"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveTenant(tenant)}>
                          Save
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Domain:</strong> {tenant.domain || 'Not set'}
                        </div>
                        <div>
                          <strong>Type:</strong> {tenant.tenantType}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Users ({tenant.users.length})
                          </h4>
                          <div className="space-y-2">
                            {tenant.users.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-3 bg-muted rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">
                                    {user.email}
                                  </span>
                                  {user.isAdmin && (
                                    <Badge
                                      variant="destructive"
                                      className="bg-red-600 text-white"
                                    >
                                      Admin
                                    </Badge>
                                  )}
                                  <Badge
                                    variant="outline"
                                    className="bg-white text-gray-700 border-gray-300"
                                  >
                                    {getSubscriptionTypeName(
                                      user.subscriptionType,
                                    )}
                                  </Badge>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleMoveUser(user.id, tenant.id)
                                  }
                                >
                                  Move
                                </Button>
                              </div>
                            ))}
                            {tenant.users.length === 0 && (
                              <div className="text-center text-gray-500 py-4">
                                No users in this tenant
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
