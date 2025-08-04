import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;
    const body = await request.json();
    const { organizationName, tenantType, organizationDomain } = body;

    // Validate tenant type
    if (tenantType && !['quant', 'legal'].includes(tenantType)) {
      return NextResponse.json(
        { error: 'Invalid tenant type. Must be "quant" or "legal"' },
        { status: 400 },
      );
    }

    // Update user
    await db
      .update(user)
      .set({
        organizationName: organizationName || null,
        tenantType: tenantType || 'quant',
        organizationDomain: organizationDomain || null,
      })
      .where(eq(user.id, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 },
    );
  }
}
