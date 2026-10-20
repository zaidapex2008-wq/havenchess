import { startTransition, useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ScreenShell, Surface, Tag } from "@/components/chess-layout";
import { chessColors } from "@/constants/chess-theme";
import {
  chapterKey,
  chessLibrary,
  type ChessLibraryVolume,
} from "@/shared/chess-library";
import {
  emptyLearningProgress,
  loadLearningProgress,
  saveLearningProgress,
  type LearningProgress,
} from "@/lib/chess/learning-progress";

export default function BooksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ volume?: string | string[] }>();
  const requestedVolume = Array.isArray(params.volume)
    ? params.volume[0]
    : params.volume;
  const [filter, setFilter] = useState("الكل");
  const [query, setQuery] = useState("");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [autoOpenedVolume, setAutoOpenedVolume] = useState<string | null>(null);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [progress, setProgress] = useState<LearningProgress>(
    emptyLearningProgress,
  );
  const [progressLoaded, setProgressLoaded] = useState(false);

  useEffect(() => {
    loadLearningProgress().then((saved) => {
      setProgress(saved);
      setProgressLoaded(true);
    });
  }, []);

  const categories = useMemo(
    () => ["الكل", ...new Set(chessLibrary.map((volume) => volume.category))],
    [],
  );
  const volumes = useMemo(
    () =>
      chessLibrary.filter((volume) => {
        const searchText =
          `${volume.title} ${volume.description} ${volume.category} ${volume.chapters.map((chapter) => `${chapter.title} ${chapter.body}`).join(" ")}`.toLowerCase();
        const matchesQuery = searchText.includes(query.trim().toLowerCase());
        return (
          matchesQuery &&
          (filter === "الكل" ||
            filter === volume.category ||
            filter === volume.level)
        );
      }),
    [filter, query],
  );
  const selectedVolume =
    chessLibrary.find((volume) => volume.id === selectedBookId) ?? null;
  const selectedChapter = selectedVolume?.chapters[chapterIndex] ?? null;
  const totalChapters = chessLibrary.reduce(
    (total, volume) => total + volume.chapters.length,
    0,
  );
  const lastReadVolume = progress.lastRead
    ? chessLibrary.find((volume) => volume.id === progress.lastRead?.bookId)
    : undefined;
  const lastReadIndex =
    lastReadVolume?.chapters.findIndex(
      (chapter) => chapter.id === progress.lastRead?.chapterId,
    ) ?? -1;
  const lastReadChapter =
    lastReadVolume && lastReadIndex >= 0
      ? lastReadVolume.chapters[lastReadIndex]
      : undefined;

  const persist = (next: LearningProgress) => {
    if (!progressLoaded) return;
    setProgress(next);
    void saveLearningProgress(next);
  };

  const openVolume = (volume: ChessLibraryVolume, resume = false) => {
    if (!progressLoaded) return;
    const savedIndex =
      resume && progress.lastRead?.bookId === volume.id
        ? volume.chapters.findIndex(
            (chapter) => chapter.id === progress.lastRead?.chapterId,
          )
        : 0;
    const targetIndex = savedIndex >= 0 ? savedIndex : 0;
    setSelectedBookId(volume.id);
    setChapterIndex(targetIndex);
    const firstUnread = volume.chapters[targetIndex];
    if (progressLoaded && firstUnread) {
      persist({
        ...progress,
        lastRead: { bookId: volume.id, chapterId: firstUnread.id },
      });
    }
  };

  useEffect(() => {
    if (
      !progressLoaded ||
      !requestedVolume ||
      selectedBookId === requestedVolume ||
      autoOpenedVolume === requestedVolume
    )
      return;
    const volume = chessLibrary.find((item) => item.id === requestedVolume);
    if (!volume) return;
    const savedIndex =
      progress.lastRead?.bookId === volume.id
        ? volume.chapters.findIndex(
            (chapter) => chapter.id === progress.lastRead?.chapterId,
          )
        : 0;
    const targetIndex = savedIndex >= 0 ? savedIndex : 0;
    const chapter = volume.chapters[targetIndex];
    const nextProgress = chapter
      ? {
          ...progress,
          lastRead: { bookId: volume.id, chapterId: chapter.id },
        }
      : progress;
    startTransition(() => {
      setAutoOpenedVolume(requestedVolume);
      setSelectedBookId(volume.id);
      setChapterIndex(targetIndex);
      if (chapter) setProgress(nextProgress);
    });
    if (chapter) {
      void saveLearningProgress(nextProgress);
    }
  }, [
    autoOpenedVolume,
    progress,
    progressLoaded,
    requestedVolume,
    selectedBookId,
  ]);

  useEffect(() => {
    if (requestedVolume || autoOpenedVolume === null) return;
    startTransition(() => setAutoOpenedVolume(null));
  }, [autoOpenedVolume, requestedVolume]);

  const closeReader = () => {
    setSelectedBookId(null);
    if (requestedVolume) router.setParams({ volume: undefined });
    else setAutoOpenedVolume(null);
  };

  const openChapter = (index: number) => {
    if (!progressLoaded || !selectedVolume) return;
    const chapter = selectedVolume.chapters[index];
    if (!chapter) return;
    setChapterIndex(index);
    persist({
      ...progress,
      lastRead: { bookId: selectedVolume.id, chapterId: chapter.id },
    });
  };

  const toggleChapterId = (
    key: string,
    field: "bookmarkedChapterIds" | "completedChapterIds",
  ) => {
    if (!progressLoaded) return;
    const current = progress[field];
    const nextValues = current.includes(key)
      ? current.filter((item) => item !== key)
      : [...current, key];
    persist({ ...progress, [field]: nextValues });
  };

  const chapterId =
    selectedVolume && selectedChapter
      ? chapterKey(selectedVolume.id, selectedChapter.id)
      : "";
  const isBookmarked = progress.bookmarkedChapterIds.includes(chapterId);
  const isCompleted = progress.completedChapterIds.includes(chapterId);

  return (
    <ScreenShell
      title="مكتبة Haven Chess"
      subtitle="كتب وفصول شطرنج أصلية تقرؤها هنا، وتبقى متاحة دون اتصال بالإنترنت."
    >
      <Surface style={styles.libraryHero}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroGlyph}>♜</Text>
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.heroTitle}>
            {chessLibrary.length} مجلدات تعليمية
          </Text>
          <Text style={styles.heroText}>
            {totalChapters} فصلًا أصليًا من القواعد حتى الدراسة المتقدمة.
          </Text>
          <Text style={styles.heroFootnote}>
            محتوى داخل التطبيق — لا يحتاج إلى متصفح
          </Text>
        </View>
      </Surface>

      {lastReadVolume && lastReadChapter ? (
        <Pressable
          disabled={!progressLoaded}
          onPress={() => openVolume(lastReadVolume, true)}
        >
          <Surface style={styles.resumeCard}>
            <View style={styles.resumeButton}>
              <Text style={styles.resumeButtonText}>تابع القراءة</Text>
            </View>
            <View style={styles.resumeCopy}>
              <Text style={styles.resumeEyebrow}>آخر موضع محفوظ</Text>
              <Text style={styles.resumeTitle}>{lastReadVolume.title}</Text>
              <Text style={styles.resumeChapter}>{lastReadChapter.title}</Text>
            </View>
          </Surface>
        </Pressable>
      ) : null}

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="ابحث في عناوين الكتب والفصول والنصوص"
        placeholderTextColor="#9B9183"
        style={styles.search}
        textAlign="right"
        autoCorrect={false}
      />
      <ScrollView
        horizontal
        style={styles.filterViewport}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {categories.map((item) => (
          <Pressable key={item} onPress={() => setFilter(item)}>
            <Tag active={filter === item}>{item}</Tag>
          </Pressable>
        ))}
        {(["تمهيدي", "متوسط", "متقدم"] as const).map((item) => (
          <Pressable key={item} onPress={() => setFilter(item)}>
            <Tag active={filter === item}>{item}</Tag>
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.resultHeader}>
        <Text style={styles.resultCount}>{volumes.length} مجلد</Text>
        <Text style={styles.resultTitle}>اختر رفًّا وابدأ القراءة</Text>
      </View>

      {volumes.map((volume, index) => {
        const completed = volume.chapters.filter((chapter) =>
          progress.completedChapterIds.includes(
            chapterKey(volume.id, chapter.id),
          ),
        ).length;
        return (
          <Pressable
            key={volume.id}
            disabled={!progressLoaded}
            onPress={() => openVolume(volume)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Surface style={styles.bookCard}>
              <View style={styles.bookNumber}>
                <Text style={styles.bookNumberText}>
                  {String(index + 1).padStart(2, "0")}
                </Text>
              </View>
              <View style={styles.bookBody}>
                <View style={styles.bookTopLine}>
                  <Tag>{volume.level}</Tag>
                  <Text style={styles.category}>{volume.category}</Text>
                </View>
                <Text style={styles.bookTitle}>{volume.title}</Text>
                <Text style={styles.bookDescription} numberOfLines={3}>
                  {volume.description}
                </Text>
                <View style={styles.bookFooter}>
                  <Text style={styles.chapterMeta}>
                    {completed}/{volume.chapters.length} فصول مكتملة
                  </Text>
                  <Text style={styles.chapterMeta}>
                    {volume.chapters.length} فصول
                  </Text>
                </View>
              </View>
            </Surface>
          </Pressable>
        );
      })}

      {volumes.length === 0 ? (
        <Surface>
          <Text style={styles.emptyText}>
            {chessLibrary.length === 0
              ? "جارٍ تجهيز رفوف المكتبة."
              : "ما لقينا نتيجة؛ جرّب اسم فصل أو موضوعًا آخر."}
          </Text>
        </Surface>
      ) : null}

      <Surface style={styles.rightsCard}>
        <Text style={styles.rightsTitle}>
          محتوى أصلي للقراءة داخل Haven Chess
        </Text>
        <Text style={styles.rightsText}>
          هذه الفصول من إعداد التطبيق. قائمة المراجع المنشورة لا تعني أننا نوزّع
          كتبًا محمية؛ نضيف النصوص الكاملة فقط إذا كانت مرخّصة أو ضمن الملك
          العام.
        </Text>
      </Surface>

      <Modal
        visible={!!selectedVolume && !!selectedChapter}
        animationType="slide"
        onRequestClose={closeReader}
      >
        <View style={styles.reader}>
          <View style={styles.readerTopBar}>
            <Pressable onPress={closeReader} style={styles.readerClose}>
              <Text style={styles.readerCloseText}>إغلاق</Text>
            </Pressable>
            <View style={styles.readerTitleWrap}>
              <Text style={styles.readerBookTitle} numberOfLines={1}>
                {selectedVolume?.title}
              </Text>
              <Text style={styles.readerChapterCounter}>
                الفصل {chapterIndex + 1} من{" "}
                {selectedVolume?.chapters.length ?? 0}
              </Text>
            </View>
            <Pressable
              disabled={!progressLoaded}
              onPress={() => toggleChapterId(chapterId, "bookmarkedChapterIds")}
              style={styles.readerSave}
            >
              <Text style={styles.readerSaveText}>
                {isBookmarked ? "★" : "☆"}
              </Text>
            </Pressable>
          </View>
          {selectedChapter ? (
            <ScrollView
              contentContainerStyle={styles.readerScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.readerCategory}>
                {selectedVolume?.category} · {selectedVolume?.level}
              </Text>
              <Text style={styles.readerChapterTitle}>
                {selectedChapter.title}
              </Text>
              {selectedChapter.body
                .split(/\n\s*\n/)
                .filter(Boolean)
                .map((paragraph, paragraphIndex) => (
                  <Text
                    key={`${selectedChapter.id}-${paragraphIndex}`}
                    style={styles.readerBody}
                  >
                    {paragraph}
                  </Text>
                ))}
              <View style={styles.exampleCard}>
                <Text style={styles.exampleTitle}>مثال على الرقعة</Text>
                <Text style={styles.exampleText}>
                  {selectedChapter.boardExample}
                </Text>
              </View>
              <Pressable
                disabled={!progressLoaded}
                onPress={() =>
                  toggleChapterId(chapterId, "completedChapterIds")
                }
                style={[
                  styles.completeButton,
                  isCompleted && styles.completeButtonDone,
                ]}
              >
                <Text style={styles.completeButtonText}>
                  {isCompleted ? "تمت قراءة هذا الفصل ✓" : "علّم الفصل كمكتمل"}
                </Text>
              </Pressable>
              <View style={styles.readerNavigation}>
                <Pressable
                  disabled={
                    !progressLoaded ||
                    chapterIndex >= (selectedVolume?.chapters.length ?? 0) - 1
                  }
                  onPress={() => openChapter(chapterIndex + 1)}
                  style={[
                    styles.navButton,
                    (!progressLoaded ||
                      chapterIndex >=
                        (selectedVolume?.chapters.length ?? 0) - 1) &&
                      styles.navButtonDisabled,
                  ]}
                >
                  <Text style={styles.navButtonText}>الفصل التالي ←</Text>
                </Pressable>
                <Pressable
                  disabled={!progressLoaded || chapterIndex <= 0}
                  onPress={() => openChapter(chapterIndex - 1)}
                  style={[
                    styles.navButton,
                    (!progressLoaded || chapterIndex <= 0) &&
                      styles.navButtonDisabled,
                  ]}
                >
                  <Text style={styles.navButtonText}>→ السابق</Text>
                </Pressable>
              </View>
              <Text style={styles.offlineNote}>
                تم حفظ موضع القراءة على هذا الجهاز.
              </Text>
            </ScrollView>
          ) : (
            <ActivityIndicator color={chessColors.brass} />
          )}
        </View>
      </Modal>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  libraryHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: chessColors.forest,
  },
  heroBadge: {
    width: 48,
    height: 58,
    borderRadius: 13,
    backgroundColor: chessColors.forestLight,
    alignItems: "center",
    justifyContent: "center",
  },
  heroGlyph: { color: "#E6C66D", fontSize: 32 },
  heroCopy: { flex: 1, alignItems: "flex-end" },
  heroTitle: {
    color: "#FFF8E9",
    fontSize: 17,
    fontWeight: "900",
    textAlign: "right",
  },
  heroText: {
    color: "#D5DFD6",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "right",
    marginTop: 4,
  },
  heroFootnote: {
    color: "#E6C66D",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "right",
    marginTop: 6,
  },
  resumeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9F5ED",
  },
  resumeButton: {
    backgroundColor: chessColors.walnut,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  resumeButtonText: { color: "#FFF9EF", fontSize: 11, fontWeight: "800" },
  resumeCopy: { flex: 1, alignItems: "flex-end", marginEnd: 12 },
  resumeEyebrow: { color: chessColors.brass, fontSize: 10, fontWeight: "800" },
  resumeTitle: {
    color: chessColors.ink,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right",
    marginTop: 3,
  },
  resumeChapter: {
    color: chessColors.muted,
    fontSize: 11,
    textAlign: "right",
    marginTop: 2,
  },
  search: {
    minHeight: 46,
    backgroundColor: chessColors.card,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: chessColors.border,
    paddingHorizontal: 14,
    color: chessColors.ink,
    fontSize: 13,
  },
  filterViewport: { width: "100%", flexGrow: 0 },
  filters: { flexDirection: "row", gap: 7, paddingVertical: 3 },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  resultCount: { color: chessColors.muted, fontSize: 11 },
  resultTitle: { color: chessColors.ink, fontSize: 14, fontWeight: "800" },
  bookCard: {
    flexDirection: "row",
    gap: 13,
    alignItems: "flex-start",
    padding: 14,
  },
  bookNumber: {
    width: 36,
    height: 44,
    borderRadius: 11,
    backgroundColor: chessColors.brassSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  bookNumberText: {
    color: chessColors.walnut,
    fontSize: 12,
    fontWeight: "900",
  },
  bookBody: { flex: 1, alignItems: "flex-end" },
  bookTopLine: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bookTitle: {
    width: "100%",
    color: chessColors.ink,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "right",
    marginTop: 7,
  },
  bookDescription: {
    color: "#675F56",
    fontSize: 12,
    textAlign: "right",
    lineHeight: 18,
    marginTop: 7,
  },
  bookFooter: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  chapterMeta: { color: chessColors.muted, fontSize: 10 },
  category: { color: chessColors.brass, fontSize: 11, fontWeight: "700" },
  emptyText: { color: chessColors.muted, textAlign: "center", fontSize: 13 },
  rightsCard: { backgroundColor: "#F9F5ED" },
  rightsTitle: {
    color: chessColors.walnut,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
  },
  rightsText: {
    color: chessColors.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "right",
    marginTop: 5,
  },
  pressed: { opacity: 0.78 },
  reader: { flex: 1, backgroundColor: chessColors.paper },
  readerTopBar: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: chessColors.border,
    gap: 10,
  },
  readerClose: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#F0E7D8",
  },
  readerCloseText: {
    color: chessColors.walnut,
    fontSize: 11,
    fontWeight: "800",
  },
  readerTitleWrap: { flex: 1, alignItems: "flex-end" },
  readerBookTitle: {
    color: chessColors.ink,
    fontSize: 14,
    fontWeight: "900",
    maxWidth: "100%",
  },
  readerChapterCounter: {
    color: chessColors.muted,
    fontSize: 10,
    marginTop: 3,
  },
  readerSave: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0E7D8",
  },
  readerSaveText: { color: chessColors.brass, fontSize: 22, fontWeight: "900" },
  readerScroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 15,
  },
  readerCategory: {
    color: chessColors.brass,
    textAlign: "right",
    fontSize: 11,
    fontWeight: "800",
  },
  readerChapterTitle: {
    color: chessColors.ink,
    textAlign: "right",
    fontSize: 23,
    lineHeight: 32,
    fontWeight: "900",
    marginBottom: 3,
  },
  readerBody: {
    color: "#4E4942",
    textAlign: "right",
    fontSize: 15,
    lineHeight: 27,
  },
  exampleCard: {
    borderRadius: 15,
    backgroundColor: "#F0E7D8",
    borderWidth: 1,
    borderColor: chessColors.border,
    padding: 15,
    marginTop: 5,
  },
  exampleTitle: {
    color: chessColors.walnut,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 7,
  },
  exampleText: {
    color: chessColors.ink,
    textAlign: "right",
    fontSize: 13,
    lineHeight: 22,
  },
  completeButton: {
    minHeight: 45,
    borderRadius: 13,
    backgroundColor: chessColors.walnut,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },
  completeButtonDone: { backgroundColor: "#59714D" },
  completeButtonText: { color: "#FFF9EF", fontSize: 12, fontWeight: "800" },
  readerNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  navButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: chessColors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: chessColors.card,
  },
  navButtonDisabled: { opacity: 0.4 },
  navButtonText: { color: chessColors.walnut, fontSize: 11, fontWeight: "800" },
  offlineNote: {
    textAlign: "center",
    color: chessColors.muted,
    fontSize: 10,
    marginTop: 2,
  },
});
