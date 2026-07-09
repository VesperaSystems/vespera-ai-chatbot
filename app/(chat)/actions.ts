'use server';

import { type UIMessage, generateText } from 'ai';
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
    const { text } = await generateText({
      model: myProvider.languageModel('title-model'),
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

    if (!text.trim()) {
      throw new Error('Empty title generated');
    }

    return text.trim();
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
    const messages = await getMessageById({ id });

    if (!messages || messages.length === 0) {
      // Message not found - this could happen if the message was already deleted
      // or if there's a race condition. We'll log this but not throw an error.
      console.warn(
        `Message with id ${id} not found - skipping deleteTrailingMessages`,
      );
      return;
    }

    const [message] = messages;

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
