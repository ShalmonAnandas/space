import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from './session';
import { prisma } from './prisma';

export async function getCurrentUser() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    return null;
  }

  // Verify the user in the session still exists in the database
  try {
    const dbUser = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!dbUser) {
      // Stale session (e.g., DB reset) — clear it and treat as unauthenticated
      session.destroy();
      return null;
    }
  } catch (_) {
    // If DB check fails for any reason, fail closed
    return null;
  }

  return {
    userId: session.userId,
    username: session.username,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}
