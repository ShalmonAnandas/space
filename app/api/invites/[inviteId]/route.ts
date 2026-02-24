import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const { inviteId } = await params;

    const { data: invite } = await supabase
      .from('Invite')
      .select('*, space:Space!Invite_spaceId_fkey(*, user1:User!Space_userId1_fkey(username))')
      .eq('id', inviteId)
      .maybeSingle();

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite' }, { status: 404 });
    }

    if (invite.space.userId2) {
      return NextResponse.json(
        { error: 'Space is already full' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      space: {
        id: invite.space.id,
        name: invite.space.name,
        creatorUsername: invite.space.user1.username,
      },
    });
  } catch (error) {
    console.error('Error validating invite:', error);
    return NextResponse.json(
      { error: 'Failed to validate invite' },
      { status: 500 }
    );
  }
}
