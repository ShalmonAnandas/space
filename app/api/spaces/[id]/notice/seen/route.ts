import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sendNotification } from '@/lib/push';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: spaceId } = await params;

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

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Get partner's ID
    const partnerId = space.userId1 === user.userId ? space.userId2 : space.userId1;
    const partner = space.userId1 === user.userId ? space.user2 : space.user1;

    // Mark partner's latest unseen notice as seen
    await prisma.notice.updateMany({
      where: {
        spaceId,
        authorId: partnerId!,
        seen: false,
      },
      data: {
        seen: true,
      },
    });

    // Send notification to the partner (author of the notice)
    sendNotification(
      partnerId!,
      spaceId,
      'notice_seen',
      { name: user.username }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error marking notice as seen:', error);
    return NextResponse.json(
      { error: 'Failed to mark as seen' },
      { status: 500 }
    );
  }
}
