import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sendNotification } from '@/lib/push';

const VALID_MOODS = ['Happy', 'Frustrated', 'Lost', 'Okay', 'Tired', 'Excited', 'Anxious', 'Calm'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: spaceId } = await params;
    const { mood } = await request.json();

    if (!mood || !VALID_MOODS.includes(mood)) {
      return NextResponse.json(
        { error: 'Invalid mood' },
        { status: 400 }
      );
    }

    // Verify user is part of this space
    const space = await prisma.space.findFirst({
      where: {
        id: spaceId,
        OR: [
          { userId1: user.userId },
          { userId2: user.userId },
        ],
      },
      include: {
        user1: { select: { id: true, username: true } },
        user2: { select: { id: true, username: true } },
      },
    });

    if (!space || !space.userId2) {
      return NextResponse.json({ error: 'Space not found or incomplete' }, { status: 404 });
    }

    // Log mood
    await prisma.mood.create({
      data: {
        spaceId,
        userId: user.userId,
        mood,
      },
    });

    // Get partner and send notification
    const partner = space.userId1 === user.userId ? space.user2 : space.user1;
    
    await sendNotification(
      partner!.id,
      spaceId,
      'mood',
      { name: user.username, mood }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error submitting mood:', error);
    return NextResponse.json(
      { error: 'Failed to submit mood' },
      { status: 500 }
    );
  }
}
