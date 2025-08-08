import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { getMessagesByChatId } from '@/lib/db/queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id: chatId } = await params;
    const messages = await getMessagesByChatId({ id: chatId });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
