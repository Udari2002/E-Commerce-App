import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 🔓 Force these routes to be completely unprotected
const isPublicRoute = createRouteMatcher([
  '/',
  '/all-products',
  '/api/inngest(.*)' // 👈 This catches all incoming methods (GET, POST, PUT) for Inngest
]);

export default clerkMiddleware(async (auth, req) => {
  // If the request matches our public routes list, do not run auth.protect()
  if (isPublicRoute(req)) {
    return;
  }
  
  // Protect everything else
  await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API and trpc routes
    '/(api|trpc)(.*)',
  ],
};