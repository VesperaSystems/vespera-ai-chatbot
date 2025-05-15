'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

import { PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
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

    switch (type) {
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
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
                router.refresh();
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                Vespera AI
              </span>
              {session?.user && (
                <span className="text-sm text-red-500 font-medium">
                  {getSubscriptionTypeName(session.user.subscriptionType)}
                </span>
              )}
            </Link>
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
