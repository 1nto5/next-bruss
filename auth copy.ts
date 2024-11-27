import { dbc } from '@/lib/mongo';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
const LdapClient = require('ldapjs-client');

type CredentialsType = {
  email: string;
  password: string;
};

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth({
  pages: {
    signIn: '/auth',
  },
  providers: [
    Credentials({
      name: 'LDAP',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: '' },
        password: { label: 'Password', type: 'password' },
      },
      // @ts-ignore
      async authorize(credentials: CredentialsType) {
        const { email, password } = credentials;

        const ldapClient = new LdapClient({
          url: process.env.LDAP,
        });

        try {
          await ldapClient.bind(process.env.LDAP_DN, process.env.LDAP_PASS);
        } catch (error) {
          console.log('LDAP admin bind failed');
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
                lastLogin: new Date(),
              });
            } else {
              await usersCollection.updateOne(
                { email },
                { $set: { lastLogin: new Date() } },
              );
              return {
                email,
                roles: user.roles,
                lastUpdate: new Date().getTime(),
              };
            }
          }
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      const now = new Date().getTime();
      if (user) {
        token.userId = user.id;
        token.roles = user.roles;
        token.lastUpdate = now;
      } else {
        const msDifference = now - Number(token.lastUpdate);
        const minDifference = Math.ceil(msDifference / 1000 / 60);
        if (minDifference >= 5 || minDifference < 0) {
          const usersCollection = await dbc('users');
          const freshUser = await usersCollection.findOne({
            email: token.email,
          });
          token.roles = freshUser?.roles || 'banned';
          token.lastUpdateAt = now;
        }
      }
      return token;
      // if (user) {
      //   token.roles = user.roles;
      // }
      // return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.roles = token.roles as string[];
      }
      return session;
    },
  },
});
