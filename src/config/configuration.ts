export const AUTH_METHOD_TITLES: Record<string, string> = {
  username_password: 'Username & Password',
  email_password: 'Email & Password',
  email_otp: 'Email & OTP',
  mobile_otp: 'Mobile & OTP',
};

export function getEnabledAuthMethods(raw: string | string[]): string[] {
  return Array.isArray(raw) ? raw : raw.split(',').map((v) => v.trim());
}

export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  authMethods: getEnabledAuthMethods(process.env.AUTH_METHODS ?? 'email_password'),
  seatLockTtlMinutes: parseInt(process.env.SEAT_LOCK_TTL_MINUTES ?? '10', 10),
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3001',
});
