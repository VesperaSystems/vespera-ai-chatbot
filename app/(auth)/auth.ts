import { compare } from 'bcrypt-ts';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getUser } from '@/lib/db/queries';
import { authConfig } from './auth.config';
import { DUMMY_PASSWORD } from '@/lib/constants';
import { SUBSCRIPTION_TYPES } from '@/lib/ai/entitlements';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
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
        const validSubscriptionType = Object.values(
          SUBSCRIPTION_TYPES,
        ).includes(subscriptionType as 1 | 2 | 3)
          ? subscriptionType
          : SUBSCRIPTION_TYPES.REGULAR;

        return {
          id: user.id,
          email: user.email,
          subscriptionType: validSubscriptionType,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? '';
        token.email = user.email;
        token.subscriptionType = Number(user.subscriptionType);
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && token?.email) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.subscriptionType = Number(token.subscriptionType);
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
});
