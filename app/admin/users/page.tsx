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
    <div className="space-y-8 px-4 sm:px-6 lg:px-8">
      <div>
        <h2 className="text-2xl font-bold">Users</h2>
        <p className="text-muted-foreground mt-2">
          Manage user permissions and roles
        </p>
      </div>
      <div className="max-w-7xl mx-auto">
        <UserManagement users={users} />
      </div>
    </div>
  );
}
