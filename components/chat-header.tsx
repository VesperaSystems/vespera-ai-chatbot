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
import { PlusIcon } from '@/components/icons';
import { useSidebar } from '@/components/ui/sidebar';
import { useWindowSize } from 'usehooks-ts';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session,
  onModelChange,
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

  const showGraphButton = mounted && (windowWidth >= 768 || !open);

  return (
    <header className="sticky top-0 flex items-center gap-2 bg-background/92 px-2 py-1.5 backdrop-blur-md md:px-2">
      <SidebarToggle />

      {showGraphButton && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="order-2 ml-auto h-fit px-2 md:order-1 md:ml-0 md:px-2"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
            >
              <PlusIcon size={16} />
              <span className="md:sr-only">Wall Display</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Wall Display</TooltipContent>
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
