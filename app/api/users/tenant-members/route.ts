import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq, and, ne, like } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user's tenant information
    const currentUser = await db
      .select({
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        tenantType: user.tenantType,
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (currentUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = currentUser[0];

    // Get users within the same tenant
    let tenantMembers: any[] = [];

    if (userData.tenantId) {
      // If user has a tenant, get all users in that tenant
      const rawTenantMembers = await db
        .select({
          id: user.id,
          email: user.email,
          tenantType: user.tenantType,
        })
        .from(user)
        .where(
          and(
            eq(user.tenantId, userData.tenantId),
            ne(user.id, session.user.id), // Exclude current user
          ),
        );

      // Process the results to add the name field
      tenantMembers = rawTenantMembers.map((member) => ({
        ...member,
        name:
          member.email && typeof member.email === 'string'
            ? member.email.split('@')[0]
            : 'Unknown',
      }));
    } else {
      // If user doesn't have a tenant, get users with the same tenant type
      const rawTenantMembers = await db
        .select({
          id: user.id,
          email: user.email,
          tenantType: user.tenantType,
        })
        .from(user)
        .where(
          and(
            eq(user.tenantType, userData.tenantType),
            ne(user.id, session.user.id), // Exclude current user
          ),
        );

      // Process the results to add the name field
      tenantMembers = rawTenantMembers.map((member) => ({
        ...member,
        name:
          member.email && typeof member.email === 'string'
            ? member.email.split('@')[0]
            : 'Unknown',
      }));
    }

    // Also get users with the same domain (if available)
    const userDomain =
      userData.email && typeof userData.email === 'string'
        ? userData.email.split('@')[1]
        : null;
    let domainMembers: any[] = [];

    if (userDomain) {
      const rawDomainMembers = await db
        .select({
          id: user.id,
          email: user.email,
          tenantType: user.tenantType,
        })
        .from(user)
        .where(
          and(
            like(user.email, `%@${userDomain}`), // Same domain
            ne(user.id, session.user.id), // Exclude current user
          ),
        );

      // Process the results to add the name field
      domainMembers = rawDomainMembers.map((member) => ({
        ...member,
        name:
          member.email && typeof member.email === 'string'
            ? member.email.split('@')[0]
            : 'Unknown',
      }));
    }

    // Combine and deduplicate members
    const allMembers = [...tenantMembers, ...domainMembers];
    const uniqueMembers = allMembers.filter(
      (member, index, self) =>
        index === self.findIndex((m) => m.id === member.id),
    );

    return NextResponse.json({
      success: true,
      members: uniqueMembers,
      currentUser: {
        tenantId: userData.tenantId,
        tenantType: userData.tenantType,
        domain:
          userData.email && typeof userData.email === 'string'
            ? userData.email.split('@')[1]
            : null,
      },
    });
  } catch (error) {
    console.error('Error fetching tenant members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenant members' },
      { status: 500 },
    );
  }
}
