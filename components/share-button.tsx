'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShareIcon, CheckCircleFillIcon } from './icons';
import { toast } from 'sonner';
import type { VisibilityType } from './visibility-selector';

interface ShareButtonProps {
  chatId: string;
  visibilityType: VisibilityType;
  className?: string;
}

export function ShareButton({
  chatId,
  visibilityType,
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (visibilityType !== 'public') {
      toast.error('Only public chats can be shared');
      return;
    }

    const chatUrl = `${window.location.origin}/chat/${chatId}`;

    try {
      await navigator.clipboard.writeText(chatUrl);
      setCopied(true);
      toast.success('Chat link copied to clipboard!');

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  // Only show share button for public chats
  if (visibilityType !== 'public') {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={className}
      disabled={copied}
    >
      {copied ? (
        <>
          <CheckCircleFillIcon size={16} />
          Copied!
        </>
      ) : (
        <>
          <ShareIcon size={16} />
          Share
        </>
      )}
    </Button>
  );
}
