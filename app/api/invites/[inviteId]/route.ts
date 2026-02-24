import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const { inviteId } = await params;

    // Get invite with space info
    const { data: invite } = await supabase
      .from('Invite')
      .select('*')
      .eq('id', inviteId)
      .single();

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite' }, { status: 404 });
    }

    // Get space info
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

    // Get creator username
    const { data: user1 } = await supabase
      .from('User')
      .select('username')
      .eq('id', space.userId1)
      .single();

    return NextResponse.json({
      valid: true,
      space: {
        id: space.id,
        name: space.name,
        creatorUsername: user1?.username,
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
