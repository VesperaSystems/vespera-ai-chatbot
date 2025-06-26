import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { subscriptionTypes } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const types = await db
    .select()
    .from(subscriptionTypes)
    .where(eq(subscriptionTypes.isActive, true));
  return NextResponse.json(types);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      price,
      maxMessagesPerDay,
      availableModels,
      description,
      isActive,
    } = body;

    if (
      !name ||
      typeof price !== 'number' ||
      typeof maxMessagesPerDay !== 'number'
    ) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const [newSubscriptionType] = await db
      .insert(subscriptionTypes)
      .values({
        name,
        price,
        maxMessagesPerDay,
        availableModels,
        description,
        isActive: isActive ?? true,
      })
      .returning();

    return NextResponse.json(newSubscriptionType);
  } catch (error) {
    console.error('Error creating subscription type:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
