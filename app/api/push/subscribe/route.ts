import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const subscription = await request.json();

    // Save subscription to database (upsert-like: ignore conflict)
    const { error } = await supabase
      .from('PushSubscription')
      .insert({
        userId: user.userId,
        subscription,
      });

    // Handle unique constraint (already subscribed) as success to make this idempotent
    if (error && error.code === '23505') {
      return NextResponse.json({ success: true });
    }

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error subscribing to push:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
