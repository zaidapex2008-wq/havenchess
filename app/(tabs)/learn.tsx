import { useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  ScreenShell,
  SectionHeading,
  Surface,
  Tag,
} from "@/components/chess-layout";
import { chessColors } from "@/constants/chess-theme";
import { chessLessons, type ChessLesson } from "@/shared/chess-content";
import { chessLibrary } from "@/shared/chess-library";
import {
  emptyLearningProgress,
  loadLearningProgress,
  type LearningProgress,
} from "@/lib/chess/learning-progress";

const stages = [
  {
    level: "تمهيدي",
    title: "ابنِ الأساس",
    detail: "القواعد، قراءة الرقعة، ومبادئ أول مباراة.",
    color: "#F0E7D8",
  },
  {
    level: "متوسط",
    title: "افهم الخطة والحساب",
    detail: "التكتيك التفسيري، الخطط، والحساب المنظم.",
    color: "#F5F0E5",
  },
  {
    level: "متقدم",
    title: "حلّل وراجع لعبك",
    detail: "النهايات، المباريات، وتطوير أسلوب الدراسة.",
    color: "#EEE7DB",
  },
] as const;

export default function LearnScreen() {
  const router = useRouter();
  const [openLesson, setOpenLesson] = useState<string | null>(
    chessLessons[0]?.id ?? null,
  );
  const [progress, setProgress] = useState<LearningProgress>(
    emptyLearningProgress,
  );
  const [activeLevel, setActiveLevel] =
    useState<(typeof stages)[number]["level"]>("تمهيدي");

  useEffect(() => {
    loadLearningProgress().then(setProgress);
  }, []);

  const totalChapters = useMemo(
    () =>
      chessLibrary.reduce((total, volume) => total + volume.chapters.length, 0),
    [],
  );
  const completedCount = progress.completedChapterIds.length;
  const progressPercent = totalChapters
    ? Math.min(100, Math.round((completedCount / totalChapters) * 100))
    : 0;
  const activeStage =
    stages.find((stage) => stage.level === activeLevel) ?? stages[0];
  const stageVolumes = chessLibrary.filter(
    (volume) => volume.level === activeLevel,
  );

  return (
    <ScreenShell
      title="مسارك في الشطرنج"
      subtitle="من فهم القواعد إلى قراءة الخطط وتحليل المباريات، خطوة واضحة في كل مرحلة."
    >
      <Surface style={styles.pathCard}>
        <View style={styles.pathTop}>
          <Tag active>من التأسيس إلى التقدم</Tag>
          <Text style={styles.pathTitle}>تعلّم بالترتيب، وطبّق على الرقعة</Text>
        </View>
        <Text style={styles.pathText}>
          ابدأ بالقواعد ثم انتقل إلى الافتتاح والتخطيط والحساب والنهايات. لا
          توجد قفزة سحرية إلى الاحتراف؛ التحسن يأتي من الدراسة المنتظمة واللعب
          ومراجعة قراراتك.
        </Text>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>
        <Text style={styles.progressCaption}>
          {completedCount} من {totalChapters} فصلًا أُنجز · التقدم محفوظ على هذا
          الجهاز
        </Text>
      </Surface>

      <SectionHeading title="مراحل التعلّم" detail="اختر مستواك الحالي" />
      <View style={styles.stageTabs}>
        {stages.map((stage) => (
          <Pressable
            key={stage.level}
            onPress={() => setActiveLevel(stage.level)}
            style={[
              styles.stageTab,
              activeLevel === stage.level && styles.stageTabActive,
            ]}
          >
            <Text
              style={[
                styles.stageTabText,
                activeLevel === stage.level && styles.stageTabTextActive,
              ]}
            >
              {stage.level}
            </Text>
          </Pressable>
        ))}
      </View>
      <Surface
        style={[styles.stageCard, { backgroundColor: activeStage.color }]}
      >
        <Text style={styles.stageTitle}>{activeStage.title}</Text>
        <Text style={styles.stageDetail}>{activeStage.detail}</Text>
        {stageVolumes.length ? (
          stageVolumes.map((volume) => {
            const completed = volume.chapters.filter((chapter) =>
              progress.completedChapterIds.includes(
                `${volume.id}:${chapter.id}`,
              ),
            ).length;
            return (
              <Pressable
                key={volume.id}
                onPress={() =>
                  router.push({
                    pathname: "/books",
                    params: { volume: volume.id },
                  })
                }
                style={({ pressed }) => [
                  styles.volumeRow,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.volumeButton}>
                  <Text style={styles.volumeButtonText}>ابدأ القراءة ←</Text>
                </View>
                <View style={styles.volumeCopy}>
                  <Text style={styles.volumeTitle}>{volume.title}</Text>
                  <Text style={styles.volumeMeta}>
                    {completed}/{volume.chapters.length} فصول ·{" "}
                    {volume.category}
                  </Text>
                </View>
              </Pressable>
            );
          })
        ) : (
          <Text style={styles.stageEmpty}>
            لا يوجد مجلد في هذه المرحلة حاليًا.
          </Text>
        )}
      </Surface>

      <SectionHeading
        title="دروس تطبيقية قصيرة"
        detail="افتح الشرح ثم جرّب على اللوحة"
      />
      {chessLessons.map((lesson, index) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          index={index}
          expanded={openLesson === lesson.id}
          onToggle={() =>
            setOpenLesson((current) =>
              current === lesson.id ? null : lesson.id,
            )
          }
          onPractice={() => router.push("/")}
        />
      ))}
      <Surface style={styles.learnNote}>
        <Text style={styles.learnNoteTitle}>الكتب والدروس تعمل دون متصفح</Text>
        <Text style={styles.learnNoteText}>
          فصول المكتبة الأصلية موجودة داخل التطبيق. افتح قسم الكتب لمتابعة فصل
          أو استعراض المجلدات حسب الموضوع.
        </Text>
      </Surface>
    </ScreenShell>
  );
}

