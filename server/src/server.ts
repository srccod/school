import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./handlers/auth.ts";

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: "http://localhost:3000",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);
app.on(["GET", "POST"], "/api/auth/**", (c) => auth.handler(c.req.raw));

Deno.serve({ port: 3001 }, app.fetch);
