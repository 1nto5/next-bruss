import NextAuth, { SessionStrategy } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToMongo } from '@/lib/mongo/connector'

const collectionName = "users"

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { login, password } = credentials
        try {
          const collection = await connectToMongo(collectionName)
          const user = await collection.findOne({email: login})
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as SessionStrategy,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