function LessonCard({
  lesson,
  index,
  expanded,
  onToggle,
  onPractice,
}: {
  lesson: ChessLesson;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onPractice: () => void;
}) {
  return (
    <Surface style={styles.lessonCard}>
      <Pressable onPress={onToggle} style={styles.lessonHeader}>
        <View style={styles.lessonNumber}>
          <Text style={styles.lessonNumberText}>
            {String(index + 1).padStart(2, "0")}
          </Text>
        </View>
        <View style={styles.lessonHeadingCopy}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonLevel}>
            {lesson.level} · {lesson.concepts.join(" / ")}
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? "−" : "+"}</Text>
      </Pressable>
      {expanded ? (
        <View style={styles.lessonExpanded}>
          <Text style={styles.explanation}>{lesson.explanation}</Text>
          <Text style={styles.exerciseTitle}>مثال تطبيقي على الرقعة</Text>
          <Text style={styles.exerciseIntro}>
            {lesson.exercise.instruction}
          </Text>
          {lesson.exercise.steps.map((step, stepIndex) => (
            <View key={`${lesson.id}-${stepIndex}`} style={styles.stepRow}>
              <Text style={styles.stepText}>{step}</Text>
              <View style={styles.stepDot}>
                <Text style={styles.stepNumber}>{stepIndex + 1}</Text>
              </View>
            </View>
          ))}
          <Pressable
            onPress={onPractice}
            style={({ pressed }) => [
              styles.practiceButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.practiceButtonText}>افتح الرقعة وجرّب</Text>
            <Text style={styles.practiceArrow}>←</Text>
          </Pressable>
        </View>
      ) : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  pathCard: { backgroundColor: chessColors.forestSoft, overflow: "hidden" },
  pathTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  pathTitle: {
    color: chessColors.forest,
    fontSize: 14,
    fontWeight: "900",
    flex: 1,
    textAlign: "right",
  },
  pathText: {
    color: chessColors.muted,
    textAlign: "right",
    fontSize: 12,
    lineHeight: 20,
    marginTop: 11,
  },
  progressTrack: {
    height: 6,
    borderRadius: 99,
    backgroundColor: "#E0D0B8",
    marginTop: 15,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 99,
    backgroundColor: chessColors.brass,
  },
  progressCaption: {
    color: chessColors.muted,
    textAlign: "right",
    fontSize: 10,
    marginTop: 7,
  },
  stageTabs: { flexDirection: "row", gap: 8 },
  stageTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: chessColors.card,
    borderWidth: 1,
    borderColor: chessColors.border,
    alignItems: "center",
  },
  stageTabActive: {
    backgroundColor: chessColors.forest,
    borderColor: chessColors.forest,
  },
  stageTabText: { color: chessColors.muted, fontSize: 11, fontWeight: "800" },
  stageTabTextActive: { color: "#FFF9EF" },
  stageCard: { gap: 10 },
  stageTitle: {
    color: chessColors.forest,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "right",
  },
  stageDetail: {
    color: chessColors.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "right",
    marginTop: -5,
  },
  volumeRow: {
    minHeight: 56,
    borderTopWidth: 1,
    borderTopColor: "rgba(100,75,45,0.14)",
    paddingTop: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  volumeCopy: { flex: 1, alignItems: "flex-end" },
  volumeTitle: {
    color: chessColors.ink,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
  },
  volumeMeta: {
    color: chessColors.muted,
    fontSize: 10,
    textAlign: "right",
    marginTop: 3,
  },
  volumeButton: {
    backgroundColor: "#FFFCF7",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 9,
  },
  volumeButtonText: {
    color: chessColors.walnut,
    fontSize: 10,
    fontWeight: "800",
  },
  stageEmpty: { color: chessColors.muted, textAlign: "right", fontSize: 11 },
  lessonCard: { padding: 0, overflow: "hidden" },
  lessonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 14,
  },
  lessonNumber: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: chessColors.brassSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  lessonNumberText: {
    color: chessColors.walnut,
    fontSize: 11,
    fontWeight: "900",
  },
  lessonHeadingCopy: { flex: 1, alignItems: "flex-end" },
  lessonTitle: {
    color: chessColors.ink,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right",
  },
  lessonLevel: {
    color: chessColors.muted,
    fontSize: 10,
    textAlign: "right",
    marginTop: 4,
  },
  chevron: {
    color: chessColors.brass,
    fontSize: 22,
    width: 22,
    textAlign: "center",
    fontWeight: "600",
  },
  lessonExpanded: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderTopWidth: 1,
    borderTopColor: chessColors.border,
  },
  explanation: {
    color: "#5F594F",
    fontSize: 12,
    lineHeight: 20,
    textAlign: "right",
    marginTop: 12,
  },
  exerciseTitle: {
    color: chessColors.walnut,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
    marginTop: 15,
  },
  exerciseIntro: {
    color: chessColors.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "right",
    marginTop: 5,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 10,
  },
  stepText: {
    flex: 1,
    color: chessColors.ink,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "right",
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: chessColors.brassSoft,
  },
  stepNumber: { color: chessColors.walnut, fontSize: 10, fontWeight: "900" },
  practiceButton: {
    height: 43,
    borderRadius: 12,
    backgroundColor: chessColors.walnut,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 13,
    marginTop: 14,
  },
  practiceButtonText: { color: "#FFF9EF", fontSize: 12, fontWeight: "800" },
  practiceArrow: { color: "#F4DCB5", fontSize: 17, fontWeight: "900" },
  learnNote: { backgroundColor: "#F9F5ED" },
  learnNoteTitle: {
    color: chessColors.walnut,
    fontSize: 13,
    textAlign: "right",
    fontWeight: "900",
  },
  learnNoteText: {
    color: chessColors.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "right",
    marginTop: 6,
  },
  pressed: { opacity: 0.78 },
});
