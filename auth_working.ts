// TODO: [auth][error] while wrong credentials in server console?

import clientPromise from '@/lib/mongo';
import { extractFullNameFromEmail } from '@/lib/utils/nameFormat';
import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
const ldap = require('ldapjs');
// var LdapClient = require('ldapjs-client');

const collectionName = 'users';

type CredentialsType = {
  email: string;
  password: string;
};

type User = {
  email: string;
  password: string;
  roles?: string[];
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
        username: { label: 'DN', type: 'text', placeholder: '' },
        password: { label: 'Password', type: 'password' },
      },
      // @ts-ignore
      async authorize(credentials: CredentialsType) {
        const { email, password } = credentials;

        try {
          const client = ldap.createClient({
            url: process.env.LDAP,
          });

          return new Promise((resolve, reject) => {
            // Construct Distinguished Name (DN) dynamically
            const userDN = `CN=${extractFullNameFromEmail(email)},OU=IT,OU=USER,OU=_MRG700,DC=mrg700,DC=bruss-group,DC=com`;
            console.log('Attempting LDAP bind with DN:', userDN);

            // LDAP Bind - authenticate user
            client.bind(userDN, password, (error) => {
              if (error) {
                console.error('LDAP authentication failed:', error.message);
                // resolve(null); // Return null for invalid credentials
                reject();
              } else {
                console.log('LDAP authentication successful');
                resolve({
                  email,
                  roles: ['user'], // Example static role -> get from db
                });
              }
            });
          });
        } catch (error) {
          console.error('Error during LDAP login:', error.message);
          return null; // Return null if an exception occurs
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.roles = user.roles;
      }
      return token;
    },
    // @ts-ignore
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.roles = token.roles as string[];
      }
      return session;
    },
  },
});
