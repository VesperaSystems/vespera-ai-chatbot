import type { User } from '@/lib/db/schema';
import { getAllSubscriptionTypes } from '@/lib/db/queries';

export type SubscriptionType = User['subscriptionType'];

export type Entitlements = {
  maxMessagesPerDay: number;
  availableChatModelIds: string[];
  price: number;
  name: string;
  description?: string;
};

// Subscription type IDs (legacy fallback)
export const SUBSCRIPTION_TYPES = {
  REGULAR: 1,
  PREMIUM: 2,
  ENTERPRISE: 3,
} as const;

// Fetch entitlements from the database
export async function getEntitlements() {
  const types = await getAllSubscriptionTypes();
  const entitlements: Record<number, Entitlements> = {};
  for (const type of types) {
    entitlements[type.id] = {
      maxMessagesPerDay: type.maxMessagesPerDay,
      availableChatModelIds: Array.isArray(type.availableModels)
        ? type.availableModels
        : typeof type.availableModels === 'string'
          ? JSON.parse(type.availableModels)
          : [],
      price: type.price,
      name: type.name,
      description:
        typeof type.description === 'string' ? type.description : undefined,
    };
  }
  return entitlements;
}
