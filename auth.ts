import { dbc } from '@/lib/mongo';

import NextAuth, { User, type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
const LdapClient = require('ldapjs-client');

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
                  });
                } catch (error) {
                  await ldapClient.unbind();
                  throw new Error('authorize database error: insertOne failed');
                }
                return {
                  email,
                  roles: ['user'],
                } as User;
              } else {
                return {
                  email,
                  roles: user.roles,
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
      if (user) token.role = user.roles;
      return token;
    },
    session({ session, token }) {
      session.user.roles = token.role as string[];
      return session;
    },
  },
});
