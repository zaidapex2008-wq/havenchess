import "dotenv/config";
import express from "express";
import { Chess } from "chess.js";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { createCorsMiddleware } from "./cors";
import { clearLegacySessionCookie } from "./cookies";
import { analyzeChessPosition } from "./chess-engine";

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(createCorsMiddleware());
  app.use(clearLegacySessionCookie());

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerStorageProxy(app);
  registerOAuthRoutes(app);

  let activeEngineJobs = 0;
  app.post("/api/chess/analyze", async (req, res) => {
    const fen = typeof req.body?.fen === "string" ? req.body.fen.trim() : "";
    const requestedMode = req.body?.mode;
    const mode =
      requestedMode === "quick" ||
      requestedMode === "deep" ||
      requestedMode === "balanced"
        ? requestedMode
        : "balanced";
    if (!fen || fen.length > 200) {
      res.status(400).json({ error: "أدخل وضعية FEN صالحة." });
      return;
    }
    try {
      new Chess(fen);
    } catch {
      res.status(400).json({ error: "وضعية FEN غير صالحة." });
      return;
    }
    if (activeEngineJobs >= 2) {
      res
        .status(429)
        .json({ error: "محرك التحليل مشغول الآن؛ حاول بعد قليل." });
      return;
    }
    activeEngineJobs += 1;
    const controller = new AbortController();
    const abortEngine = () => {
      if (!res.writableEnded) controller.abort();
    };
    req.once("aborted", abortEngine);
    res.once("close", abortEngine);
    try {
      const result = await analyzeChessPosition(fen, mode, controller.signal);
      if (!controller.signal.aborted && !res.destroyed) res.json(result);
    } catch (error) {
      if (controller.signal.aborted || res.destroyed) return;
      const message =
        error instanceof Error ? error.message : "تعذّر تشغيل التحليل.";
      res.status(503).json({ error: message });
    } finally {
      req.off("aborted", abortEngine);
      res.off("close", abortEngine);
      activeEngineJobs -= 1;
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: Date.now() });
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  const port = parseInt(process.env.PORT || "3000");
  server.listen(port, () => {
    console.log("[api] server listening");
  });
}

startServer().catch(() => {
  console.error("[api] server failed to start");
});
