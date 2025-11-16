import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sendNotification } from '@/lib/push';

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

    // Get unreacted gossip from partner
    const unreactedGossip = await prisma.gossip.findMany({
      where: {
        spaceId,
        authorId: partnerId!,
        reacted: false,
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
        createdAt: 'asc',
      },
    });

    // Mark all as seen (but not reacted)
    if (unreactedGossip.length > 0) {
      await prisma.gossip.updateMany({
        where: {
          id: {
            in: unreactedGossip.map((g: any) => g.id),
          },
        },
        data: {
          seen: true,
        },
      });
    }

    // Transform gossip to match frontend expectations (messages array)
    const transformedMessages = unreactedGossip.map((g: any) => ({
      id: g.id,
      message: g.content,
      postedBy: g.authorId,
      reacted: g.reacted,
      createdAt: g.createdAt,
    }));

    return NextResponse.json({ messages: transformedMessages });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching gossip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gossip' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: spaceId } = await params;
    const body = await request.json();
    const content = body.content || body.message;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
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

    // Create gossip
    const gossip = await prisma.gossip.create({
      data: {
        spaceId,
        authorId: user.userId,
        content: content.trim(),
      },
    });

    // Get partner and send notification
    const partner = space.userId1 === user.userId ? space.user2 : space.user1;
    
    // Fire-and-forget push to avoid blocking the response
    sendNotification(
      partner!.id,
      spaceId,
      'gossip',
      { name: user.username }
    );

    // Transform gossip to match frontend expectations
    const transformedGossip = {
      id: gossip.id,
      message: gossip.content,
      postedBy: gossip.authorId,
      reacted: false,
      createdAt: gossip.createdAt,
    };

    return NextResponse.json({ gossip: transformedGossip });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating gossip:', error);
    return NextResponse.json(
      { error: 'Failed to create gossip' },
      { status: 500 }
    );
  }
}
