import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";
import { db } from "../db/connection.ts";
import {
  account,
  session,
  user,
  verification,
} from "../db/schema/auth-schema.ts";

export const auth = betterAuth({
  advanced: {
    cookiePrefix: "srccod",
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { account, session, user, verification },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 5,
    requireEmailVerification: false,
  },
  plugins: [admin(), username()],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "https://localhost:4433",
    "https://srccod.northridge.dev",
  ],
});
