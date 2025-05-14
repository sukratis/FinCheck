import { createMiddleware, detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Protected routes
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

// Arcjet middleware
const arcjetMiddleware = createMiddleware({
  key: process.env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "GO_HTTP"],
    }),
  ],
});

// Clerk Middleware
const clerk = clerkMiddleware((auth, req) => {
  return auth().then(({ userId, redirectToSignIn }) => {
    if (!userId && isProtectedRoute(req)) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    return NextResponse.next();
  });
});

// Combine Arcjet and Clerk
export default createMiddleware(clerk, arcjetMiddleware); // ✅ Clerk first

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};



