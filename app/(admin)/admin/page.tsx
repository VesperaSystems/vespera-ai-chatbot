import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, CreditCard } from 'lucide-react';

const hasBackendServices = Boolean(
  process.env.POSTGRES_URL && process.env.AUTH_SECRET,
);

export default function AdminDashboardPage() {
  if (!hasBackendServices) {
    return (
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mission-panel max-w-3xl">
          <div className="hud-label">Estate Admin</div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[0.08em] text-[rgba(235,251,255,0.96)]">
            Admin shell is ready.
          </h1>
          <p className="mt-4 text-sm leading-6 text-[rgba(215,251,255,0.64)]">
            Authentication and database services are not configured in this local repo yet, so admin management is in
            staging mode. The route structure is in place and can be activated once secrets are added.
          </p>
          <div className="mt-6 flex gap-3 text-sm text-[rgba(215,251,255,0.82)]">
            <Link href="/">Return to graph</Link>
            <Link href="/config">Open config</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Estate Admin
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage users, subscriptions, tenants, and estate settings.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts, permissions, and subscription types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button className="w-full">Manage Users</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard size={20} />
                Subscription Types
              </CardTitle>
              <CardDescription>
                Configure subscription plans, pricing, and features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/subscriptiontypes">
                <Button className="w-full">Manage Subscriptions</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Tenant Management
              </CardTitle>
              <CardDescription>
                Manage tenant types, organizations, and user assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/tenants">
                <Button className="w-full">Manage Tenants</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
