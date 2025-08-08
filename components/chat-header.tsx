'use client';
import type { Attachment } from 'ai';
import type { Session } from 'next-auth';
import { memo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { ModelSelector } from '@/components/model-selector';
import {
  VisibilitySelector,
  type VisibilityType,
} from '@/components/visibility-selector';
import { MessageCounter } from '@/components/message-counter';
import { ShareButton } from '@/components/share-button';
import { FeedbackButton } from '@/components/feedback-button';
import { PlusIcon, FileIcon } from '@/components/icons';
import { useSidebar } from '@/components/ui/sidebar';
import { useWindowSize } from 'usehooks-ts';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session,
  onModelChange,
  attachments = [],
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  onModelChange?: (modelId: string) => void;
  attachments?: Array<Attachment>;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const { width: windowWidth } = useWindowSize();

  useEffect(() => {
    setMounted(true);
  }, []);

  const showNewChatButton = mounted && (windowWidth >= 768 || !open);
  const isLegalTenant = (session as any)?.user?.tenantType === 'legal';

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />

      {showNewChatButton && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <PlusIcon size={16} />
              <span className="md:sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      )}

      {!isReadonly && (
        <ModelSelector
          session={session}
          selectedModelId={selectedModelId}
          chatId={chatId}
          className="order-1 md:order-2"
          onModelChange={onModelChange}
        />
      )}

      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-3"
        />
      )}

      {!isReadonly && isLegalTenant && (
        <Button
          variant="outline"
          className="hidden md:flex order-1 md:order-4 md:px-2 md:h-[34px]"
          onClick={() => router.push('/legal-analysis-editor')}
        >
          <FileIcon />
          Legal
        </Button>
      )}

      {!isReadonly && (
        <div className="order-1 md:order-5">
          <MessageCounter />
        </div>
      )}

      <div className="order-1 md:order-6">
        <ShareButton
          chatId={chatId}
          visibilityType={selectedVisibilityType}
          className="hidden md:flex"
        />
      </div>

      {!isReadonly && (
        <div className="order-1 md:order-7">
          <FeedbackButton />
        </div>
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
