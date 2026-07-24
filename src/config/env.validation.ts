import { z } from 'zod';

const AUTH_METHOD_KEYS = [
  'username_password',
  'email_password',
  'email_otp',
  'mobile_otp',
] as const;

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required (Supabase Postgres connection string)'),

  JWT_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  AUTH_METHODS: z
    .string()
    .default('email_password')
    .transform((val) => val.split(',').map((v) => v.trim()))
    .pipe(z.array(z.enum(AUTH_METHOD_KEYS)).min(1)),

  SEAT_LOCK_TTL_MINUTES: z.coerce.number().default(10),

  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),

  CORS_ORIGIN: z.string().default('http://localhost:3001'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration:\n${parsed.error.toString()}`);
  }
  return parsed.data;
}
