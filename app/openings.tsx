import { useMemo, useState } from "react";
import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  ScreenShell,
  SectionHeading,
  Surface,
  Tag,
} from "@/components/chess-layout";
import { chessColors } from "@/constants/chess-theme";
import { chessOpenings, type ChessOpening } from "@/shared/chess-openings";

type SideFilter = "الكل" | ChessOpening["side"];
type LevelFilter = "الكل" | ChessOpening["level"];

const sideFilters: SideFilter[] = ["الكل", "الأبيض", "الأسود"];
const levelFilters: LevelFilter[] = ["الكل", "مبتدئ", "متوسط", "متقدم"];

function formatLine(san: string[]) {
  return san
    .map((move, index) =>
      index % 2 === 0 ? `${Math.floor(index / 2) + 1}. ${move}` : move,
    )
    .join("  ");
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.filterChip, active && styles.filterChipActive]}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function OpeningCard({
  opening,
  expanded,
  onPress,
}: {
  opening: ChessOpening;
  expanded: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={onPress}
      style={({ pressed }) => [styles.openingCard, pressed && styles.pressed]}
    >
      <View style={styles.openingTop}>
        <View style={styles.openingHeading}>
          <Text style={styles.openingName}>{opening.name}</Text>
          <Text style={styles.openingFamily}>{opening.family}</Text>
        </View>
        <View style={styles.tags}>
          <Tag active>{opening.side}</Tag>
          <Tag>{opening.level}</Tag>
        </View>
      </View>
      <Text style={styles.lineLabel}>خط توضيحي</Text>
      <Text style={styles.moveLine}>{formatLine(opening.san)}</Text>
      {expanded ? (
        <View style={styles.details}>
          <View style={styles.goldRule} />
          <Text style={styles.detailLabel}>الفكرة</Text>
          <Text style={styles.detailBody}>{opening.idea}</Text>
          <Text style={styles.detailLabel}>الخطة العملية</Text>
          <Text style={styles.detailBody}>{opening.plan}</Text>
          <View style={styles.cautionBox}>
            <Text style={styles.cautionTitle}>انتبه</Text>
            <Text style={styles.cautionText}>{opening.caution}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.expandHint}>اضغط لقراءة الفكرة والخطة</Text>
      )}
    </Pressable>
  );
}

