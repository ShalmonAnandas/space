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

    // Collect all unique user IDs
    const userIds = new Set<string>();
    (spaces || []).forEach((space) => {
      userIds.add(space.userId1);
      if (space.userId2) userIds.add(space.userId2);
    });

    // Batch fetch all users
    const { data: users } = await supabase
      .from('User')
      .select('id, username')
      .in('id', Array.from(userIds));

    const userMap = new Map((users || []).map(u => [u.id, u]));

    const spacesWithUsers = (spaces || []).map((space) => ({
      ...space,
      user1: userMap.get(space.userId1) || null,
      user2: space.userId2 ? userMap.get(space.userId2) || null : null,
    }));

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
