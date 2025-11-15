import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Check if space exists and user is userId1 (creator)
    const space = await prisma.space.findUnique({
      where: { id },
      include: { invite: true },
    });

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    if (space.userId1 !== user.userId) {
      return NextResponse.json(
        { error: 'Only the space creator can generate invites' },
        { status: 403 }
      );
    }

    if (space.userId2) {
      return NextResponse.json(
        { error: 'Space is already full' },
        { status: 400 }
      );
    }

    // Delete existing invite if any
    if (space.invite) {
      await prisma.invite.delete({
        where: { id: space.invite.id },
      });
    }

    // Create new invite
    const invite = await prisma.invite.create({
      data: {
        spaceId: id,
        creatorId: user.userId,
      },
    });

    return NextResponse.json({
      inviteId: invite.id,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${invite.id}`,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error generating invite:', error);
    return NextResponse.json(
      { error: 'Failed to generate invite' },
      { status: 500 }
    );
  }
}
