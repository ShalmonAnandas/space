import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const user = await requireAuth();
    const { inviteId } = await params;

    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: {
        space: true,
      },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite' }, { status: 404 });
    }

    if (invite.space.userId2) {
      return NextResponse.json(
        { error: 'Space is already full' },
        { status: 400 }
      );
    }

    if (invite.space.userId1 === user.userId) {
      return NextResponse.json(
        { error: 'You cannot join your own space' },
        { status: 400 }
      );
    }

    // Get user1 to create the space name
    const user1 = await prisma.user.findUnique({
      where: { id: invite.space.userId1 },
      select: { username: true },
    });

    // Update space with userId2, set name to "<user1> & <user2>", and delete invite
    const [updatedSpace] = await prisma.$transaction([
      prisma.space.update({
        where: { id: invite.spaceId },
        data: { 
          userId2: user.userId,
          name: `${user1?.username} & ${user.username}`,
        },
        include: {
          user1: {
            select: { id: true, username: true },
          },
          user2: {
            select: { id: true, username: true },
          },
        },
      }),
      prisma.invite.delete({
        where: { id: inviteId },
      }),
    ]);

    return NextResponse.json({ success: true, space: updatedSpace });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error joining space:', error);
    return NextResponse.json(
      { error: 'Failed to join space' },
      { status: 500 }
    );
  }
}
