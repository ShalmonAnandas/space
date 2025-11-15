import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNotification } from '@/lib/push';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users with spaces
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { spacesAsUser1: { some: {} } },
          { spacesAsUser2: { some: {} } },
        ],
      },
      select: {
        id: true,
        username: true,
      },
    });

    // Send mood prompt to all users
    const results = await Promise.allSettled(
      users.map(async (user: any) => {
        // For mood prompts, we use a generic spaceId or the first space
        const userSpace = await prisma.space.findFirst({
          where: {
            OR: [
              { userId1: user.id },
              { userId2: user.id },
            ],
          },
        });

        if (userSpace) {
          await sendNotification(
            user.id,
            userSpace.id,
            'mood',
            { name: 'System', mood: 'prompt' }
          );
        }
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      total: users.length,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
