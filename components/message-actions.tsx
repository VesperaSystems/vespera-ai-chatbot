import type { Message } from 'ai';
import { useSWRConfig } from 'swr';
import { useCopyToClipboard } from 'usehooks-ts';

import type { Vote } from '@/lib/db/schema';

import { CopyIcon, ThumbDownIcon, ThumbUpIcon } from './icons';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { memo } from 'react';
import equal from 'fast-deep-equal';
import { toast } from 'sonner';

export function PureMessageActions({
  chatId,
  message,
  vote,
  allVotes,
  isLoading,
  isReadonly,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  allVotes: Array<Vote> | undefined;
  isLoading: boolean;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();
  const [_, copyToClipboard] = useCopyToClipboard();

  if (isLoading) return null;
  if (message.role === 'user') return null;

  // Calculate vote counts for this message
  const messageVotes =
    allVotes?.filter((v) => v.messageId === message.id) || [];
  const upvoteCount = messageVotes.filter((v) => v.isUpvoted).length;
  const downvoteCount = messageVotes.filter((v) => !v.isUpvoted).length;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-row gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="py-1 px-2 h-fit text-muted-foreground"
              variant="outline"
              onClick={async () => {
                const textFromParts = message.parts
                  ?.filter((part) => part.type === 'text')
                  .map((part) => part.text)
                  .join('\n')
                  .trim();

                if (!textFromParts) {
                  toast.error("There's no text to copy!");
                  return;
                }

                await copyToClipboard(textFromParts);
                toast.success('Copied to clipboard!');
              }}
            >
              <CopyIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>

        {!isReadonly && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-testid="message-upvote"
                  className={`py-1 px-2 h-fit text-muted-foreground !pointer-events-auto relative ${
                    vote?.isUpvoted
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : ''
                  }`}
                  variant="outline"
                  onClick={async () => {
                    // Immediately update the vote count optimistically
                    mutate(
                      `/api/vote?chatId=${chatId}`,
                      (currentVotes: Array<Vote> | undefined) => {
                        if (!currentVotes) return [];

                        const votesWithoutCurrent = currentVotes.filter(
                          (v) =>
                            !(
                              v.messageId === message.id &&
                              v.userId === vote?.userId
                            ),
                        );

                        return [
                          ...votesWithoutCurrent,
                          {
                            chatId,
                            messageId: message.id,
                            userId: vote?.userId || '',
                            isUpvoted: true,
                          },
                        ];
                      },
                      { revalidate: false },
                    );

                    const upvote = fetch('/api/vote', {
                      method: 'PATCH',
                      body: JSON.stringify({
                        chatId,
                        messageId: message.id,
                        type: 'up',
                      }),
                    });

                    toast.promise(upvote, {
                      loading: 'Upvoting Response...',
                      success: () => {
                        return 'Upvoted!';
                      },
                      error: () => {
                        // Revert the optimistic update on error
                        mutate(
                          `/api/vote?chatId=${chatId}`,
                          (currentVotes: Array<Vote> | undefined) => {
                            if (!currentVotes) return [];

                            const votesWithoutCurrent = currentVotes.filter(
                              (v) =>
                                !(
                                  v.messageId === message.id &&
                                  v.userId === vote?.userId
                                ),
                            );

                            // If there was a previous vote, restore it
                            if (vote) {
                              return [...votesWithoutCurrent, vote];
                            }

                            return votesWithoutCurrent;
                          },
                          { revalidate: false },
                        );
                        return 'Failed to upvote.';
                      },
                    });
                  }}
                >
                  <ThumbUpIcon />
                  {upvoteCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full size-4 flex items-center justify-center">
                      {upvoteCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upvote</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-testid="message-downvote"
                  className={`py-1 px-2 h-fit text-muted-foreground !pointer-events-auto relative ${
                    vote && !vote.isUpvoted
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : ''
                  }`}
                  variant="outline"
                  onClick={async () => {
                    // Immediately update the vote count optimistically
                    mutate(
                      `/api/vote?chatId=${chatId}`,
                      (currentVotes: Array<Vote> | undefined) => {
                        if (!currentVotes) return [];

                        const votesWithoutCurrent = currentVotes.filter(
                          (v) =>
                            !(
                              v.messageId === message.id &&
                              v.userId === vote?.userId
                            ),
                        );

                        return [
                          ...votesWithoutCurrent,
                          {
                            chatId,
                            messageId: message.id,
                            userId: vote?.userId || '',
                            isUpvoted: false,
                          },
                        ];
                      },
                      { revalidate: false },
                    );

                    const downvote = fetch('/api/vote', {
                      method: 'PATCH',
                      body: JSON.stringify({
                        chatId,
                        messageId: message.id,
                        type: 'down',
                      }),
                    });

                    toast.promise(downvote, {
                      loading: 'Downvoting Response...',
                      success: () => {
                        return 'Downvoted!';
                      },
                      error: () => {
                        // Revert the optimistic update on error
                        mutate(
                          `/api/vote?chatId=${chatId}`,
                          (currentVotes: Array<Vote> | undefined) => {
                            if (!currentVotes) return [];

                            const votesWithoutCurrent = currentVotes.filter(
                              (v) =>
                                !(
                                  v.messageId === message.id &&
                                  v.userId === vote?.userId
                                ),
                            );

                            // If there was a previous vote, restore it
                            if (vote) {
                              return [...votesWithoutCurrent, vote];
                            }

                            return votesWithoutCurrent;
                          },
                          { revalidate: false },
                        );
                        return 'Failed to downvote.';
                      },
                    });
                  }}
                >
                  <ThumbDownIcon />
                  {downvoteCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full size-4 flex items-center justify-center">
                      {downvoteCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Downvote</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (!equal(prevProps.vote, nextProps.vote)) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (!equal(prevProps.allVotes, nextProps.allVotes)) return false;
    if (prevProps.isReadonly !== nextProps.isReadonly) return false;

    return true;
  },
);
