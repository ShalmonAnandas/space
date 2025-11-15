import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const { inviteId } = await params;

    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: {
        space: {
          include: {
            user1: {
              select: {
                username: true,
              },
            },
          },
        },
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

    return NextResponse.json({
      valid: true,
      space: {
        id: invite.space.id,
        name: invite.space.name,
        creatorUsername: invite.space.user1.username,
      },
    });
  } catch (error) {
    console.error('Error validating invite:', error);
    return NextResponse.json(
      { error: 'Failed to validate invite' },
      { status: 500 }
    );
  }
}
