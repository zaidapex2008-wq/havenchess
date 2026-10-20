import { Chess, type Square } from "chess.js";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import type { ChildProcessWithoutNullStreams } from "node:child_process";

export type EngineLine = {
  multipv: number;
  depth: number;
  centipawns: number | null;
  mate: number | null;
  moves: string[];
  san: string[];
};

const enginePath = resolve(
  process.cwd(),
  "server/engine/stockfish-19-lite-single.js",
);
export type EngineAnalysisMode = "quick" | "balanced" | "deep";

const analysisTimes: Record<EngineAnalysisMode, number> = {
  quick: 600,
  balanced: 1700,
  deep: 3800,
};

function parseInfoLine(
  line: string,
  fen: string,
  blackToMove: boolean,
): EngineLine | null {
  if (!line.startsWith("info ") || !line.includes(" pv ")) return null;
  const depth = Number(line.match(/\bdepth (\d+)/)?.[1] ?? 0);
  const multipv = Number(line.match(/\bmultipv (\d+)/)?.[1] ?? 1);
  const score = line.match(/\bscore (cp|mate) (-?\d+)/);
  const pv = line.match(/\bpv ((?:[a-h][1-8][a-h][1-8][qrbn]?\s*)+)/)?.[1];
  if (!score || !pv || !depth) return null;
  const sign = blackToMove ? -1 : 1;
  const moves = pv.trim().split(/\s+/);
  const game = new Chess(fen);
  const san: string[] = [];
  for (const uci of moves) {
    try {
      const from = uci.slice(0, 2) as Square;
      const to = uci.slice(2, 4) as Square;
      const promotion = uci[4] as "q" | "r" | "b" | "n" | undefined;
      const move = game.move({ from, to, ...(promotion ? { promotion } : {}) });
      san.push(move.san);
    } catch {
      break;
    }
  }
  return {
    multipv,
    depth,
    centipawns: score[1] === "cp" ? Number(score[2]) * sign : null,
    mate: score[1] === "mate" ? Number(score[2]) * sign : null,
    moves,
    san,
  };
}

function stopEngine(engine: ChildProcessWithoutNullStreams) {
  try {
    engine.stdin.end("quit\n");
  } catch {
    engine.kill();
  }
  const killTimer = setTimeout(() => engine.kill(), 300);
  killTimer.unref();
}

export function analyzeChessPosition(
  fen: string,
  mode: EngineAnalysisMode = "balanced",
  signal?: AbortSignal,
): Promise<{
  engine: string;
  depth: number;
  lines: EngineLine[];
  mode: EngineAnalysisMode;
  targetTimeMs: number;
}> {
  if (signal?.aborted)
    return Promise.reject(new Error("تم إلغاء تحليل Stockfish."));
  const validatedGame = new Chess(fen);
  const blackToMove = validatedGame.turn() === "b";
  const targetTimeMs = analysisTimes[mode];
  if (validatedGame.isGameOver()) {
    return Promise.resolve({
      engine: "Stockfish 19 Lite",
      depth: 0,
      lines: [],
      mode,
      targetTimeMs,
    });
  }

  return new Promise((resolveResult, rejectResult) => {
    const engine = spawn(process.execPath, [enginePath], { stdio: "pipe" });
    const newestLines = new Map<number, EngineLine>();
    let buffer = "";
    let readyTimer: ReturnType<typeof setTimeout> | undefined;
    let startupTimer: ReturnType<typeof setTimeout> | undefined;
    let settled = false;
    let started = false;

    const detachAbort = () => signal?.removeEventListener("abort", abortEngine);
    const fail = (error: Error, terminateImmediately = false) => {
      if (settled) return;
      settled = true;
      if (readyTimer) clearTimeout(readyTimer);
      if (startupTimer) clearTimeout(startupTimer);
      detachAbort();
      if (terminateImmediately) engine.kill();
      else stopEngine(engine);
      rejectResult(error);
    };

    const finish = () => {
      if (settled) return;
      settled = true;
      if (readyTimer) clearTimeout(readyTimer);
      if (startupTimer) clearTimeout(startupTimer);
      detachAbort();
      stopEngine(engine);
      const lines = [...newestLines.values()].sort(
        (a, b) => a.multipv - b.multipv,
      );
      if (!lines.length) {
        rejectResult(new Error("لم يرجع المحرك خطوط تحليل صالحة."));
        return;
      }
      resolveResult({
        engine: "Stockfish 19 Lite",
        depth: Math.max(...lines.map((line) => line.depth)),
        lines,
        mode,
        targetTimeMs,
      });
    };

    const abortEngine = () =>
      fail(new Error("تم إلغاء تحليل Stockfish."), true);
    engine.on("error", (error) => fail(error));
    engine.stderr.on("data", (data: Buffer) => {
      const message = data.toString().trim();
      if (message) console.warn("[chess-engine]", message.slice(0, 240));
    });
    engine.stdout.on("data", (data: Buffer) => {
      buffer += data.toString("utf8");
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (line === "uciok" && !started) {
          started = true;
          engine.stdin.write(
            "setoption name Threads value 1\nsetoption name MultiPV value 3\nisready\n",
          );
        } else if (line === "readyok") {
          engine.stdin.write(
            `position fen ${fen}\ngo movetime ${targetTimeMs}\n`,
          );
          readyTimer = setTimeout(() => {
            if (!settled) engine.stdin.write("stop\n");
          }, targetTimeMs + 1200);
        } else if (line.startsWith("info ")) {
          const info = parseInfoLine(line, fen, blackToMove);
          if (info && info.san.length) {
            const current = newestLines.get(info.multipv);
            if (!current || info.depth >= current.depth)
              newestLines.set(info.multipv, info);
          }
        } else if (line.startsWith("bestmove ")) {
          finish();
        }
      }
    });
    engine.on("close", (code) => {
      if (!settled && code !== 0)
        fail(new Error("توقّف محرك التحليل قبل اكتمال النتيجة."));
      else if (!settled) finish();
    });
    if (signal?.aborted) {
      abortEngine();
      return;
    }
    signal?.addEventListener("abort", abortEngine, { once: true });
    engine.stdin.write("uci\n");
    startupTimer = setTimeout(() => {
      if (!settled && !started)
        fail(new Error("استغرق تهيئة محرك Stockfish وقتًا أطول من المتوقع."));
    }, 8000);
    startupTimer.unref();
  });
}
