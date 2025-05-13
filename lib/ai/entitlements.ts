import type { UserType } from '@/app/(auth)/auth';

export interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<string>;
}

export const ENTITLEMENTS: Record<UserType, Entitlements> = {
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: ['chat-model'],
  },
};
