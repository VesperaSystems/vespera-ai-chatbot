import { auth } from '@/app/(auth)/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, CreditCard, Home } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.isAdmin) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-2">
                <Home size={20} />
                <span className="font-semibold">Vespera AI</span>
              </Link>
              <div className="p-4">
                <nav className="flex space-x-4">
                  <Link
                    href="/admin/users"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Users
                  </Link>
                  <Link
                    href="/admin/subscriptiontypes"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Subscription Types
                  </Link>
                </nav>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Admin Dashboard</div>
          </div>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
