import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import { getServerSession } from 'next-auth/next';
import { User } from '@/lib/db/models/user';
import { getUserByEmail, getUserById, createUser } from '@/lib/db/models/user'; // ← add createUser
import { logger } from '@/lib/logger';

// Augment NextAuth types (put this in types/next-auth.d.ts instead of here)

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, profile }) {
      if (!user.email) {
        logger.warn('Sign-in rejected: no email', { name: user.name });
        return false;
      }

      // Optional: restrict to specific domains
      // if (!user.email.endsWith('@allowed.com')) return false;

      return true; // Allow sign-in, we'll handle user creation in jwt()
    },

    async jwt({ token, user, account, profile }) {
      // Initial sign-in only
      if (user && account && profile && user.email) {
        // Find or create user in your database
        let dbUser = await getUserByEmail(user.email);

        if (!dbUser) {
          try {
            const createUserData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
              email: user.email!,
              name: user.name ?? 'Unknown User',
              role: 'user' as const,
            };

            if (user.image) {
              createUserData.profileImageUrl = user.image;
            }

            dbUser = await createUser(createUserData);

            logger.info('New user created via OAuth', {
              userId: dbUser.id,
              email: user.email,
            });
          } catch (error) {
            logger.error('Failed to create user during sign-in', {
              error,
              email: user.email,
            });
            // Optionally: return false in signIn callback instead of failing here
            return token; // continue with empty token (user won't be logged in)
          }
        }

        // Now dbUser is guaranteed to exist
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      if (token?.role) {
        session.user.role = token.role as string;
      }

      return session;
    },
  },
  events: {
    async signIn({ user }) {
      logger.info('User signed in successfully', { email: user.email });
    },
    async signOut({ token }) {
      logger.info('User signed out', { userId: token.id });
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

// Helper functions (unchanged, but now safe)
export async function getUserProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return await getUserById(session.user.id);
}

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function hasRole(requiredRole: string) {
  const session = await getSession();
  return session?.user?.role === requiredRole;
}

export async function hasAnyRole(roles: string[]) {
  const session = await getSession();
  return session?.user?.role ? roles.includes(session.user.role) : false;
}

export async function isAuthenticated() {
  const session = await getSession();
  return !!session?.user;
}
