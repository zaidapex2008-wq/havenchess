import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { analyzeChessPosition } from "../server/_core/chess-engine";

describe("Haven Chess engine", () => {
  it("returns legal principal variations from Stockfish for the starting position", async () => {
    const result = await analyzeChessPosition(new Chess().fen());
    expect(result.engine).toContain("Stockfish");
    expect(result.mode).toBe("balanced");
    expect(result.targetTimeMs).toBe(1700);
    expect(result.depth).toBeGreaterThan(0);
    expect(result.lines.length).toBeGreaterThan(0);
    expect(result.lines[0].moves[0]).toMatch(/^[a-h][1-8][a-h][1-8][qrbn]?$/);
    expect(result.lines[0].san[0]).toBeTruthy();
    expect(result.lines.length).toBeLessThanOrEqual(3);
  }, 15_000);

  it("supports quick analysis using the real Stockfish engine", async () => {
    const result = await analyzeChessPosition(new Chess().fen(), "quick");
    expect(result.engine).toContain("Stockfish");
    expect(result.mode).toBe("quick");
    expect(result.targetTimeMs).toBe(600);
    expect(result.lines[0]?.san.length).toBeGreaterThan(0);
  }, 15_000);

  it("stops the Stockfish process when its request is aborted", async () => {
    const controller = new AbortController();
    const analysis = analyzeChessPosition(
      new Chess().fen(),
      "deep",
      controller.signal,
    );
    setTimeout(() => controller.abort(), 25);
    await expect(analysis).rejects.toThrow("تم إلغاء تحليل Stockfish.");
  }, 5_000);

  it("honors an already-aborted signal for a finished game", async () => {
    const game = new Chess();
    game.move("f3");
    game.move("e5");
    game.move("g4");
    game.move("Qh4#");
    expect(game.isCheckmate()).toBe(true);
    const controller = new AbortController();
    controller.abort();
    await expect(
      analyzeChessPosition(game.fen(), "quick", controller.signal),
    ).rejects.toThrow("تم إلغاء تحليل Stockfish.");
  });
});
