import authConfig from "@/auth.config";
import {
  apiAuthPrefix,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  protectedRoutes,
  publicApis,
  publicRoutes,
} from "@/routes";
import NextAuth from "next-auth";
import { getToken, GetTokenParams } from "next-auth/jwt";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { auth, nextUrl } = req;
  const isLoggedIn = !!auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isPublicApi = publicApis.some((api) =>
    nextUrl.pathname.startsWith(api)
  );
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return undefined;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return undefined;
  }

  if (!isLoggedIn && !isPublicRoute && !isPublicApi) {
    return Response.redirect(new URL("/auth/login", nextUrl));
  }

  if (isLoggedIn) {
    const params: GetTokenParams = { req, secret: process.env.AUTH_SECRET! };
    if (process.env.NODE_ENV === "production") {
      params.secureCookie = true;
    }
    const token = await getToken(params);
    if (!token || !token.role) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    for (const pattern in protectedRoutes) {
      const regex = new RegExp(pattern);
      if (regex.test(nextUrl.pathname)) {
        const roles = protectedRoutes[pattern];
        if (!roles.includes(token.role)) {
          return NextResponse.redirect(new URL("/auth/login", req.url));
        }
      }
    }
  }

  return undefined;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
