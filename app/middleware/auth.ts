/**
 * Middleware to ensure user is logged in before accessing protected routes.
 */
export default defineNuxtRouteMiddleware(async () => {
  const { loggedIn } = useUserSession();

  // If the local state indicates logged in, skip server check
  if (loggedIn.value) return;

  const { data } = await useFetch('/api/auth/session');
  if (!data.value?.session?.user) {
    return navigateTo('/auth');
  }
});
