'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import type { SubscriptionType } from '@/lib/db/schema';

interface SubscriptionTypeFormData {
  name: string;
  price: number;
  maxMessagesPerDay: number;
  availableModels: string[];
  description: string;
  isActive: boolean;
}

const DEFAULT_MODELS = [
  'chat-model',
  'gpt-3.5',
  'gpt-4',
  'chat-model-reasoning',
];

export function SubscriptionTypeManagement({
  subscriptionTypes: initialSubscriptionTypes,
}: {
  subscriptionTypes: SubscriptionType[];
}) {
  const [subscriptionTypes, setSubscriptionTypes] = useState(
    initialSubscriptionTypes,
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<SubscriptionTypeFormData>({
    name: '',
    price: 0,
    maxMessagesPerDay: 0,
    availableModels: [],
    description: '',
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      maxMessagesPerDay: 0,
      availableModels: [],
      description: '',
      isActive: true,
    });
    setEditingId(null);
    setIsCreating(false);
  };

  const handleEdit = (subscriptionType: SubscriptionType) => {
    setEditingId(subscriptionType.id);
    setFormData({
      name: subscriptionType.name,
      price: subscriptionType.price,
      maxMessagesPerDay: subscriptionType.maxMessagesPerDay,
      availableModels: Array.isArray(subscriptionType.availableModels)
        ? (subscriptionType.availableModels as string[])
        : typeof subscriptionType.availableModels === 'string'
          ? (JSON.parse(subscriptionType.availableModels) as string[])
          : [],
      description: subscriptionType.description || '',
      isActive: subscriptionType.isActive,
    });
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/subscription-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription type');
      }

      const newSubscriptionType = await response.json();
      setSubscriptionTypes([...subscriptionTypes, newSubscriptionType]);
      resetForm();
      toast.success('Subscription type created successfully');
    } catch (error) {
      console.error('Error creating subscription type:', error);
      toast.error('Failed to create subscription type');
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      const response = await fetch(
        `/api/admin/subscription-types/${editingId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to update subscription type');
      }

      const updatedSubscriptionType = await response.json();
      setSubscriptionTypes(
        subscriptionTypes.map((type) =>
          type.id === editingId ? updatedSubscriptionType : type,
        ),
      );
      resetForm();
      toast.success('Subscription type updated successfully');
    } catch (error) {
      console.error('Error updating subscription type:', error);
      toast.error('Failed to update subscription type');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subscription type?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/subscription-types/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete subscription type');
      }

      setSubscriptionTypes(subscriptionTypes.filter((type) => type.id !== id));
      toast.success('Subscription type deleted successfully');
    } catch (error) {
      console.error('Error deleting subscription type:', error);
      toast.error('Failed to delete subscription type');
    }
  };

  const toggleModel = (model: string) => {
    setFormData((prev) => ({
      ...prev,
      availableModels: prev.availableModels.includes(model)
        ? prev.availableModels.filter((m) => m !== model)
        : [...prev.availableModels, model],
    }));
  };

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  const formatMessages = (count: number) => {
    return count === -1 ? 'Unlimited' : count.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Subscription Types</h2>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Add New
        </Button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {isCreating
                ? 'Create New Subscription Type'
                : 'Edit Subscription Type'}
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X size={16} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Core, Professional, Enterprise"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (in cents)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="15000 for $150.00"
                />
                <p className="text-sm text-muted-foreground">
                  {formData.price > 0
                    ? `Price: ${formatPrice(formData.price)}`
                    : ''}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxMessages">Max Messages Per Day</Label>
                <Input
                  id="maxMessages"
                  type="number"
                  value={formData.maxMessagesPerDay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxMessagesPerDay: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="-1 for unlimited"
                />
                <p className="text-sm text-muted-foreground">
                  Use -1 for unlimited messages
                </p>
              </div>
              <div className="space-y-2">
                <Label>Active Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <span className="text-sm">
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description of this subscription type..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Available Models</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {DEFAULT_MODELS.map((model) => (
                  <div key={model} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={model}
                      checked={formData.availableModels.includes(model)}
                      onChange={() => toggleModel(model)}
                      className="rounded"
                    />
                    <Label htmlFor={model} className="text-sm">
                      {model}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                onClick={isCreating ? handleCreate : handleUpdate}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                {isCreating ? 'Create' : 'Update'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Types List */}
      <div className="grid gap-4">
        {subscriptionTypes.map((subscriptionType) => (
          <Card key={subscriptionType.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{subscriptionType.name}</h3>
                    <Badge
                      variant={
                        subscriptionType.isActive ? 'default' : 'secondary'
                      }
                    >
                      {subscriptionType.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {subscriptionType.description}
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="font-medium">
                      {formatPrice(subscriptionType.price)}/month
                    </span>
                    <span>•</span>
                    <span>
                      {formatMessages(subscriptionType.maxMessagesPerDay)}{' '}
                      messages/day
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(subscriptionType.availableModels)
                      ? (subscriptionType.availableModels as string[])
                      : typeof subscriptionType.availableModels === 'string'
                        ? (JSON.parse(
                            subscriptionType.availableModels,
                          ) as string[])
                        : []
                    ).map((model: string) => (
                      <Badge key={model} variant="outline" className="text-xs">
                        {model}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(subscriptionType)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(subscriptionType.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
