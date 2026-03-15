import { z } from "zod";

// Define required environment variables
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // OpenAI API
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),

  // Shopify App Configuration
  SHOPIFY_API_KEY: z.string().min(1, "SHOPIFY_API_KEY is required"),
  SHOPIFY_API_SECRET: z.string().min(1, "SHOPIFY_API_SECRET is required"),
  SHOPIFY_SCOPES: z.string().min(1, "SHOPIFY_SCOPES is required"),
  SHOPIFY_APP_URL: z.string().url("SHOPIFY_APP_URL must be a valid URL"),

  // App Security
  APP_SIGNING_SECRET: z.string().min(32, "APP_SIGNING_SECRET must be at least 32 characters"),
  APP_AUTH_SECRET: z.string().min(32, "APP_AUTH_SECRET must be at least 32 characters"),

  // Optional but recommended for production
  CRON_SECRET: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),

  // Billing (optional for development)
  CREEM_API_KEY: z.string().optional(),
  CREEM_WEBHOOK_SECRET: z.string().min(16).optional(),

  // Node Environment
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type EnvConfig = z.infer<typeof envSchema>;

let validatedEnv: EnvConfig | null = null;

/**
 * Validates environment variables on startup
 * @throws {Error} If validation fails
 */
export function validateEnvironmentVariables(): EnvConfig {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    console.log("✅ Environment variables validated successfully");
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );

      console.error("❌ Environment validation failed:");
      errorMessages.forEach(msg => console.error(`  - ${msg}`));

      throw new Error(
        `Environment validation failed:\n${errorMessages.join("\n")}`
      );
    }

    throw error;
  }
}

/**
 * Returns validated environment config (must call validateEnvironmentVariables first)
 */
export function getEnvConfig(): EnvConfig {
  if (!validatedEnv) {
    throw new Error("Environment not validated. Call validateEnvironmentVariables() first.");
  }

  return validatedEnv;
}

/**
 * Validates production-specific requirements
 */
export function validateProductionEnvironment(): void {
  const env = getEnvConfig();

  if (env.NODE_ENV === "production") {
    const productionRequirements = [
      { key: "CRON_SECRET", value: env.CRON_SECRET },
      { key: "UPSTASH_REDIS_REST_URL", value: env.UPSTASH_REDIS_REST_URL },
      { key: "UPSTASH_REDIS_REST_TOKEN", value: env.UPSTASH_REDIS_REST_TOKEN },
    ];

    const missing = productionRequirements
      .filter(req => !req.value)
      .map(req => req.key);

    if (missing.length > 0) {
      console.warn(`⚠️  Production environment missing recommended variables: ${missing.join(", ")}`);
    }

    // Validate billing integration is properly configured
    if (env.CREEM_API_KEY && !env.CREEM_WEBHOOK_SECRET) {
      console.warn("⚠️  CREEM_API_KEY is set but CREEM_WEBHOOK_SECRET is missing. Billing webhooks will be insecure.");
    }
  }
}