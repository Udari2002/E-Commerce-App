import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 🔓 Define your public routes (routes anyone/any service can access)
const isPublicRoute = createRouteMatcher([
  '/',
  '/all-products',
  '/api/inngest(.*)' // 👈 This allows Inngest to bypass Clerk authentication safely
])

export default clerkMiddleware(async (auth, request) => {
  // If the incoming request is NOT a public route, protect it with Clerk
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Always run for Clerk-specific frontend API routes
    '/__clerk/(.*)',
  ],
}