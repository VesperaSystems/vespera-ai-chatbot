'use client';

import { Button } from '@/components/ui/button';
import { EyeIcon, LockIcon } from './icons';
import Link from 'next/link';

interface ReadOnlyBannerProps {
  chatId: string;
  isReadonly: boolean;
  isPublic: boolean;
}

export function ReadOnlyBanner({
  chatId,
  isReadonly,
  isPublic,
}: ReadOnlyBannerProps) {
  if (!isReadonly || !isPublic) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-950 border-b border-blue-200 dark:border-blue-800 px-4 py-2">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <EyeIcon size={16} />
          <span className="text-sm font-medium">
            You&apos;re viewing this public chat in read-only mode
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900"
          >
            <Link href="/">
              <LockIcon size={14} />
              Start Your Own Chat
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
