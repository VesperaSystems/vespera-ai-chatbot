import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { tenant, user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get all tenants with their users
    const tenantsWithUsers = await db
      .select({
        id: tenant.id,
        name: tenant.name,
        domain: tenant.domain,
        tenantType: tenant.tenantType,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        users: {
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin,
          subscriptionType: user.subscriptionType,
          tenantType: user.tenantType,
        },
      })
      .from(tenant)
      .leftJoin(user, eq(tenant.id, user.tenantId));

    // Group users by tenant
    const groupedTenants = tenantsWithUsers.reduce(
      (acc, row) => {
        const tenantKey = row.id;

        if (!acc[tenantKey]) {
          acc[tenantKey] = {
            id: row.id,
            name: row.name,
            domain: row.domain,
            tenantType: row.tenantType,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            users: [],
          };
        }

        if (row.users.id) {
          acc[tenantKey].users.push(row.users);
        }

        return acc;
      },
      {} as Record<string, any>,
    );

    const tenants = Object.values(groupedTenants);

    return NextResponse.json({ tenants });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { name, domain, tenantType } = body;

    if (!name) {
      return new NextResponse('Tenant name is required', { status: 400 });
    }

    const [newTenant] = await db
      .insert(tenant)
      .values({
        name,
        domain: domain || null,
        tenantType: tenantType || 'quant',
      })
      .returning();

    return NextResponse.json(newTenant);
  } catch (error) {
    console.error('Error creating tenant:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { tenantId, name, domain, tenantType } = body;

    if (!tenantId) {
      return new NextResponse('Tenant ID is required', { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
    }
    if (domain !== undefined) {
      updateData.domain = domain || null;
    }
    if (tenantType !== undefined) {
      updateData.tenantType = tenantType;
    }

    const [updatedTenant] = await db
      .update(tenant)
      .set(updateData)
      .where(eq(tenant.id, tenantId))
      .returning();

    return NextResponse.json(updatedTenant);
  } catch (error) {
    console.error('Error updating tenant:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
