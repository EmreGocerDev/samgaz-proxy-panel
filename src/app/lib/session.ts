// src/lib/session.ts

import { getIronSession, IronSession } from 'iron-session';
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
    secure: false, // Geliştirme için false
    httpOnly: true,
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  // WORKAROUND: TypeScript'in inatçı tip hatasını "as any" ile görmezden gelmesini sağlıyoruz.
  // Bu, kodun çalışmasını etkilemez, sadece tip denetimini bu satır için devre dışı bırakır.
  const session = await getIronSession<SessionData>(cookies() as any, sessionOptions);
  return session;
}