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

    // Get the most recent notice
    const latestNotice = await prisma.notice.findFirst({
      where: { spaceId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    // Check if user can post
    let canPost = true;
    let reason = '';

    if (latestNotice && latestNotice.authorId === user.userId) {
      // User's own message
      if (!latestNotice.seen) {
        canPost = false;
        reason = 'Your message has not been seen by your partner yet';
      } else {
        // Check 3-hour cooldown
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
        const postTime = new Date(latestNotice.createdAt);
        
        if (postTime > threeHoursAgo) {
          canPost = false;
          const remainingMs = postTime.getTime() + (3 * 60 * 60 * 1000) - Date.now();
          const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
          reason = `You can post again in ${remainingMinutes} minutes`;
        }
      }
    }

    return NextResponse.json({
      notice: latestNotice,
      canPost,
      reason,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching notice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notice' },
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
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Check if user can post (same logic as GET)
    const latestNotice = await prisma.notice.findFirst({
      where: { spaceId },
      orderBy: { createdAt: 'desc' },
    });

    if (latestNotice && latestNotice.authorId === user.userId) {
      if (!latestNotice.seen) {
        return NextResponse.json(
          { error: 'Your previous message has not been seen yet' },
          { status: 400 }
        );
      }

      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const postTime = new Date(latestNotice.createdAt);
      
      if (postTime > threeHoursAgo) {
        return NextResponse.json(
          { error: 'Please wait before posting again (3-hour cooldown)' },
          { status: 400 }
        );
      }
    }

    // Create notice
    const notice = await prisma.notice.create({
      data: {
        spaceId,
        authorId: user.userId,
        content: content.trim(),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({ notice });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating notice:', error);
    return NextResponse.json(
      { error: 'Failed to create notice' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Find user's latest notice
    const latestNotice = await prisma.notice.findFirst({
      where: {
        spaceId,
        authorId: user.userId,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestNotice) {
      return NextResponse.json(
        { error: 'No notice to edit' },
        { status: 404 }
      );
    }

    if (latestNotice.isEdited) {
      return NextResponse.json(
        { error: 'You can only edit a message once' },
        { status: 400 }
      );
    }

    // Update notice
    const updatedNotice = await prisma.notice.update({
      where: { id: latestNotice.id },
      data: {
        content: content.trim(),
        isEdited: true,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({ notice: updatedNotice });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error editing notice:', error);
    return NextResponse.json(
      { error: 'Failed to edit notice' },
      { status: 500 }
    );
  }
}
