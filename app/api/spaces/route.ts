import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { data: spaces, error } = await supabase
      .from('Space')
      .select('*')
      .or(`userId1.eq.${user.userId},userId2.eq.${user.userId}`)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    // Fetch user info for each space
    const spacesWithUsers = await Promise.all(
      (spaces || []).map(async (space) => {
        const { data: user1 } = await supabase
          .from('User')
          .select('id, username')
          .eq('id', space.userId1)
          .single();

        let user2 = null;
        if (space.userId2) {
          const { data } = await supabase
            .from('User')
            .select('id, username')
            .eq('id', space.userId2)
            .single();
          user2 = data;
        }

        return { ...space, user1, user2 };
      })
    );

    return NextResponse.json({ spaces: spacesWithUsers });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching spaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { suttaEnabled = true } = body;

    const { data: space, error } = await supabase
      .from('Space')
      .insert({
        name: 'Pending',
        userId1: user.userId,
        suttaEnabled: suttaEnabled,
      })
      .select()
      .single();

    if (error || !space) throw error;

    // Fetch user1 info
    const { data: user1 } = await supabase
      .from('User')
      .select('id, username')
      .eq('id', space.userId1)
      .single();

    return NextResponse.json({ space: { ...space, user1 } });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating space:', error);
    return NextResponse.json(
      { error: 'Failed to create space' },
      { status: 500 }
    );
  }
}
