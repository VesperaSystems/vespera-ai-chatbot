import { compare } from 'bcrypt-ts';
import NextAuth, { type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { getUser } from '@/lib/db/queries';
import { authConfig } from './auth.config';
import { DUMMY_PASSWORD } from '@/lib/constants';
import { SUBSCRIPTION_TYPES } from '@/lib/ai/entitlements';
import { getDefaultSubscriptionTypeForUser } from '@/lib/ai/models';

export const {
  handlers: { GET, POST },
  auth: nextAuthAuth,
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

        // Automatically assign enterprise subscription to legal users
        const subscriptionType = getDefaultSubscriptionTypeForUser(
          user.tenantType,
        );
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
          tenantType: user.tenantType || 'quant', // Read from database, default to 'quant'
          tenant: user.tenant, // Include tenant information
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
        token.tenantType = user.tenantType || 'quant'; // Read from user object
        token.tenant = user.tenant; // Include tenant information
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && token?.email) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.subscriptionType = Number(token.subscriptionType);
        session.user.isAdmin = token.isAdmin;
        session.user.tenantType = token.tenantType || 'quant'; // Read from token
        session.user.tenant = token.tenant; // Include tenant information
      }
      return session;
    },
  },
});

// Temporary production login bypass. Set BYPASS_AUTH=true in Vercel env to
// enable; every auth() call returns this session without a real login.
// Remove this block (and the env var) to restore normal auth.
const BYPASS_SESSION = {
  user: {
    id: '276f1931-4dd8-4422-b853-74bf358fb32d',
    email: 'vespera-admin@mailinator.com',
    subscriptionType: 3,
    isAdmin: true,
    tenantType: 'finance',
    tenant: {
      id: '2435a53e-d3dc-40c0-bb9a-5f5ffe65b5dd',
      name: 'Default Organization',
      domain: 'default',
      tenantType: 'quant',
      createdAt: new Date('2025-08-07T10:49:13.454676Z'),
      updatedAt: new Date('2025-08-07T10:49:13.454676Z'),
    },
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
} as Session;

export async function auth(): Promise<Session | null> {
  if (process.env.BYPASS_AUTH === 'true') {
    return BYPASS_SESSION;
  }
  return nextAuthAuth();
}
