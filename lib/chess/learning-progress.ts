import AsyncStorage from "@react-native-async-storage/async-storage";
import { chapterKey, chessLibrary } from "@/shared/chess-library";

const storageKey = "haven-chess-learning-progress-v1";
const validChapterKeys = new Set(
  chessLibrary.flatMap((volume) =>
    volume.chapters.map((chapter) => chapterKey(volume.id, chapter.id)),
  ),
);
let writeQueue: Promise<void> = Promise.resolve();

export type LearningProgress = {
  lastRead: { bookId: string; chapterId: string } | null;
  bookmarkedChapterIds: string[];
  completedChapterIds: string[];
};

export const emptyLearningProgress: LearningProgress = {
  lastRead: null,
  bookmarkedChapterIds: [],
  completedChapterIds: [],
};

export function loadLearningProgress(): Promise<LearningProgress> {
  const queuedRead = writeQueue
    .catch(() => undefined)
    .then(async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (!raw) return emptyLearningProgress;
        const parsed = JSON.parse(raw) as Partial<LearningProgress>;
        const storedLastRead = parsed.lastRead;
        const lastReadKey =
          storedLastRead &&
          typeof storedLastRead.bookId === "string" &&
          typeof storedLastRead.chapterId === "string"
            ? chapterKey(storedLastRead.bookId, storedLastRead.chapterId)
            : "";
        return {
          lastRead: validChapterKeys.has(lastReadKey) ? storedLastRead! : null,
          bookmarkedChapterIds: Array.isArray(parsed.bookmarkedChapterIds)
            ? parsed.bookmarkedChapterIds.filter(
                (item): item is string =>
                  typeof item === "string" && validChapterKeys.has(item),
              )
            : [],
          completedChapterIds: Array.isArray(parsed.completedChapterIds)
            ? parsed.completedChapterIds.filter(
                (item): item is string =>
                  typeof item === "string" && validChapterKeys.has(item),
              )
            : [],
        };
      } catch {
        return emptyLearningProgress;
      }
    });
  writeQueue = queuedRead.then(() => undefined).catch(() => undefined);
  return queuedRead;
}

export async function saveLearningProgress(progress: LearningProgress) {
  const serialized = JSON.stringify(progress);
  const queuedWrite = writeQueue
    .catch(() => undefined)
    .then(() => AsyncStorage.setItem(storageKey, serialized))
    .then(() => undefined)
    .catch(() => undefined);
  writeQueue = queuedWrite;
  await queuedWrite;
}
