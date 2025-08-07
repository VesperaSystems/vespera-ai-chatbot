import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { getDefaultModelForUser } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const id = generateUUID();
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');

  // Use tenant-specific default model if no cookie is set
  const defaultModel =
    modelIdFromCookie?.value || getDefaultModelForUser(session.user.tenantType || 'quant');

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={defaultModel}
        initialVisibilityType="private"
        isReadonly={false}
        session={session}
        autoResume={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
