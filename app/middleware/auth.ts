/**
 * Middleware to ensure the user is logged in before accessing protected routes.
 */
export default defineNuxtRouteMiddleware(async () => {
  // Check if a "nuxt-session" cookie exists
  const sessionCookie = useCookie('nuxt-session');
  if (!sessionCookie.value) {
    // Redirect to the login page if no session cookie is found
    return navigateTo('/login');
  }
});
