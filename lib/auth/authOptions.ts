import { SessionStrategy, Session, User, NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import clientPromise from '@/lib/mongo';
import bcrypt from 'bcryptjs';

const collectionName = 'users';

type CredentialsType = {
  email: string;
  password: string;
};

// Define authOptions in this separate file
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {},
      // @ts-ignore
      async authorize(credentials: CredentialsType) {
        const { email, password } = credentials;
        try {
          const client = await clientPromise;
          const db = client.db();
          const collection = db.collection(collectionName);
          const user = await collection.findOne({ email });
          if (!user) {
            return null;
          }
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (!passwordMatch) {
            return null;
          }
          return user;
        } catch (error) {
          console.log('Error:', error);
        }
      },
    }),
  ],
  callbacks: {
    async session({
      session,
      token,
      user,
    }: {
      session: Session;
      token: JWT;
      user?: Session['user'];
    }) {
      session.user.roles = user?.roles ? user.roles : token?.user?.roles;
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.user = user;
      }
      return Promise.resolve(token);
    },
  },
  session: {
    strategy: 'jwt' as SessionStrategy,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
  },
};

export default authOptions;
