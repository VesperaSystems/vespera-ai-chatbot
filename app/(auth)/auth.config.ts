import { compare } from 'bcrypt-ts';
import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getUser } from '@/lib/db/queries';
import { DUMMY_PASSWORD } from '@/lib/constants';
import { SUBSCRIPTION_TYPES } from '@/lib/ai/entitlements';

export type SubscriptionType =
  (typeof SUBSCRIPTION_TYPES)[keyof typeof SUBSCRIPTION_TYPES];

type ExtendedUser = {
  id: string;
  email: string;
  subscriptionType: SubscriptionType;
  isAdmin: boolean;
};

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser & DefaultSession['user'];
  }

  interface User extends ExtendedUser {}
}

declare module 'next-auth/jwt' {
  interface JWT extends ExtendedUser {}
}

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdmin = auth?.user?.isAdmin;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');

      if (isOnAdmin) {
        if (isLoggedIn && isAdmin) return true;
        return false;
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl));
      }
      return true;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize({ email, password }: any) {
        if (!email || !password) return null;

        const users = await getUser(email);
        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;
        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);
        if (!passwordsMatch) return null;

        // Ensure we have a valid subscription type
        const subscriptionType = Number(user.subscriptionType);
        // Accept any positive integer as valid subscription type
        // The database will handle validation of actual subscription types
        const validSubscriptionType =
          subscriptionType > 0 ? subscriptionType : SUBSCRIPTION_TYPES.REGULAR;

        return {
          id: user.id,
          email: user.email,
          subscriptionType: validSubscriptionType,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
} satisfies Parameters<typeof NextAuth>[0];
