'use server';

import { type UIMessage, streamText } from 'ai';
import { cookies } from 'next/headers';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
} from '@/lib/db/queries';
import type { VisibilityType } from '@/components/visibility-selector';
import { myProvider } from '@/lib/ai/providers';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  try {
    const titleModel = myProvider.languageModel('title-model');
    const { fullStream } = await streamText({
      model: titleModel,
      system: `\n
      - you will generate a short title based on the first message a user begins a conversation with
      - ensure it is not more than 80 characters long
      - the title should be a summary of the user's message
      - do not use quotes or colons`,
      messages: [
        {
          role: 'user',
          content: JSON.stringify(message),
        },
      ],
    });

    let title = '';
    for await (const delta of fullStream) {
      if (delta.type === 'text-delta') {
        title += delta.textDelta;
      }
    }

    if (!title) {
      throw new Error('Empty title generated');
    }

    return title.trim();
  } catch (error) {
    console.error('Error generating title:', error);
    throw new Error(
      error instanceof Error
        ? `Failed to generate title: ${error.message}`
        : 'Failed to generate title: Unknown error',
    );
  }
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  try {
    const [message] = await getMessageById({ id });

    if (!message) {
      throw new Error(`Message with id ${id} not found`);
    }

    if (!message.chatId) {
      throw new Error(`Message ${id} has no associated chat ID`);
    }

    await deleteMessagesByChatIdAfterTimestamp({
      chatId: message.chatId,
      timestamp: message.createdAt,
    });
  } catch (error) {
    console.error('Error deleting trailing messages:', error);
    throw new Error(
      error instanceof Error
        ? `Failed to delete trailing messages: ${error.message}`
        : 'Failed to delete trailing messages: Unknown error',
    );
  }
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}
