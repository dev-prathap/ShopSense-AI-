/**
 * Next.js instrumentation file
 * This runs once when the server starts up
 */
export async function register() {
  // Only run validation in production or when explicitly enabled
  if (process.env.NODE_ENV === 'production' || process.env.VALIDATE_ENV === 'true') {
    const { performStartupValidations } = await import('./lib/startup');
    performStartupValidations();
  }
}