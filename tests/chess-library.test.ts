import { describe, expect, it } from "vitest";
import { chessLibrary } from "../shared/chess-library";

describe("Haven Chess offline library", () => {
  it("bundles eight or more complete volumes with five chapters each", () => {
    expect(chessLibrary.length).toBeGreaterThanOrEqual(8);
    expect(
      chessLibrary.reduce((count, volume) => count + volume.chapters.length, 0),
    ).toBeGreaterThanOrEqual(40);
    for (const volume of chessLibrary) {
      expect(volume.title.trim()).not.toBe("");
      expect(volume.description.trim().length).toBeGreaterThan(20);
      expect(volume.chapters.length).toBeGreaterThanOrEqual(5);
      expect(new Set(volume.chapters.map((chapter) => chapter.id)).size).toBe(
        volume.chapters.length,
      );
      for (const chapter of volume.chapters) {
        expect(chapter.title.trim()).not.toBe("");
        expect(chapter.body.trim().length).toBeGreaterThan(200);
        expect(chapter.boardExample.trim().length).toBeGreaterThan(12);
      }
    }
  });

  it("covers beginner, intermediate, and advanced study", () => {
    const levels = new Set(chessLibrary.map((volume) => volume.level));
    expect(levels).toEqual(new Set(["تمهيدي", "متوسط", "متقدم"]));
  });
});
