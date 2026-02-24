import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    // Check if user is part of this space
    const { data: space } = await supabase
      .from('Space')
      .select('*')
      .eq('id', id)
      .single();

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    if (space.userId1 !== user.userId && space.userId2 !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the space (CASCADE will handle related records)
    await supabase.from('Space').delete().eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting space:', error);
    return NextResponse.json(
      { error: 'Failed to delete space' },
      { status: 500 }
    );
  }
}
