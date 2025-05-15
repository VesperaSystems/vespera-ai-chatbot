'use client';

import { startTransition, useMemo, useOptimistic, useState } from 'react';

import { saveChatModelAsCookie } from '@/app/(chat)/actions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chatModels } from '@/lib/ai/models';
import { cn } from '@/lib/utils';

import { CheckCircleFillIcon, ChevronDownIcon, LockIcon } from './icons';
import { ENTITLEMENTS, SUBSCRIPTION_TYPES } from '@/lib/ai/entitlements';
import type { Session } from 'next-auth';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export function ModelSelector({
  session,
  selectedModelId,
  chatId,
  className,
}: {
  session: Session;
  selectedModelId: string;
  chatId: string;
} & React.ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  const [optimisticModelId, setOptimisticModelId] =
    useOptimistic(selectedModelId);

  // Ensure we have a valid subscription type, defaulting to REGULAR if invalid
  const subscriptionType = useMemo(() => {
    const type = session.user.subscriptionType;
    // Check if the type is a valid subscription type
    if (type in ENTITLEMENTS) {
      return type;
    }
    console.warn(`Invalid subscription type: ${type}, defaulting to REGULAR`);
    return SUBSCRIPTION_TYPES.REGULAR;
  }, [session.user.subscriptionType]);

  const { availableChatModelIds } = ENTITLEMENTS[subscriptionType];

  // Filter available models based on user's subscription type
  const availableChatModels = useMemo(() => {
    return chatModels.filter((chatModel) =>
      availableChatModelIds.includes(chatModel.id),
    );
  }, [availableChatModelIds]);

  const selectedChatModel = useMemo(
    () =>
      availableChatModels.find(
        (chatModel) => chatModel.id === optimisticModelId,
      ) || availableChatModels[0], // Fallback to first available model if selected model is not available
    [optimisticModelId, availableChatModels],
  );

  const handleModelChange = async (modelId: string) => {
    if (!availableChatModelIds.includes(modelId)) return;
    setOpen(false);

    startTransition(() => {
      setOptimisticModelId(modelId);
      saveChatModelAsCookie(modelId);

      // Save the model to the database
      fetch(`/api/chat/${chatId}/model`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: modelId }),
      });
    });
  };

  const getUpgradeMessage = (modelId: string) => {
    if (subscriptionType === SUBSCRIPTION_TYPES.REGULAR) {
      if (modelId === 'gpt-4')
        return 'Upgrade to Enterprise plan to access GPT-4';
      if (modelId === 'gpt-3.5' || modelId === 'chat-model-reasoning') {
        return 'Upgrade to Premium plan to access advanced models';
      }
    }
    if (
      subscriptionType === SUBSCRIPTION_TYPES.PREMIUM &&
      modelId === 'gpt-4'
    ) {
      return 'Upgrade to Enterprise plan to access GPT-4';
    }
    return '';
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className={cn(
          'w-fit data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
          className,
        )}
      >
        <Button
          data-testid="model-selector"
          variant="outline"
          className="md:px-2 md:h-[34px]"
        >
          {selectedChatModel?.name}
          <ChevronDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[300px]">
        {chatModels.map((chatModel) => {
          const { id } = chatModel;
          const isAvailable = availableChatModelIds.includes(id);
          const upgradeMessage = getUpgradeMessage(id);

          const menuItem = (
            <DropdownMenuItem
              data-testid={`model-selector-item-${id}`}
              key={id}
              onSelect={() => handleModelChange(id)}
              data-active={id === optimisticModelId}
              className={cn(
                'gap-4 group/item flex flex-row justify-between items-center w-full',
                !isAvailable && 'opacity-50 cursor-not-allowed',
              )}
              disabled={!isAvailable}
            >
              <div className="flex flex-col gap-1 items-start">
                <div className="flex items-center gap-2">
                  {chatModel.name}
                  {!isAvailable && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <LockIcon size={12} />
                        </TooltipTrigger>
                        <TooltipContent>{upgradeMessage}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {chatModel.description}
                </div>
              </div>

              <div className="text-foreground dark:text-foreground opacity-0 group-data-[active=true]/item:opacity-100">
                <CheckCircleFillIcon />
              </div>
            </DropdownMenuItem>
          );

          if (!isAvailable) {
            return (
              <TooltipProvider key={id}>
                <Tooltip>
                  <TooltipTrigger asChild>{menuItem}</TooltipTrigger>
                  <TooltipContent>{upgradeMessage}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return menuItem;
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
