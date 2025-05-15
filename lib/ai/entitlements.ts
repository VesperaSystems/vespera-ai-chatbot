import type { UserType } from '@/app/(auth)/auth.config';

export interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<string>;
}

export const ENTITLEMENTS: Record<UserType, Entitlements> = {
  regular: {
    maxMessagesPerDay: 200,
    availableChatModelIds: ['chat-model'],
  },
  premium: {
    maxMessagesPerDay: 1000,
    availableChatModelIds: ['chat-model', 'gpt-3.5', 'chat-model-reasoning'],
  },
  enterprise: {
    maxMessagesPerDay: -1, // unlimited
    availableChatModelIds: [
      'chat-model',
      'gpt-3.5',
      'gpt-4',
      'chat-model-reasoning',
    ],
  },
};
