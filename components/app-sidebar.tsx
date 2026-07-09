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
    switch (Number(type)) {
      case SUBSCRIPTION_TYPES.REGULAR:
        return 'Regular';
      case SUBSCRIPTION_TYPES.PREMIUM:
        return 'Premium';
      case SUBSCRIPTION_TYPES.ENTERPRISE:
        return 'Enterprise';
      default:
        return 'Unknown';
    }
  };

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row items-center justify-between px-2">
            <div className="flex flex-row items-center gap-2.5">
              <Link
                href="/"
                onClick={() => {
                  setOpenMobile(false);
                  router.refresh();
                }}
                className="rounded-md px-2.5 py-1.5 text-lg font-semibold tracking-tight transition-colors hover:bg-muted/50"
              >
                Vespera Mission Control
              </Link>
              {session?.user && session.user.subscriptionType !== undefined && (
                <Link
                  href="/pricing"
                  onClick={() => setOpenMobile(false)}
                  className="rounded-md border border-red-100 bg-red-50 px-2 py-0.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/30 dark:hover:bg-red-950/50"
                >
                  {getSubscriptionTypeName(Number(session.user.subscriptionType))}
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
