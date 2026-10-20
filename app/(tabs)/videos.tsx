import * as WebBrowser from "expo-web-browser";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  ScreenShell,
  SectionHeading,
  Surface,
  Tag,
} from "@/components/chess-layout";
import { chessColors } from "@/constants/chess-theme";
import { chessLearningVideos } from "@/shared/chess-content";

export default function VideosScreen() {
  return (
    <ScreenShell
      title="شاهد وتعلّم"
      subtitle="دروس شطرنج منظمة بحسب الموضوع، مع مصادر المشاهدة."
    >
      <Surface style={styles.hero}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroPlay}>▶</Text>
        </View>
        <Text style={styles.heroEyebrow}>دراسة مرئية</Text>
        <Text style={styles.heroTitle}>الفكرة أوضح حين تراها على الرقعة</Text>
        <Text style={styles.heroBody}>
          اختر درسًا لفتح مصدر الفيديو. بعد المشاهدة، جرّب الفكرة على اللوحة
          واستعرض النقلات بالمحلّل.
        </Text>
      </Surface>
      <SectionHeading
        title="مكتبة الفيديو"
        detail={`${chessLearningVideos.length} موضوعات`}
      />
      {chessLearningVideos.map((video, index) => (
        <Surface key={video.id} style={styles.videoCard}>
          <View style={styles.videoCardHeader}>
            <View style={styles.videoNumber}>
              <Text style={styles.videoNumberText}>
                {String(index + 1).padStart(2, "0")}
              </Text>
            </View>
            <View style={styles.videoTitles}>
              <Text style={styles.videoTitle}>{video.title}</Text>
              <Text style={styles.videoTopic}>{video.topic}</Text>
            </View>
          </View>
          <Text style={styles.videoDescription}>{video.description}</Text>
          <View style={styles.videoFooter}>
            <Tag>{video.sourceLabel}</Tag>
            <Pressable
              onPress={() => WebBrowser.openBrowserAsync(video.url)}
              style={({ pressed }) => [
                styles.watchButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.watchText}>شاهد الدرس</Text>
              <Text style={styles.watchIcon}>↗</Text>
            </Pressable>
          </View>
        </Surface>
      ))}
      <Surface style={styles.sourceNote}>
        <Text style={styles.sourceNoteTitle}>المصادر تبقى عند أصحابها</Text>
        <Text style={styles.sourceNoteBody}>
          يفتح التطبيق صفحات المشاهدة الرسمية ولا ينسخ مقاطع الفيديو أو يستضيفها
          دون إذن.
        </Text>
      </Surface>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "flex-end",
    backgroundColor: chessColors.forest,
    overflow: "hidden",
    padding: 18,
  },
  heroBadge: {
    position: "absolute",
    top: 17,
    left: 17,
    width: 47,
    height: 47,
    borderRadius: 16,
    backgroundColor: "rgba(255, 248, 234, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 248, 234, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroPlay: { color: "#F8E7C9", fontSize: 18, marginStart: 2 },
  heroEyebrow: { color: "#DBBF91", fontSize: 11, fontWeight: "800" },
  heroTitle: {
    color: "#FFF7E9",
    fontSize: 19,
    lineHeight: 27,
    textAlign: "right",
    fontWeight: "900",
    marginTop: 7,
    maxWidth: "86%",
  },
  heroBody: {
    color: "#E0D1BA",
    fontSize: 12,
    textAlign: "right",
    lineHeight: 19,
    marginTop: 8,
  },
  videoCard: { padding: 15 },
  videoCardHeader: { flexDirection: "row", alignItems: "center", gap: 11 },
  videoNumber: {
    width: 37,
    height: 42,
    borderRadius: 12,
    backgroundColor: chessColors.brassSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  videoNumberText: {
    color: chessColors.walnut,
    fontSize: 12,
    fontWeight: "900",
  },
  videoTitles: { flex: 1, alignItems: "flex-end" },
  videoTitle: {
    color: chessColors.ink,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right",
  },
  videoTopic: {
    color: chessColors.brass,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "right",
    marginTop: 4,
  },
  videoDescription: {
    color: chessColors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "right",
    marginTop: 12,
  },
  videoFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
    marginTop: 13,
  },
  watchButton: {
    minHeight: 35,
    borderRadius: 11,
    paddingHorizontal: 11,
    backgroundColor: chessColors.forestSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  watchText: { color: chessColors.forest, fontSize: 11, fontWeight: "800" },
  watchIcon: { color: chessColors.brass, fontSize: 14, fontWeight: "900" },
  sourceNote: { backgroundColor: chessColors.forestSoft },
  sourceNoteTitle: {
    color: chessColors.forest,
    textAlign: "right",
    fontSize: 12,
    fontWeight: "900",
  },
  sourceNoteBody: {
    color: chessColors.muted,
    textAlign: "right",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  pressed: { opacity: 0.76 },
});
