import { createAuthClient } from "better-auth/solid";
import { adminClient, usernameClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient(), usernameClient()],
  baseURL: "http://localhost:3001",
});
