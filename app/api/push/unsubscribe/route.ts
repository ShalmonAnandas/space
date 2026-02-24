import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { endpoint } = await request.json();

    // Get all user's subscriptions and find matching endpoint
    const { data: subscriptions } = await supabase
      .from('PushSubscription')
      .select('*')
      .eq('userId', user.userId);

    // Filter by endpoint in the JSON subscription field
    const toDelete = (subscriptions || []).filter(
      (sub: any) => (sub.subscription as any)?.endpoint === endpoint
    );

    if (toDelete.length > 0) {
      await supabase
        .from('PushSubscription')
        .delete()
        .in('id', toDelete.map((s: any) => s.id));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error unsubscribing from push:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
