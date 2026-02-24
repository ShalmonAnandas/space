import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get query parameter to filter by read status
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    let query = supabase
      .from('NotificationQueue')
      .select('*')
      .eq('userId', user.userId)
      .order('createdAt', { ascending: false })
      .limit(100);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data: notifications } = await query;

    // Fetch space names for notifications
    const notificationsWithSpace = await Promise.all(
      (notifications || []).map(async (n) => {
        const { data: space } = await supabase
          .from('Space')
          .select('name')
          .eq('id', n.spaceId)
          .single();
        return { ...n, space: space || { name: '' } };
      })
    );

    return NextResponse.json({ notifications: notificationsWithSpace });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
