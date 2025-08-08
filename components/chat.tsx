'use client';

import type { Attachment, UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useEffect, useState, type ReactNode } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { ReadOnlyBanner } from './read-only-banner';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';
import { toast } from './toast';
import type { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useAutoResume } from '@/hooks/use-auto-resume';

interface ToastProps {
  id: string | number;
  type: 'success' | 'error';
  description: string | ReactNode;
}

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
}) {
  const { mutate } = useSWRConfig();

  // Add state for the selected model
  const [selectedModelId, setSelectedModelId] = useState(initialChatModel);

  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
    experimental_resume,
    data,
  } = useChat({
    id,
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    experimental_prepareRequestBody: (body) => {
      const lastMessage = body.messages.at(-1);
      const requestBody = {
        id,
        message: {
          ...lastMessage,
          experimental_attachments: lastMessage?.experimental_attachments || [],
        },
        selectedChatModel: selectedModelId,
        selectedVisibilityType: visibilityType,
      };

      console.log(
        '🔍 Request body being sent to /api/chat:',
        JSON.stringify(requestBody, null, 2),
      );

      return requestBody;
    },
    onFinish: () => {
      mutate(unstable_serialize(getChatHistoryPaginationKey));

      // Emit custom event to notify message counter to update immediately
      if (session?.user?.id) {
        console.log(
          'Chat: Dispatching message-sent event for user:',
          session.user.id,
        );
        window.dispatchEvent(
          new CustomEvent('message-sent', {
            detail: { userId: session.user.id },
          }),
        );
      } else {
        console.log(
          'Chat: No session user ID available, not dispatching event',
        );
      }
    },
    onError: (error) => {
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.error && errorData.message) {
          toast({
            type: 'error',
            description: `${errorData.error}: ${errorData.message}`,
          });
        } else {
          toast({
            type: 'error',
            description: `${error.message}`,
          });
        }
      } catch {
        toast({
          type: 'error',
          description: `${error.message}`,
        });
      }
    },
  });

  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      append({
        role: 'user',
        content: query,
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `/chat/${id}`);
    }
  }, [query, append, hasAppendedQuery, id]);

  const swrKey = messages.length > 0 ? `/api/vote?chatId=${id}` : null;
  const { data: votes, error: votesError } = useSWR<Array<Vote>>(
    swrKey,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    experimental_resume,
    data,
    setMessages,
  });

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedModelId}
          selectedVisibilityType={initialVisibilityType}
          isReadonly={isReadonly}
          session={session}
          onModelChange={setSelectedModelId}
          attachments={attachments}
        />

        <ReadOnlyBanner
          chatId={id}
          isReadonly={isReadonly}
          isPublic={visibilityType === 'public'}
        />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
          session={session}
        />

        <div className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
              selectedVisibilityType={visibilityType}
              selectedModelId={selectedModelId}
            />
          )}
        </div>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
        selectedModelId={selectedModelId}
      />
    </>
  );
}
