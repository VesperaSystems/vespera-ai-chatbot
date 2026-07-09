import { cookies } from 'next/headers';
import Link from 'next/link';
import { Chat } from '@/components/chat';
import { getDefaultModelForUser } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { redirect } from 'next/navigation';

const hasBackendServices = Boolean(
  process.env.POSTGRES_URL && process.env.AUTH_SECRET && process.env.OPENAI_API_KEY,
);

export default async function Page() {
  if (!hasBackendServices) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="mission-panel max-w-2xl">
          <div className="hud-label">Analysis Console</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[0.08em] text-[rgba(250,250,250,0.96)]">
            Backend wiring comes next.
          </h1>
          <p className="mt-4 text-sm leading-6 text-[rgba(250,250,250,0.64)]">
            The wall display and local config are live. To activate the analysis console, add database,
            auth, and model environment variables for this repo.
          </p>
          <div className="mt-6 flex gap-3 text-sm text-[rgba(250,250,250,0.82)]">
            <Link href="/" className="transition-colors hover:text-white">Return to graph</Link>
            <Link href="/config" className="transition-colors hover:text-white">Open config</Link>
          </div>
        </div>
      </div>
    );
  }

  const { auth } = await import('../../(auth)/auth');
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const id = generateUUID();
  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');
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
