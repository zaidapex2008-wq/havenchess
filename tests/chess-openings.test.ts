import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { chessOpenings } from "../shared/chess-openings";

describe("Haven Chess opening explorer", () => {
  it("includes all eight white and black opening guides", () => {
    expect(chessOpenings).toHaveLength(8);
    expect(
      chessOpenings.filter((opening) => opening.side === "الأبيض"),
    ).toHaveLength(4);
    expect(
      chessOpenings.filter((opening) => opening.side === "الأسود"),
    ).toHaveLength(4);
  });

  it("keeps every displayed illustrative SAN line legal from the initial position", () => {
    for (const opening of chessOpenings) {
      const game = new Chess();
      expect(opening.san.length, opening.name).toBeGreaterThanOrEqual(6);
      for (const san of opening.san) {
        expect(() => game.move(san), `${opening.name}: ${san}`).not.toThrow();
      }
    }
  });
});
