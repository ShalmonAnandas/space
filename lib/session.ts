import { SessionOptions } from 'iron-session';

export interface SessionData {
  userId: string;
  username: string;
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'space-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export const defaultSession: SessionData = {
  userId: '',
  username: '',
  isLoggedIn: false,
};
