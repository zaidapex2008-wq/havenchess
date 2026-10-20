import type { ReactNode } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { chessColors, chessSpacing } from "@/constants/chess-theme";

export function ScreenShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Image
              source={require("@/assets/images/icon.png")}
              resizeMode="cover"
              style={styles.brandImage}
            />
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.brandTitle}>Haven Chess</Text>
            <Text style={styles.brandCaption}>أكاديمية اللعب والفهم</Text>
          </View>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>HC</Text>
          </View>
        </View>
        <View style={styles.pageHeading}>
          <Text style={styles.pageTitle}>{title}</Text>
          {subtitle ? (
            <Text style={styles.pageSubtitle}>{subtitle}</Text>
          ) : null}
        </View>
        <View style={styles.content}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function Surface({
  children,
  style,
}: {
  children: ReactNode;
  style?: object;
}) {
  return <View style={[styles.surface, style]}>{children}</View>;
}

export function SectionHeading({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}
    </View>
  );
}

export function Tag({
  children,
  active = false,
}: {
  children: ReactNode;
  active?: boolean;
}) {
  return (
    <View style={[styles.tag, active && styles.tagActive]}>
      <Text style={[styles.tagText, active && styles.tagTextActive]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: chessColors.paper },
  scrollContent: {
    paddingHorizontal: chessSpacing.page,
    paddingTop: 10,
    paddingBottom: 40,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 21,
    padding: 11,
    borderRadius: 19,
    backgroundColor: chessColors.forest,
    borderWidth: 1,
    borderColor: chessColors.brass,
    shadowColor: chessColors.forest,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  brandMark: {
    width: 47,
    height: 47,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: chessColors.walnut,
    borderWidth: 1.5,
    borderColor: chessColors.brass,
    alignItems: "center",
    justifyContent: "center",
  },
  brandImage: { width: 46, height: 46, position: "absolute" },
  brandCopy: { flex: 1, marginStart: 12 },
  brandTitle: {
    color: "#FFF8EA",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  brandCaption: {
    color: "#D6C59E",
    fontSize: 11,
    marginTop: 3,
    textAlign: "right",
    fontWeight: "700",
  },
  brandBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: chessColors.brass,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: chessColors.forestLight,
  },
  brandBadgeText: {
    color: "#F2D590",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  pageHeading: { marginBottom: 17, paddingHorizontal: 2 },
  pageTitle: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "900",
    color: chessColors.forest,
    textAlign: "right",
  },
  pageSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: chessColors.muted,
    textAlign: "right",
    marginTop: 5,
  },
  content: { gap: 14 },
  surface: {
    backgroundColor: chessColors.card,
    borderRadius: 19,
    padding: 16,
    borderWidth: 1,
    borderColor: chessColors.border,
    shadowColor: chessColors.forest,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    color: chessColors.forest,
    fontWeight: "900",
    fontSize: 16,
    textAlign: "right",
  },
  sectionDetail: { color: chessColors.muted, fontSize: 11, textAlign: "left" },
  tag: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: chessColors.forestSoft,
    borderWidth: 1,
    borderColor: "#C5D4C9",
  },
  tagActive: {
    backgroundColor: chessColors.brassSoft,
    borderColor: chessColors.brass,
  },
  tagText: { color: chessColors.forest, fontSize: 11, fontWeight: "700" },
  tagTextActive: { color: chessColors.forest, fontWeight: "900" },
});