export default function OpeningsScreen() {
  const [query, setQuery] = useState("");
  const [side, setSide] = useState<SideFilter>("الكل");
  const [level, setLevel] = useState<LevelFilter>("الكل");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const filteredOpenings = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ar");
    return chessOpenings.filter((opening) => {
      const matchesSide = side === "الكل" || opening.side === side;
      const matchesLevel = level === "الكل" || opening.level === level;
      const searchable = [
        opening.name,
        opening.family,
        opening.side,
        opening.level,
        opening.idea,
        opening.plan,
        opening.caution,
      ]
        .join(" ")
        .toLocaleLowerCase("ar");
      return (
        matchesSide && matchesLevel && searchable.includes(normalizedQuery)
      );
    });
  }, [level, query, side]);

  return (
    <ScreenShell
      title="موسوعة الافتتاحات"
      subtitle="افهم الفكرة والخطة، لا تحفظ النقلات وحدها."
    >
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <Text style={styles.backButtonText}>← رجوع إلى الرقعة</Text>
      </Pressable>
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>OPENING STUDIO · 08 LINES</Text>
        <Text style={styles.heroTitle}>ابدأ المباراة بخطة</Text>
        <Text style={styles.heroBody}>
          خطوط تعليمية مختارة للأبيض والأسود. كل تسلسل مثال توضيحي وليس نقلات
          إجبارية.
        </Text>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroNumber}>{chessOpenings.length}</Text>
            <Text style={styles.heroStatLabel}>أنظمة افتتاحية</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroNumber}>
              {
                chessOpenings.filter((opening) => opening.side === "الأبيض")
                  .length
              }
            </Text>
            <Text style={styles.heroStatLabel}>للأبيض</Text>
          </View>
          <View style={styles.heroDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroNumber}>
              {
                chessOpenings.filter((opening) => opening.side === "الأسود")
                  .length
              }
            </Text>
            <Text style={styles.heroStatLabel}>للأسود</Text>
          </View>
        </View>
      </View>

      <Surface style={styles.filtersSurface}>
        <SectionHeading
          title="ابحث عن افتتاح"
          detail={`${filteredOpenings.length} خطوط`}
        />
        <TextInput
          accessibilityLabel="البحث في الافتتاحات"
          value={query}
          onChangeText={setQuery}
          placeholder="الاسم أو الفكرة أو الرد…"
          placeholderTextColor="#8B8C7E"
          returnKeyType="search"
          style={styles.searchInput}
          textAlign="right"
        />
        <Text style={styles.filterLabel}>الجانب</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {sideFilters.map((item) => (
            <FilterChip
              key={item}
              label={item}
              active={side === item}
              onPress={() => setSide(item)}
            />
          ))}
        </ScrollView>
        <Text style={styles.filterLabel}>المستوى</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {levelFilters.map((item) => (
            <FilterChip
              key={item}
              label={item}
              active={level === item}
              onPress={() => setLevel(item)}
            />
          ))}
        </ScrollView>
      </Surface>

      <View style={styles.openingsList}>
        {filteredOpenings.map((opening) => (
          <OpeningCard
            key={opening.id}
            opening={opening}
            expanded={expandedId === opening.id}
            onPress={() =>
              setExpandedId((current) =>
                current === opening.id ? null : opening.id,
              )
            }
          />
        ))}
        {filteredOpenings.length === 0 ? (
          <Surface style={styles.emptyState}>
            <Text style={styles.emptyTitle}>ما لقينا هذا الافتتاح</Text>
            <Text style={styles.emptyBody}>
              جرّب اسمًا أو مستوى أو فكرة أخرى.
            </Text>
          </Surface>
        ) : null}
      </View>

      <View style={styles.note}>
        <Text style={styles.noteMark}>♜</Text>
        <Text style={styles.noteText}>
          قيم أي خط على الرقعة نفسها؛ النقلات المقترحة ليست وصفة ثابتة لكل
          مباراة.
        </Text>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  backButton: {
    minHeight: 37,
    alignSelf: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 11,
    backgroundColor: chessColors.forest,
  },
  backButtonText: { color: "#FFF8E9", fontSize: 10, fontWeight: "900" },
  hero: {
    borderRadius: 22,
    padding: 19,
    backgroundColor: chessColors.forest,
    borderWidth: 1,
    borderColor: chessColors.brass,
    overflow: "hidden",
  },
  heroEyebrow: {
    color: "#E2C87C",
    textAlign: "right",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  heroTitle: {
    color: "#FFF8E9",
    textAlign: "right",
    fontSize: 23,
    fontWeight: "900",
    marginTop: 9,
  },
  heroBody: {
    color: "#D5DFD6",
    textAlign: "right",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },
  heroStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 18,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: "rgba(229, 199, 122, 0.32)",
  },
  heroStat: { alignItems: "center", minWidth: 62 },
  heroNumber: { color: "#F0D78E", fontSize: 19, fontWeight: "900" },
  heroStatLabel: {
    color: "#D5DFD6",
    fontSize: 10,
    marginTop: 2,
    fontWeight: "700",
  },
  heroDivider: {
    width: 1,
    height: 29,
    backgroundColor: "rgba(229, 199, 122, 0.32)",
  },
  filtersSurface: { padding: 14 },
  searchInput: {
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: chessColors.border,
    backgroundColor: "#F5F1E8",
    color: chessColors.ink,
    paddingHorizontal: 13,
    fontSize: 13,
    marginBottom: 10,
  },
  filterLabel: {
    color: chessColors.muted,
    textAlign: "right",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 4,
    marginBottom: 6,
  },
  filterRow: { gap: 7, paddingVertical: 1 },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F6F1E6",
    borderWidth: 1,
    borderColor: chessColors.border,
  },
  filterChipActive: {
    backgroundColor: chessColors.forest,
    borderColor: chessColors.brass,
  },
  filterText: { color: chessColors.muted, fontSize: 11, fontWeight: "700" },
  filterTextActive: { color: "#FFF8E9", fontWeight: "900" },
  openingsList: { gap: 11 },
  openingCard: {
    padding: 15,
    borderRadius: 18,
    backgroundColor: chessColors.card,
    borderWidth: 1,
    borderColor: chessColors.border,
    borderStartWidth: 4,
    borderStartColor: chessColors.brass,
  },
  openingTop: { flexDirection: "row", alignItems: "flex-start", gap: 7 },
  openingHeading: { flex: 1 },
  openingName: {
    color: chessColors.forest,
    textAlign: "right",
    fontSize: 16,
    fontWeight: "900",
  },
  openingFamily: {
    color: chessColors.muted,
    textAlign: "right",
    fontSize: 10,
    marginTop: 3,
  },
  tags: { gap: 5, alignItems: "flex-end" },
  lineLabel: {
    color: chessColors.brass,
    textAlign: "right",
    fontSize: 10,
    fontWeight: "900",
    marginTop: 12,
  },
  moveLine: {
    color: chessColors.ink,
    textAlign: "left",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 21,
    marginTop: 5,
  },
  expandHint: {
    color: chessColors.muted,
    textAlign: "right",
    fontSize: 10,
    marginTop: 7,
  },
  details: { marginTop: 11 },
  goldRule: {
    height: 1,
    backgroundColor: chessColors.brassSoft,
    marginBottom: 12,
  },
  detailLabel: {
    color: chessColors.forest,
    textAlign: "right",
    fontSize: 11,
    fontWeight: "900",
    marginTop: 7,
  },
  detailBody: {
    color: chessColors.ink,
    textAlign: "right",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 3,
  },
  cautionBox: {
    marginTop: 11,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#F5EFE2",
    borderWidth: 1,
    borderColor: "#E7D8BB",
  },
  cautionTitle: {
    color: chessColors.walnut,
    textAlign: "right",
    fontSize: 10,
    fontWeight: "900",
  },
  cautionText: {
    color: chessColors.muted,
    textAlign: "right",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },
  emptyState: { alignItems: "center", gap: 4 },
  emptyTitle: { color: chessColors.forest, fontSize: 14, fontWeight: "900" },
  emptyBody: { color: chessColors.muted, fontSize: 11 },
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 14,
    borderRadius: 17,
    backgroundColor: chessColors.forestSoft,
    borderWidth: 1,
    borderColor: "#C7D6CA",
  },
  noteMark: { color: chessColors.brass, fontSize: 22, fontWeight: "900" },
  noteText: {
    flex: 1,
    color: chessColors.forest,
    textAlign: "right",
    fontSize: 11,
    lineHeight: 17,
    fontWeight: "700",
  },
  pressed: { opacity: 0.82 },
});
