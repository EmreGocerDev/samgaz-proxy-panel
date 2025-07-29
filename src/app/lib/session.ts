import { getIronSession, type IronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  username?: string;
  password?: string;
  connectionType?: string;
  isLoggedIn?: boolean;
}

export const sessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: 'samrest-atar-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  // Linter hatasını önlemek için kuralı bu satır için devre dışı bırakıyoruz.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await getIronSession<SessionData>(cookies() as any, sessionOptions);
  return session;
}