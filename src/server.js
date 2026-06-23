import Fastify from "fastify";
import cookie from "@fastify/cookie";
import fastifyStatic from "@fastify/static";
import path from "path";
import { fileURLToPath } from "url";
import { apiRoutes } from "./presentation/routes/api.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: true,
});

// 1. Register Fastify Cookie plugin
fastify.register(cookie, {
  secret: process.env.COOKIE_SECRET || "salary-mgmt-cookie-secret-8877",
});

// 2. Register API endpoint plugins under the /api path
fastify.register(apiRoutes, { prefix: "/api" });

// 3. Mount static file serving for React production build outputs
const distPath = path.resolve(__dirname, "../frontend/dist");

fastify.register(fastifyStatic, {
  root: distPath,
  prefix: "/",
  constraints: {},
});

// 4. Register SPA fallback routing handler
fastify.setNotFoundHandler((request, reply) => {
  if (request.url.startsWith("/api")) {
    reply.status(404).send({ error: "API endpoint not found" });
    return;
  }
  
  // Serve index.html for React router paths or other client routes
  reply.sendFile("index.html").catch(() => {
    reply.status(404).send({ error: "Static resources not found. Please compile frontend first." });
  });
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT) || 3000;
    // Bind to 0.0.0.0 to make it accessible inside docker or locally
    await fastify.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
