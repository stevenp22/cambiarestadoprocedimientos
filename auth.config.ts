import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true, // 🔹 Agregamos esta línea para evitar el error de UntrustedHost

  pages: {
    signIn: "/",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname === "/";
      if (!isLoggedIn && !isLoginPage) {
        return Response.redirect(new URL("/", nextUrl));
      }
      if (isLoggedIn && isLoginPage) {
        return Response.redirect(new URL("/inicio", nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
