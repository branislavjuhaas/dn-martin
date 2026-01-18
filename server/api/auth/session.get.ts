/**
 * Handler to retrieve user session details.
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  return { success: true, statusCode: 200, statusMessage: 'OK', session };
});
