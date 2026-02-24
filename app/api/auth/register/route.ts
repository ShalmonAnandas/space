import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getIronSession } from 'iron-session';
import { supabase } from '@/lib/supabase';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error: insertError } = await supabase
      .from('User')
      .insert({ username, passwordHash })
      .select()
      .single();

    if (insertError || !user) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 }
      );
    }

    // Create session
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    session.userId = user.id;
    session.username = user.username;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
