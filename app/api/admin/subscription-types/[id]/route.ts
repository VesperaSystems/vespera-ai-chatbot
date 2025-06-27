import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { subscriptionTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const { id: idParam } = await params;

  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const id = Number.parseInt(idParam);
    if (Number.isNaN(id)) {
      return new NextResponse('Invalid ID', { status: 400 });
    }

    const body = await request.json();
    const {
      name,
      price,
      maxMessagesPerDay,
      availableModels,
      description,
      isActive,
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (maxMessagesPerDay !== undefined)
      updateData.maxMessagesPerDay = maxMessagesPerDay;
    if (availableModels !== undefined)
      updateData.availableModels = availableModels;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = new Date();

    const [updatedSubscriptionType] = await db
      .update(subscriptionTypes)
      .set(updateData)
      .where(eq(subscriptionTypes.id, id))
      .returning();

    if (!updatedSubscriptionType) {
      return new NextResponse('Subscription type not found', { status: 404 });
    }

    return NextResponse.json(updatedSubscriptionType);
  } catch (error) {
    console.error('Error updating subscription type:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const { id: idParam } = await params;

  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const id = Number.parseInt(idParam);
    if (Number.isNaN(id)) {
      return new NextResponse('Invalid ID', { status: 400 });
    }

    const [deletedSubscriptionType] = await db
      .delete(subscriptionTypes)
      .where(eq(subscriptionTypes.id, id))
      .returning();

    if (!deletedSubscriptionType) {
      return new NextResponse('Subscription type not found', { status: 404 });
    }

    return NextResponse.json({
      message: 'Subscription type deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting subscription type:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
