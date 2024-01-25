// TODO: [auth][error] while wrong credentials in server console?

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import clientPromise from '@/lib/mongo';
import bcrypt from 'bcryptjs';

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
      name: 'credentials',
      // @ts-ignore
      async authorize(credentials: CredentialsType) {
        const { email, password } = credentials;
        try {
          const client = await clientPromise;
          const db = client.db();
          const collection = db.collection(collectionName);
          const user = await collection.findOne({ email });
          if (!user) {
            // console.log('User not found');
            return null;
          }
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) {
            // console.log(user);
            return user;
          }
          // console.log('Invalid credentials');
          return null;
        } catch (error) {
          // console.log('Error:', error);
          return null;
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
