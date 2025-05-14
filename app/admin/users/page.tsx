import { auth } from '@/app/(auth)/auth';
import { getAllUsers } from '@/lib/db/queries';
import { UserManagement } from '@/components/admin/user-management';
import { redirect } from 'next/navigation';

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.isAdmin) {
    redirect('/');
  }

  const users = await getAllUsers();

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage user permissions and roles
          </p>
        </div>
        <div className="rounded-lg border bg-card">
          <div className="p-4 sm:p-6">
            <UserManagement users={users} />
          </div>
        </div>
      </div>
    </div>
  );
}
