'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { SUBSCRIPTION_TYPES } from '@/lib/ai/entitlements';

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const getSubscriptionTypeName = (type: number) => {
    console.log('Subscription type:', type);

    switch (Number(type)) {
      case SUBSCRIPTION_TYPES.REGULAR:
        return 'Regular';
      case SUBSCRIPTION_TYPES.PREMIUM:
        return 'Premium';
      case SUBSCRIPTION_TYPES.ENTERPRISE:
        return 'Enterprise';
      default:
        console.warn('Unknown subscription type:', type);
        return 'Unknown';
    }
  };

  console.log('Session user:', session?.user);

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center px-2">
            <div className="flex flex-row items-center gap-2.5">
              <Link
                href="/"
                onClick={() => {
                  setOpenMobile(false);
                  router.refresh();
                }}
                className="text-lg font-semibold tracking-tight hover:bg-muted/50 rounded-md px-2.5 py-1.5 transition-colors"
              >
                Vespera AI
              </Link>
              {session?.user && session.user.subscriptionType !== undefined && (
                <Link
                  href="/pricing"
                  onClick={() => setOpenMobile(false)}
                  className="text-sm font-medium text-red-500 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                >
                  {getSubscriptionTypeName(
                    Number(session.user.subscriptionType),
                  )}
                </Link>
              )}
            </div>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
