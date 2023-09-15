import NextAuth, { SessionStrategy, Session, User } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectToMongo } from '@/lib/mongo/connector'
import bcrypt from 'bcryptjs'
const collectionName = 'users'

type CredentialsType = {
  username: string
  password: string
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {},
      // @ts-ignore
      async authorize(credentials: CredentialsType) {
        const { username, password } = credentials
        try {
          const collection = await connectToMongo(collectionName)
          const user = await collection.findOne({
            email: `${username}@bruss-group.com`,
          })
          if (!user) {
            return null
          }
          const passwordMatch = await bcrypt.compare(password, user.password)
          if (!passwordMatch) {
            return null
          }
          return user
        } catch (error) {
          console.log('Error:', error)
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
      session: Session
      token: JWT
      user?: Session['user']
    }) {
      // Add role value to user object so it is passed along with session
      session.user.roles = user?.roles ? user.roles : token?.user?.roles
      return session
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      //if the user logs in, you save your user in token
      if (user) {
        token.user = user
      }
      return Promise.resolve(token)
    },
  },
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
