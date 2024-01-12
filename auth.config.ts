import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/auth',
  },
  callbacks: {
    // authorized({ auth, request: { nextUrl } }) {
    //   const isLoggedIn = !!auth?.user;
    //   const isOnMainPage = nextUrl.pathname.startsWith('/');
    //   if (isOnMainPage) {
    //     if (isLoggedIn) return true;
    //   } else if (isLoggedIn) {
    //     return Response.redirect(new URL('/', nextUrl));
    //   }
    //   return false;
    // },
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
