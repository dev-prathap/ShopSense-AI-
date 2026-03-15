import { validateEnvironmentVariables, validateProductionEnvironment } from "./config/env-validation";

/**
 * Performs all startup validations
 * This should be called at application startup
 */
export function performStartupValidations(): void {
  try {
    console.log("🚀 Starting application validation...");

    // Validate environment variables
    validateEnvironmentVariables();

    // Additional production checks
    validateProductionEnvironment();

    console.log("✅ All startup validations passed");
  } catch (error) {
    console.error("💥 Startup validation failed:", error);
    process.exit(1);
  }
}