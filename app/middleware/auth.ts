export default defineNuxtRouteMiddleware(async () => {
  // SERVER SIDE
  if (import.meta.server) {
    return;
  }

  // CLIENT SIDE
  const { loggedIn } = useUserSession();

  if (!loggedIn.value) {
    return navigateTo('/auth');
  }
});
