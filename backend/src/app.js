import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import { config } from "./config.js";
import { businessesRouter } from "./routes/businesses.js";
import { visitsRouter } from "./routes/visits.js";
import { summaryRouter } from "./routes/summary.js";
import { importRouter } from "./routes/import.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "2mb" }));

  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.set("Pragma", "no-cache");
    next();
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "field-crm-backend" });
  });

  app.use("/api/businesses", businessesRouter);
  app.use("/api/visits", visitsRouter);
  app.use("/api/import", importRouter);
  app.use("/api/ai-summary", summaryRouter);

  app.use((err, _req, res, _next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      error: "Internal server error",
    });
  });

  return app;
}
