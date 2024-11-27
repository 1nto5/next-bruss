import { dbc } from '@/lib/mongo';
import { th } from 'date-fns/locale';
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
        const { email, password } = credentials;
        const ldapClient = new LdapClient({
          url: process.env.LDAP,
        });

        try {
          await ldapClient.bind(process.env.LDAP_DN, process.env.LDAP_PASS);
        } catch (error) {
          return null;
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
              return null;
            }
            const usersCollection = await dbc('users');
            const user = await usersCollection.findOne({ email });
            if (!user) {
              await usersCollection.insertOne({
                email,
                roles: ['user'],
                firstLogin: new Date(),
              });
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
          }
        } catch (error) {
          return null;
        }
      },
    }),
  ],
});
