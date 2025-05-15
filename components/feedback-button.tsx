'use client';

import { MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';

export function FeedbackButton() {
  return (
    <Link
      href="https://vespera.canny.io/"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground bg-muted/50 hover:bg-muted rounded-md border border-border/50 hover:border-border transition-colors duration-200 ease-in-out shadow-sm"
      aria-label="Provide feedback"
    >
      <MessageSquarePlus className="w-4 h-4" />
      Feedback
    </Link>
  );
}
