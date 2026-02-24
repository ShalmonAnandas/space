import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendNotification } from '@/lib/push';

export async function POST(request: NextRequest) {
  try {
    // Verify API secret for security
    const authHeader = request.headers.get('authorization');
    const apiSecret = process.env.API_SECRET;

    if (!apiSecret || authHeader !== `Bearer ${apiSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all spaces to find users with spaces
    const { data: spaces } = await supabase
      .from('Space')
      .select('userId1, userId2');

    const userIds = new Set<string>();
    (spaces || []).forEach((s: any) => {
      userIds.add(s.userId1);
      if (s.userId2) userIds.add(s.userId2);
    });

    // Get user details
    const { data: users } = await supabase
      .from('User')
      .select('id, username')
      .in('id', [...userIds]);

    // Send mood prompt to all users
    const results = await Promise.allSettled(
      (users || []).map(async (user: any) => {
        // For mood prompts, we use a generic spaceId or the first space
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

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      total: users?.length || 0,
    });
  } catch (error) {
    console.error('Mood prompt API error:', error);
    return NextResponse.json(
      { error: 'Mood prompt failed' },
      { status: 500 }
    );
  }
}
