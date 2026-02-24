import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const user = await requireAuth();
    const { inviteId } = await params;

    // Get invite with space
    const { data: invite } = await supabase
      .from('Invite')
      .select('*')
      .eq('id', inviteId)
      .single();

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite' }, { status: 404 });
    }

    const { data: space } = await supabase
      .from('Space')
      .select('*')
      .eq('id', invite.spaceId)
      .single();

    if (!space) {
      return NextResponse.json({ error: 'Invalid invite' }, { status: 404 });
    }

    if (space.userId2) {
      return NextResponse.json(
        { error: 'Space is already full' },
        { status: 400 }
      );
    }

    if (space.userId1 === user.userId) {
      return NextResponse.json(
        { error: 'You cannot join your own space' },
        { status: 400 }
      );
    }

    // Get user1 to create the space name
    const { data: user1 } = await supabase
      .from('User')
      .select('username')
      .eq('id', space.userId1)
      .single();

    // Update space with userId2 and set name
    const { data: updatedSpace, error: updateError } = await supabase
      .from('Space')
      .update({
        userId2: user.userId,
        name: `${user1?.username} & ${user.username}`,
      })
      .eq('id', invite.spaceId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Delete invite
    await supabase.from('Invite').delete().eq('id', inviteId);

    // Fetch user info for the response
    const { data: u1 } = await supabase
      .from('User')
      .select('id, username')
      .eq('id', updatedSpace!.userId1)
      .single();
    const { data: u2 } = await supabase
      .from('User')
      .select('id, username')
      .eq('id', updatedSpace!.userId2!)
      .single();

    return NextResponse.json({
      success: true,
      space: { ...updatedSpace, user1: u1, user2: u2 },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error joining space:', error);
    return NextResponse.json(
      { error: 'Failed to join space' },
      { status: 500 }
    );
  }
}
