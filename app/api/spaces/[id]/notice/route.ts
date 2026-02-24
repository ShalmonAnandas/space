import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: spaceId } = await params;
    const { searchParams } = new URL(request.url);
    const history = searchParams.get('history') === 'true';

    // Verify user is part of this space
    const { data: space } = await supabase
      .from('Space')
      .select('*')
      .eq('id', spaceId)
      .or(`userId1.eq.${user.userId},userId2.eq.${user.userId}`)
      .single();

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    if (history) {
      // Fetch last 5 notices (excluding the most recent one)
      const { data: historicalNotices } = await supabase
        .from('Notice')
        .select('*')
        .eq('spaceId', spaceId)
        .order('createdAt', { ascending: false })
        .range(1, 5);

      // Fetch author info for each notice
      const transformedNotices = await Promise.all(
        (historicalNotices || []).map(async (notice) => {
          const { data: author } = await supabase
            .from('User')
            .select('id, username')
            .eq('id', notice.authorId)
            .single();

          return {
            id: notice.id,
            message: notice.content,
            postedBy: notice.authorId,
            postedByUsername: author?.username,
            seenAt: notice.seen ? notice.createdAt : null,
            editedAt: notice.isEdited ? notice.createdAt : null,
            createdAt: notice.createdAt,
          };
        })
      );

      return NextResponse.json({ notices: transformedNotices });
    }

    // Get the most recent notice
    const { data: latestNotice } = await supabase
      .from('Notice')
      .select('*')
      .eq('spaceId', spaceId)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    // Check if user can post
    let canPost = true;
    let reason = '';

    if (latestNotice && latestNotice.authorId === user.userId) {
      // User's own message
      if (!latestNotice.seen) {
        canPost = false;
        reason = 'Your message has not been seen by your them yet';
      } else {
        // Check 3-hour cooldown
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
        const postTime = new Date(latestNotice.createdAt);
        
        if (postTime > threeHoursAgo) {
          canPost = false;
          const remainingMs = postTime.getTime() + (3 * 60 * 60 * 1000) - Date.now();
          const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
          reason = `You can post again in ${remainingMinutes} minutes`;
        }
      }
    }

    // Transform notice to match frontend expectations
    const transformedNotice = latestNotice ? {
      id: latestNotice.id,
      message: latestNotice.content,
      postedBy: latestNotice.authorId,
      seenAt: latestNotice.seen ? latestNotice.createdAt : null,
      editedAt: latestNotice.isEdited ? latestNotice.createdAt : null,
      canEditUntil: null,
      createdAt: latestNotice.createdAt,
    } : null;

    return NextResponse.json({
      notice: transformedNotice,
      canPost,
      reason,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching notice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notice' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: spaceId } = await params;
    const body = await request.json();
    const content = body.content || body.message;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Verify user is part of this space
    const { data: space } = await supabase
      .from('Space')
      .select('*')
      .eq('id', spaceId)
      .or(`userId1.eq.${user.userId},userId2.eq.${user.userId}`)
      .single();

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Check if user can post (same logic as GET)
    const { data: latestNotice } = await supabase
      .from('Notice')
      .select('*')
      .eq('spaceId', spaceId)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (latestNotice && latestNotice.authorId === user.userId) {
      if (!latestNotice.seen) {
        return NextResponse.json(
          { error: 'Your previous message has not been seen yet' },
          { status: 400 }
        );
      }

      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const postTime = new Date(latestNotice.createdAt);
      
      if (postTime > threeHoursAgo) {
        return NextResponse.json(
          { error: 'Please wait before posting again (3-hour cooldown)' },
          { status: 400 }
        );
      }
    }

    // Create notice
    const { data: notice, error } = await supabase
      .from('Notice')
      .insert({
        spaceId,
        authorId: user.userId,
        content: content.trim(),
      })
      .select()
      .single();

    if (error || !notice) throw error;

    // Transform notice to match frontend expectations
    const transformedNotice = {
      id: notice.id,
      message: notice.content,
      postedBy: notice.authorId,
      seenAt: notice.seen ? notice.createdAt : null,
      editedAt: notice.isEdited ? notice.createdAt : null,
      canEditUntil: null,
      createdAt: notice.createdAt,
    };

    return NextResponse.json({ notice: transformedNotice });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating notice:', error);
    return NextResponse.json(
      { error: 'Failed to create notice' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: spaceId } = await params;
    const body = await request.json();
    const content = body.content || body.message;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Find user's latest notice
    const { data: latestNotice } = await supabase
      .from('Notice')
      .select('*')
      .eq('spaceId', spaceId)
      .eq('authorId', user.userId)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (!latestNotice) {
      return NextResponse.json(
        { error: 'No notice to edit' },
        { status: 404 }
      );
    }

    if (latestNotice.isEdited) {
      return NextResponse.json(
        { error: 'You can only edit a message once' },
        { status: 400 }
      );
    }

    // Update notice
    const { data: updatedNotice, error } = await supabase
      .from('Notice')
      .update({
        content: content.trim(),
        isEdited: true,
      })
      .eq('id', latestNotice.id)
      .select()
      .single();

    if (error || !updatedNotice) throw error;

    // Transform notice to match frontend expectations
    const transformedNotice = {
      id: updatedNotice.id,
      message: updatedNotice.content,
      postedBy: updatedNotice.authorId,
      seenAt: updatedNotice.seen ? updatedNotice.createdAt : null,
      editedAt: updatedNotice.isEdited ? updatedNotice.createdAt : null,
      canEditUntil: null,
      createdAt: updatedNotice.createdAt,
    };

    return NextResponse.json({ notice: transformedNotice });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error editing notice:', error);
    return NextResponse.json(
      { error: 'Failed to edit notice' },
      { status: 500 }
    );
  }
}
