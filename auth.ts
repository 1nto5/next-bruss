import { dbc } from '@/lib/mongo';

import NextAuth, { User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
const LdapClient = require('ldapjs-client');

// Helper function to fetch the latest roles for a user
async function fetchLatestUserRoles(email: string) {
  try {
    const usersCollection = await dbc('users');
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    return user ? user.roles : ['user'];
  } catch (error) {
    console.error('Error fetching latest user roles:', error);
    throw new Error('Failed to refresh user roles');
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };
        const ldapClient = new LdapClient({
          url: process.env.LDAP,
        });

        try {
          await ldapClient.bind(process.env.LDAP_DN, process.env.LDAP_PASS);
        } catch (error) {
          throw new Error('authorize ldap admin error');
        }

        try {
          const options = {
            filter: `(mail=${email})`,
            scope: 'sub',
            attributes: ['dn'],
          };
          const searchResults = await ldapClient.search(
            process.env.LDAP_BASE_DN,
            options,
          );
          if (searchResults.length === 0) {
            return null;
          } else {
            const userDn = searchResults[0].dn;
            try {
              await ldapClient.bind(userDn, password);
            } catch (error) {
              await ldapClient.unbind();
              return null;
            }

            try {
              const usersCollection = await dbc('users');
              let user;

              try {
                user = await usersCollection.findOne({
                  email: email.toLowerCase(),
                });
              } catch (error) {
                await ldapClient.unbind();
                throw new Error('authorize database error: findOne failed');
              }

              if (!user) {
                try {
                  await usersCollection.insertOne({
                    email: email.toLowerCase(),
                    roles: ['user'],
                    firstLogin: new Date(),
                    rolesLastRefreshed: new Date(),
                  });
                } catch (error) {
                  await ldapClient.unbind();
                  throw new Error('authorize database error: insertOne failed');
                }
                return {
                  email,
                  roles: ['user'],
                  rolesLastRefreshed: new Date(),
                } as User;
              } else {
                return {
                  email,
                  roles: user.roles,
                  rolesLastRefreshed: new Date(),
                } as User;
              }
            } catch (error) {
              await ldapClient.unbind();
              throw new Error('authorize database error');
            }
          }
        } catch (error) {
          await ldapClient.unbind();
          throw new Error('authorize ldap error');
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.roles;
        token.rolesLastRefreshed = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      const REFRESH_INTERVAL = Number(
        process.env.SESSION_ROLES_REFRESH_INTERVAL || 1 * 60 * 60 * 1000,
      ); // 1 hour default
      const shouldRefreshRoles =
        !token.rolesLastRefreshed ||
        Date.now() - token.rolesLastRefreshed > REFRESH_INTERVAL;

      if (shouldRefreshRoles && session.user.email) {
        try {
          const latestRoles = await fetchLatestUserRoles(session.user.email);
          token.role = latestRoles;
          token.rolesLastRefreshed = Date.now();
          session.user.roles = latestRoles;
        } catch (error) {
          throw new Error('refresh user roles error');
        }
      } else {
        session.user.roles = token.role as string[];
      }
      return session;
    },
  },
});

// Type extensions for NextAuth
declare module 'next-auth' {
  interface User {
    roles: string[];
    rolesLastRefreshed?: Date;
  }

  interface Session {
    user: {
      roles: string[];
      email?: string | null;
    };
    error?: 'RolesRefreshError';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string[];
    rolesLastRefreshed?: number;
  }
}
