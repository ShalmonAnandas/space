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

    // Batch fetch space names
    const spaceIds = [...new Set((notifications || []).map(n => n.spaceId))];
    const { data: spaces } = await supabase
      .from('Space')
      .select('id, name')
      .in('id', spaceIds);
    const spaceMap = new Map((spaces || []).map(s => [s.id, { name: s.name }]));

    const notificationsWithSpace = (notifications || []).map((n) => ({
      ...n,
      space: spaceMap.get(n.spaceId) || { name: '' },
    }));

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
