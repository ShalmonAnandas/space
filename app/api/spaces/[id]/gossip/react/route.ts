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
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
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
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Get the gossip and verify it's from the partner
    const partnerId = space.userId1 === user.userId ? space.userId2 : space.userId1;
    const { data: gossip } = await supabase
      .from('Gossip')
      .select('*')
      .eq('id', messageId)
      .eq('spaceId', spaceId)
      .eq('authorId', partnerId!)
      .maybeSingle();

    if (!gossip) {
      return NextResponse.json(
        { error: 'Gossip not found or not accessible' },
        { status: 404 }
      );
    }

    // Mark as reacted
    await supabase
      .from('Gossip')
      .update({ reacted: true })
      .eq('id', messageId);

    // Send notification to the author
    const author = space.userId1 === gossip.authorId ? space.user1 : space.user2;
    
    // Fire-and-forget push to avoid blocking the response
    sendNotification(
      author!.id,
      spaceId,
      'gossip_reaction',
      { name: user.username }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error reacting to gossip:', error);
    return NextResponse.json(
      { error: 'Failed to react to gossip' },
      { status: 500 }
    );
  }
}
