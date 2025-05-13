import type { UserType } from '@/app/(auth)/auth';
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 5,
    availableChatModelIds: ['chat-model'],
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 50,
    availableChatModelIds: ['chat-model', 'gpt-3.5'],
  },

  /*
   * For users with a paid membership
   */
  premium: {
    maxMessagesPerDay: 1000,
    availableChatModelIds: [
      'chat-model',
      'gpt-3.5',
      'gpt-4',
      'chat-model-reasoning',
    ],
  },
};
