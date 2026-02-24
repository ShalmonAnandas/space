import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const { data: spaces, error } = await supabase
      .from('Space')
      .select(`
        *,
        user1:User!Space_userId1_fkey(id, username),
        user2:User!Space_userId2_fkey(id, username)
      `)
      .or(`userId1.eq.${user.userId},userId2.eq.${user.userId}`)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ spaces });
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
        suttaEnabled,
      })
      .select(`
        *,
        user1:User!Space_userId1_fkey(id, username)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ space });
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
