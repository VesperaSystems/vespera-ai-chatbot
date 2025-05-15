import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { userId, isAdmin, subscriptionType } = body;

    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    // Log the update request for debugging
    console.log('Updating user:', { userId, isAdmin, subscriptionType });

    const updateData: any = {};
    if (typeof isAdmin === 'boolean') {
      updateData.isAdmin = isAdmin;
    }
    if (typeof subscriptionType === 'number') {
      updateData.subscriptionType = subscriptionType;
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
