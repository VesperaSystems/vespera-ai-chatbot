'use client';

import { useEffect, useState } from 'react';
import { getUserMessageCount } from '@/lib/db/queries';
import { getEntitlements } from '@/lib/ai/entitlements';
import { useSession } from 'next-auth/react';

export function MessageCounter() {
  const { data: session } = useSession();
  const [count, setCount] = useState<number>(0);
  const [limit, setLimit] = useState<number>(0);
  const [lastMessageCount, setLastMessageCount] = useState<number>(0);

  const fetchCount = async () => {
    if (session?.user?.id) {
      const messageCount = await getUserMessageCount(session.user.id);
      setCount(messageCount);

      // Get the limit based on subscription type from database
      try {
        const entitlementsMap = await getEntitlements();
        const entitlements = entitlementsMap[session.user.subscriptionType];
        const userLimit = entitlements?.maxMessagesPerDay ?? 0;
        setLimit(userLimit);

        // Debug logging
        console.log('Message counter debug:', {
          userId: session.user.id,
          subscriptionType: session.user.subscriptionType,
          messageCount,
          userLimit,
          entitlements: entitlementsMap,
        });
      } catch (error) {
        console.error('Failed to fetch entitlements:', error);
        setLimit(0);
      }
    }
  };

  useEffect(() => {
    void fetchCount();

    // Refresh count every 10 seconds (instead of every minute)
    const interval = setInterval(() => void fetchCount(), 10000);

    // Listen for message sent events to update immediately
    const handleMessageSent = (event: CustomEvent) => {
      console.log('Message sent event received:', event.detail);
      console.log('Current session user ID:', session?.user?.id);

      if (event.detail?.userId === session?.user?.id) {
        console.log(
          'Message sent event matches current user, updating count immediately',
        );
        // Optimistically increment the count
        setCount((prevCount) => {
          console.log('Updating count from', prevCount, 'to', prevCount + 1);
          return prevCount + 1;
        });
        // Don't fetch from server immediately to avoid race condition
        // The periodic refresh (every 10 seconds) will sync with server
      }
    };

    // Add event listener
    window.addEventListener('message-sent', handleMessageSent as EventListener);
    console.log(
      'Message counter: Event listener added for user:',
      session?.user?.id,
    );

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        'message-sent',
        handleMessageSent as EventListener,
      );
      console.log(
        'Message counter: Event listener removed for user:',
        session?.user?.id,
      );
    };
  }, [session?.user?.id, session?.user?.subscriptionType, fetchCount]);

  if (!session?.user?.id || limit === -1) return null;

  const remaining = limit - count;
  const percentageUsed = (count / limit) * 100;

  // Determine color based on percentage used
  const getColorClass = () => {
    if (percentageUsed >= 90) return 'text-red-500';
    if (percentageUsed >= 75) return 'text-orange-500';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div className="text-sm">
      <span className={`${getColorClass()} transition-colors duration-200`}>
        {remaining} messages remaining
      </span>
    </div>
  );
}
