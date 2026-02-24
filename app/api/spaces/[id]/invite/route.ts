import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Check if space exists and user is userId1 (creator)
    const { data: space } = await supabase
      .from('Space')
      .select('*')
      .eq('id', id)
      .single();

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    if (space.userId1 !== user.userId) {
      return NextResponse.json(
        { error: 'Only the space creator can generate invites' },
        { status: 403 }
      );
    }

    if (space.userId2) {
      return NextResponse.json(
        { error: 'Space is already full' },
        { status: 400 }
      );
    }

    // Delete existing invite if any
    const { data: existingInvite } = await supabase
      .from('Invite')
      .select('id')
      .eq('spaceId', id)
      .single();

    if (existingInvite) {
      await supabase.from('Invite').delete().eq('id', existingInvite.id);
    }

    // Create new invite
    const { data: invite, error } = await supabase
      .from('Invite')
      .insert({
        spaceId: id,
        creatorId: user.userId,
      })
      .select()
      .single();

    if (error || !invite) throw error;

    return NextResponse.json({
      inviteId: invite.id,
      inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${invite.id}`,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error generating invite:', error);
    return NextResponse.json(
      { error: 'Failed to generate invite' },
      { status: 500 }
    );
  }
}
