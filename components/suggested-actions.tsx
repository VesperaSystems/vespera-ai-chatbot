'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { memo } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from './visibility-selector';
import { PlusIcon } from './icons';

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
  selectedVisibilityType: VisibilityType;
}

function PureSuggestedActions({
  chatId,
  append,
  selectedVisibilityType,
}: SuggestedActionsProps) {
  const suggestedActions = [
    {
      title: `Based on today's macroeconomic news`,
      label: `what sectors are likely to see increased volatility?`,
      action: `Based on today's macroeconomic news, what sectors are likely to see increased volatility?`,
    },
    {
      title: 'Can you help me build a simple ',
      label: `momentum trading strategy using Python`,
      action: `Can you help me build a simple momentum trading strategy using Python`,
    },
    {
      title: 'What are the key differences between ',
      label: `Sharpe ratio and Sortino ratio when evaluating risk?`,
      action: `What are the key differences between Sharpe ratio and Sortino ratio when evaluating risk?`,
    },
    {
      title: 'Which technical indicators are most reliable',
      label: ' for identifying early trend reversals in stocks?',
      action:
        'Which technical indicators are most reliable for identifying early trend reversals in stocks?',
    },
  ];

  return (
    <div
      data-testid="suggested-actions"
      className="hidden lg:grid lg:grid-cols-2 gap-2 w-full"
    >
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, '', `/chat/${chatId}`);

              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 sm:flex-col w-full h-auto justify-start items-start"
          >
            <div className="flex items-center gap-2">
              <PlusIcon size={16} />
              <span className="font-medium">{suggestedAction.title}</span>
            </div>
            <span className="text-muted-foreground">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;

    return true;
  },
);
