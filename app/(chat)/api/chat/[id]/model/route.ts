import { auth } from '@/app/(auth)/auth';
import { getChatById, updateChatModel } from '@/lib/db/queries';
import { z } from 'zod';

const updateModelSchema = z.object({
  model: z.string(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    return new Response('Error: User not authenticated', { status: 401 });
  }

  try {
    const json = await request.json();
    const { model } = updateModelSchema.parse(json);

    const chat = await getChatById({ id });

    if (!chat) {
      return new Response('Error: Chat not found', { status: 404 });
    }

    if (chat.userId !== session.user.id) {
      return new Response('Error: Access denied to this chat', { status: 403 });
    }

    await updateChatModel({ id, model });

    return new Response('Model updated successfully', { status: 200 });
  } catch (error) {
    console.error('Error updating chat model:', error);
    return new Response(
      `Error updating chat model: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 },
    );
  }
}
