import Link from 'next/link';
import { Home } from 'lucide-react';

const hasBackendServices = Boolean(
  process.env.POSTGRES_URL && process.env.AUTH_SECRET,
);

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (hasBackendServices) {
    const { auth } = await import('@/app/(auth)/auth');
    const { redirect } = await import('next/navigation');
    const session = await auth();

    if (!session?.user) {
      redirect('/login');
    }

    if (!session?.user?.isAdmin) {
      redirect('/');
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-2">
                <Home size={20} />
                <span className="font-semibold">Vespera Mission Control</span>
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
                    href="/admin/tenants"
                    className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Tenants
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
            <div className="text-sm text-muted-foreground">Estate Admin</div>
          </div>
        </div>
      </div>
      <main>{children}</main>
    </div>
  );
}
