import type { UserType } from '@/app/(auth)/auth.config';

export interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<string>;
}

// Subscription type IDs
export const SUBSCRIPTION_TYPES = {
  REGULAR: 1,
  PREMIUM: 2,
  ENTERPRISE: 3,
} as const;

export type SubscriptionType =
  (typeof SUBSCRIPTION_TYPES)[keyof typeof SUBSCRIPTION_TYPES];

export const ENTITLEMENTS: Record<SubscriptionType, Entitlements> = {
  [SUBSCRIPTION_TYPES.REGULAR]: {
    maxMessagesPerDay: 200,
    availableChatModelIds: ['chat-model'],
  },
  [SUBSCRIPTION_TYPES.PREMIUM]: {
    maxMessagesPerDay: 1000,
    availableChatModelIds: ['chat-model', 'gpt-3.5', 'chat-model-reasoning'],
  },
  [SUBSCRIPTION_TYPES.ENTERPRISE]: {
    maxMessagesPerDay: -1, // unlimited
    availableChatModelIds: [
      'chat-model',
      'gpt-3.5',
      'gpt-4',
      'chat-model-reasoning',
    ],
  },
};
