export default defineNuxtRouteMiddleware(async (_to) => {
  const nuxtApp = useNuxtApp();
  if (import.meta.client && nuxtApp.isHydrating && nuxtApp.payload.serverRendered) {
    return;
  }

  const { fetch, loggedIn } = useUserSession();

  await fetch();
  console.log('LI', loggedIn.value);
  if (!loggedIn) {
    return navigateTo('/auth');
  }
});
