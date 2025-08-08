import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { user, tenant } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    // Get users with tenant information
    const users = await db
      .select({
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        subscriptionType: user.subscriptionType,
        tenantType: user.tenantType,
        tenantId: user.tenantId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          domain: tenant.domain,
          tenantType: tenant.tenantType,
          createdAt: tenant.createdAt,
          updatedAt: tenant.updatedAt,
        },
      })
      .from(user)
      .leftJoin(tenant, eq(user.tenantId, tenant.id));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
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
    const {
      userId,
      isAdmin,
      subscriptionType,
      organizationName,
      tenantType,
      organizationDomain,
      tenantId,
    } = body;

    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Log the update request for debugging
    console.log('Updating user:', {
      userId,
      isAdmin,
      subscriptionType,
      tenantId,
    });

    const updateData: any = {};
    if (typeof isAdmin === 'boolean') {
      updateData.isAdmin = isAdmin;
    }
    if (typeof subscriptionType === 'number') {
      updateData.subscriptionType = subscriptionType;
    }
    if (tenantType !== undefined) {
      updateData.tenantType = tenantType || 'quant';
    }
    if (tenantId !== undefined) {
      updateData.tenantId = tenantId || null;
    }

    // Log the update data for debugging
    console.log('Update data:', updateData);

    const [updatedUser] = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, userId))
      .returning();

    // Log the updated user for debugging
    console.log('Updated user:', updatedUser);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
