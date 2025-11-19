import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const spaces = await prisma.space.findMany({
      where: {
        OR: [
          { userId1: user.userId },
          { userId2: user.userId },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
          },
        },
        user2: {
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

    return NextResponse.json({ spaces });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching spaces:', error);
    
    // Provide more specific error message for database schema issues
    if (error.code === 'P2010' || error.message?.includes('column') || error.message?.includes('does not exist')) {
      return NextResponse.json(
        { error: 'Database schema mismatch. Please run database migrations: npx prisma migrate deploy' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { suttaEnabled = true } = body;

    const space = await prisma.space.create({
      data: {
        name: 'Pending',
        userId1: user.userId,
        suttaEnabled: suttaEnabled,
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    return NextResponse.json({ space });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating space:', error);
    return NextResponse.json(
      { error: 'Failed to create space' },
      { status: 500 }
    );
  }
}
