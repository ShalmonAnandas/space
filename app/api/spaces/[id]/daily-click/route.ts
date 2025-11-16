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
    const body = await request.json();
    const type = body.type || body.buttonType;

    const validTypes = ['sutta', 'project', 'junior', 'resign'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid click type' },
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

    // Check clicks in last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentClicks = await prisma.dailyClick.findMany({
      where: {
        spaceId,
        userId: user.userId,
        type,
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
    });

    // Get partner info
    const partner = space.userId1 === user.userId ? space.user2 : space.user1;

    // Handle Sutta button (SOS logic)
    if (type === 'sutta') {
      const notificationType = recentClicks.length === 0 ? 'sutta_normal' : 'sutta_sos';
      
      // Log the click
      await prisma.dailyClick.create({
        data: {
          spaceId,
          userId: user.userId,
          type,
        },
      });

      // Send notification to partner
      // Fire-and-forget push to avoid blocking the response
      sendNotification(
        partner!.id,
        spaceId,
        notificationType,
        { name: user.username }
      );

      return NextResponse.json({ 
        success: true, 
        isSOS: recentClicks.length > 0,
        clickCount: recentClicks.length + 1,
      });
    }

    // Handle Frustration buttons (no daily limit)
    // Log the click
    await prisma.dailyClick.create({
      data: {
        spaceId,
        userId: user.userId,
        type,
      },
    });

    // Send notification to partner
    // Fire-and-forget push to avoid blocking the response
    sendNotification(
      partner!.id,
      spaceId,
      'frustration',
      { name: user.username, frustration: type as any }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error handling daily click:', error);
    return NextResponse.json(
      { error: 'Failed to process click' },
      { status: 500 }
    );
  }
}
