import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth';
import { sendNotification } from '@/lib/push';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: spaceId } = await params;

    // Verify user is part of this space
    const { data: space } = await supabase
      .from('Space')
      .select('*')
      .eq('id', spaceId)
      .or(`userId1.eq.${user.userId},userId2.eq.${user.userId}`)
      .maybeSingle();

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    // Get partner's ID
    const partnerId = space.userId1 === user.userId ? space.userId2 : space.userId1;

    // Get unreacted gossip from partner
    const { data: unreactedGossip } = await supabase
      .from('Gossip')
      .select('*, author:User!Gossip_authorId_fkey(id, username)')
      .eq('spaceId', spaceId)
      .eq('authorId', partnerId!)
      .eq('reacted', false)
      .order('createdAt', { ascending: true });

    // Mark all as seen (but not reacted)
    if (unreactedGossip && unreactedGossip.length > 0) {
      await supabase
        .from('Gossip')
        .update({ seen: true })
        .in('id', unreactedGossip.map((g: any) => g.id));
    }

    // Transform gossip to match frontend expectations (messages array)
    const transformedMessages = (unreactedGossip || []).map((g: any) => ({
      id: g.id,
      message: g.content,
      postedBy: g.authorId,
      reacted: g.reacted,
      createdAt: g.createdAt,
    }));

    return NextResponse.json({ messages: transformedMessages });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching gossip:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gossip' },
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
    const isVent = body.isVent === true;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Verify user is part of this space
    const { data: space } = await supabase
      .from('Space')
      .select(`
        *,
        user1:User!Space_userId1_fkey(id, username),
        user2:User!Space_userId2_fkey(id, username)
      `)
      .eq('id', spaceId)
      .or(`userId1.eq.${user.userId},userId2.eq.${user.userId}`)
      .maybeSingle();

    if (!space || !space.userId2) {
      return NextResponse.json({ error: 'Space not found or incomplete' }, { status: 404 });
    }

    // Create gossip
    const { data: gossip, error: createError } = await supabase
      .from('Gossip')
      .insert({
        spaceId,
        authorId: user.userId,
        content: content.trim(),
      })
      .select()
      .single();

    if (createError || !gossip) {
      throw createError || new Error('Failed to create gossip');
    }

    // Get partner and send notification
    const partner = space.userId1 === user.userId ? space.user2 : space.user1;
    
    // Fire-and-forget push to avoid blocking the response
    if (isVent) {
      // For vent messages, send the actual text in the notification
      sendNotification(
        partner!.id,
        spaceId,
        'vent',
        { name: user.username, ventText: content.trim() }
      );
    } else {
      // For regular gossip, send generic notification
      sendNotification(
        partner!.id,
        spaceId,
        'gossip',
        { name: user.username }
      );
    }

    // Transform gossip to match frontend expectations
    const transformedGossip = {
      id: gossip.id,
      message: gossip.content,
      postedBy: gossip.authorId,
      reacted: false,
      createdAt: gossip.createdAt,
    };

    return NextResponse.json({ gossip: transformedGossip });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating gossip:', error);
    return NextResponse.json(
      { error: 'Failed to create gossip' },
      { status: 500 }
    );
  }
}
