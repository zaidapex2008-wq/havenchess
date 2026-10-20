import { StyleSheet, Text, View } from "react-native";
import { ScreenShell, Surface, Tag } from "@/components/chess-layout";
import { chessColors } from "@/constants/chess-theme";
import { developerInfo } from "@/shared/chess-content";

export default function AboutScreen() {
  return (
    <ScreenShell
      title="عن Haven Chess"
      subtitle="تطبيق تعلّم وتحليل مخصص للشطرنج فقط."
    >
      <Surface style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarPiece}>♞</Text>
        </View>
        <Tag active>{developerInfo.description}</Tag>
        <Text style={styles.developerName}>{developerInfo.name}</Text>
        <Text style={styles.developerCaption}>مطوّر تطبيق Haven Chess</Text>
      </Surface>
      <Surface style={styles.missionCard}>
        <Text style={styles.missionEyebrow}>فكرة التطبيق</Text>
        <Text style={styles.missionTitle}>العب. افهم. طوّر خطتك.</Text>
        <Text style={styles.missionBody}>
          يجمع Haven Chess بين لوحة كلاسيكية، ومواد تعليم منظمة، ومحرك تحليل
          يساعدك على قراءة الوضعية وفهم سبب اختيار النقلة.
        </Text>
      </Surface>
      <View style={styles.valuesRow}>
        <ValueCard
          symbol="♟"
          title="الشطرنج فقط"
          description="محتوى مركز على اللعبة."
        />
        <ValueCard
          symbol="♗"
          title="تعلّم عملي"
          description="الشرح مرتبط بالرقعة."
        />
      </View>
      <Surface style={styles.footerCard}>
        <Text style={styles.footerText}>
          Haven Chess · مساحة هادئة لدراسة كل نقلة
        </Text>
      </Surface>
    </ScreenShell>
  );
}

function ValueCard({
  symbol,
  title,
  description,
}: {
  symbol: string;
  title: string;
  description: string;
}) {
  return (
    <Surface style={styles.valueCard}>
      <Text style={styles.valuePiece}>{symbol}</Text>
      <Text style={styles.valueTitle}>{title}</Text>
      <Text style={styles.valueDescription}>{description}</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    alignItems: "center",
    paddingTop: 23,
    paddingBottom: 22,
    backgroundColor: chessColors.forestSoft,
  },
  avatar: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: chessColors.forest,
    borderColor: chessColors.brass,
    borderWidth: 2,
    marginBottom: 13,
  },
  avatarPiece: {
    color: "#FFF8EA",
    fontSize: 49,
    lineHeight: 55,
    textShadowColor: "#302015",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  developerName: {
    color: chessColors.ink,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 11,
  },
  developerCaption: { color: chessColors.muted, fontSize: 12, marginTop: 4 },
  missionCard: { backgroundColor: chessColors.forest, alignItems: "flex-end" },
  missionEyebrow: { color: "#D7B98E", fontSize: 11, fontWeight: "800" },
  missionTitle: {
    color: "#FFF8EA",
    textAlign: "right",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 8,
  },
  missionBody: {
    color: "#E2D2BB",
    textAlign: "right",
    fontSize: 12,
    lineHeight: 20,
    marginTop: 8,
  },
  valuesRow: { flexDirection: "row", gap: 10 },
  valueCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 135,
    paddingHorizontal: 9,
    paddingVertical: 13,
  },
  valuePiece: { color: chessColors.brass, fontSize: 30 },
  valueTitle: {
    color: chessColors.ink,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 6,
    textAlign: "center",
  },
  valueDescription: {
    color: chessColors.muted,
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
  },
  footerCard: { backgroundColor: chessColors.forestSoft },
  footerText: { color: chessColors.muted, fontSize: 11, textAlign: "center" },
});
