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

    const { data: invite } = await supabase
      .from('Invite')
      .select('*, Space!Invite_spaceId_fkey(*)')
      .eq('id', inviteId)
      .maybeSingle();

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite' }, { status: 404 });
    }

    if (invite.Space.userId2) {
      return NextResponse.json(
        { error: 'Space is already full' },
        { status: 400 }
      );
    }

    if (invite.Space.userId1 === user.userId) {
      return NextResponse.json(
        { error: 'You cannot join your own space' },
        { status: 400 }
      );
    }

    // Get user1 to create the space name
    const { data: user1 } = await supabase
      .from('User')
      .select('username')
      .eq('id', invite.Space.userId1)
      .single();

    // Update space with userId2 and set name
    const { data: updatedSpace, error: updateError } = await supabase
      .from('Space')
      .update({
        userId2: user.userId,
        name: `${user1?.username} & ${user.username}`,
      })
      .eq('id', invite.spaceId)
      .select(`
        *,
        user1:User!Space_userId1_fkey(id, username),
        user2:User!Space_userId2_fkey(id, username)
      `)
      .single();

    if (updateError) throw updateError;

    // Delete the invite
    await supabase.from('Invite').delete().eq('id', inviteId);

    return NextResponse.json({ success: true, space: updatedSpace });
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
