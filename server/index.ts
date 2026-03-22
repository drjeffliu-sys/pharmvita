import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.js";
import paymentRoutes from "./routes/payment.js";
import progressRoutes from "./routes/progress.js";
import subscriptionRoutes from "./routes/subscription.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Security headers
  app.use(helmet({ contentSecurityPolicy: false }));

  // CORS
  app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }));

  // Body parsing
  app.use(express.json());
  // ECPay webhook needs raw body for verification
  app.use("/api/payment/webhook", express.raw({ type: "*/*" }));

  // Health check
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/payment", paymentRoutes);
  app.use("/api/progress", progressRoutes);
  app.use("/api/subscription", subscriptionRoutes);

  // Serve static frontend in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 4000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
