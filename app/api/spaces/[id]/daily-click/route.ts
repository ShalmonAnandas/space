import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { sendNotification } from '@/lib/push';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: spaceId } = await params;
    const body = await request.json();
    const type = body.type || body.buttonType;

    const validTypes = ['sutta', 'project', 'junior', 'resign'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid click type' },
        { status: 400 }
      );
    }

    // Verify user is part of this space
    const { data: space } = await supabase
      .from('Space')
      .select(`
        *,
        user1:User!Space_userId1_fkey(id, username),
        user2:User!Space_userId2_fkey(id, username)
      `)
      .eq('id', spaceId)
      .or(`userId1.eq.${user.userId},userId2.eq.${user.userId}`)
      .maybeSingle();

    if (!space || !space.userId2) {
      return NextResponse.json({ error: 'Space not found or incomplete' }, { status: 404 });
    }

    // Get partner info
    const partner = space.userId1 === user.userId ? space.user2 : space.user1;

    // Handle Sutta button (always send normal notification)
    if (type === 'sutta') {
      // Send notification to partner
      // Fire-and-forget push to avoid blocking the response
      sendNotification(
        partner!.id,
        spaceId,
        'sutta_normal',
        { name: user.username }
      );

      return NextResponse.json({ 
        success: true
      });
    }

    // Handle Frustration buttons (no daily limit)
    // Log the click
    await supabase.from('DailyClick').insert({
      spaceId,
      userId: user.userId,
      type,
    });

    // Send notification to partner
    // Fire-and-forget push to avoid blocking the response
    sendNotification(
      partner!.id,
      spaceId,
      'frustration',
      { name: user.username, frustration: type as any }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error handling daily click:', error);
    return NextResponse.json(
      { error: 'Failed to process click' },
      { status: 500 }
    );
  }
}
