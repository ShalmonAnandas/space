import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
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
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Get partner's ID
    const partnerId = space.userId1 === user.userId ? space.userId2 : space.userId1;

    // Find last gossip where canReRead is true
    const lastGossip = await prisma.gossip.findFirst({
      where: {
        spaceId,
        authorId: partnerId!,
        seen: true,
        canReRead: true,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!lastGossip) {
      return NextResponse.json(
        { error: 'No gossip available to re-read' },
        { status: 404 }
      );
    }

    // Mark as can't re-read anymore
    await prisma.gossip.update({
      where: { id: lastGossip.id },
      data: { canReRead: false },
    });

    return NextResponse.json({ gossip: lastGossip });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error re-reading gossip:', error);
    return NextResponse.json(
      { error: 'Failed to re-read gossip' },
      { status: 500 }
    );
  }
}
