import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendNotification } from '@/lib/push';

export async function GET(request: NextRequest) {
  try {
    // Verify test secret
    const authHeader = request.headers.get('authorization');
    const testSecret = process.env.CRON_TEST_SECRET;

    if (!testSecret || authHeader !== `Bearer ${testSecret}`) {
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

    const successful = results.filter((r: any) => r.status === 'fulfilled').length;
    const failed = results.filter((r: any) => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      total: users.length,
      message: 'Test cron executed successfully',
    });
  } catch (error) {
    console.error('Test cron job error:', error);
    return NextResponse.json(
      { error: 'Test cron job failed' },
      { status: 500 }
    );
  }
}
