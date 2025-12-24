import type { NextAuthOptions, Session, User as NextAuthUser } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import { getServerSession } from 'next-auth/next';
import { type User, getUserById, getUserByEmail } from '@/lib/db/models/user';
import { logger } from '@/lib/logger';

// Define extended session and user types
export interface ExtendedSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export interface ExtendedUser extends NextAuthUser {
  id: string;
  role?: string;
}

// Define the auth options with callbacks
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
    signOut: '/',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // If user doesn't have an email, we can't proceed
        if (!user.email) {
          logger.error('Sign in failed: User has no email', { user: { id: user.id } });
          return false;
        }

        // Check if user exists in our database
        const existingUser = await getUserByEmail(user.email);

        if (!existingUser) {
          // Here you would typically create a new user in your database
          // For now, we'll just log this event
          logger.info('New user signed in, needs to be created in database', {
            email: user.email,
            name: user.name,
          });
        } else {
          logger.info('Existing user signed in', { userId: existingUser.id });
        }

        return true;
      } catch (error) {
        logger.error('Error during sign in callback', { error });
        return false;
      }
    },
    async jwt({ token, account, user }) {
      try {
        // Initial sign in
        if (account && user) {
          // Add access token and user ID to the token
          token.accessToken = account.access_token;
          token.id = user.id;

          // If we have a user in our database, add their role
          if (user.email) {
            const dbUser = await getUserByEmail(user.email);
            if (dbUser) {
              token.role = dbUser.role || 'user';
            } else {
              token.role = 'user'; // Default role
            }
          }
        }

        return token;
      } catch (error) {
        logger.error('Error in JWT callback', { error });
        // Return the token as is if there's an error
        return token;
      }
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      try {
        // Add user ID and role to the session
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub || token.id,
            role: (token.role as string) || 'user',
          },
        } as ExtendedSession;
      } catch (error) {
        logger.error('Error in session callback', { error });
        // Return the session as is if there's an error
        return session;
      }
    },
  },
  events: {
    async signIn({ user }) {
      logger.info('User signed in', { userId: user.id });
    },
    async signOut({ token }) {
      logger.info('User signed out', { userId: token.sub });
    },
    async createUser({ user }) {
      logger.info('User created', { userId: user.id });
    },
    async updateUser({ user }) {
      logger.info('User updated', { userId: user.id });
    },
    async linkAccount({ user, account, profile }) {
      logger.info('Account linked', { userId: user.id, provider: account.provider });
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Gets the current user's profile from the session
 * @returns The user profile or null if not authenticated
 */
export async function getUserProfile(): Promise<User | null> {
  try {
    const session = (await getServerSession(authOptions)) as ExtendedSession | null;

    if (!session || !session.user || !session.user.id) {
      return null;
    }

    const user = await getUserById(session.user.id);
    return user;
  } catch (error) {
    logger.error('Error getting user profile', { error });
    return null;
  }
}

/**
 * Gets the current session
 * @returns The session or null if not authenticated
 */
export async function getSession(): Promise<ExtendedSession | null> {
  try {
    return (await getServerSession(authOptions)) as ExtendedSession | null;
  } catch (error) {
    logger.error('Error getting session', { error });
    return null;
  }
}

/**
 * Checks if the current user has a specific role
 * @param role The role to check for
 * @returns True if the user has the role, false otherwise
 */
export async function hasRole(role: string): Promise<boolean> {
  try {
    const session = await getSession();
    return !!session?.user?.role && session.user.role === role;
  } catch (error) {
    logger.error('Error checking user role', { error, role });
    return false;
  }
}

/**
 * Checks if the current user has any of the specified roles
 * @param roles Array of roles to check for
 * @returns True if the user has any of the roles, false otherwise
 */
export async function hasAnyRole(roles: string[]): Promise<boolean> {
  try {
    const session = await getSession();
    return !!session?.user?.role && roles.includes(session.user.role);
  } catch (error) {
    logger.error('Error checking user roles', { error, roles });
    return false;
  }
}

/**
 * Validates that a user is authenticated
 * @returns True if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession();
    return !!session?.user;
  } catch (error) {
    logger.error('Error checking authentication', { error });
    return false;
  }
}
