import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendNotification } from '@/lib/push';

export async function GET(request: NextRequest) {
  try {
    // Verify test secret
    const authHeader = request.headers.get('authorization');
    const testSecret = process.env.CRON_TEST_SECRET;

    if (!testSecret || authHeader !== `Bearer ${testSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all spaces (to find users with spaces)
    const { data: spaces } = await supabase
      .from('Space')
      .select('userId1, userId2');

    // Collect unique user IDs
    const userIds = new Set<string>();
    (spaces || []).forEach((s) => {
      userIds.add(s.userId1);
      if (s.userId2) userIds.add(s.userId2);
    });

    // Get user info
    const { data: users } = await supabase
      .from('User')
      .select('id, username')
      .in('id', Array.from(userIds));

    // Send mood prompt to all users
    const results = await Promise.allSettled(
      (users || []).map(async (user: any) => {
        const { data: userSpace } = await supabase
          .from('Space')
          .select('id')
          .or(`userId1.eq.${user.id},userId2.eq.${user.id}`)
          .limit(1)
          .single();

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
      total: (users || []).length,
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
