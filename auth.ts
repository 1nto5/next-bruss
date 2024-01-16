import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
// import { authConfig } from './auth.config';
import clientPromise from '@/lib/mongo';
import bcrypt from 'bcryptjs';

const collectionName = 'users';

type CredentialsType = {
  email: string;
  password: string;
};

export const { auth, signIn, signOut } = NextAuth({
  // ...authConfig,
  providers: [
    Credentials({
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
            console.log(user);
            return user;
          }
          console.log('Invalid credentials');
          return null;
        } catch (error) {
          console.log('Error:', error);
          return null;
        }
      },
    }),
  ],
});
