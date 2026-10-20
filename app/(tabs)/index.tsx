import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Chess, type Square } from "chess.js";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ChessBoard } from "@/components/chess-board";
import {
  ScreenShell,
  SectionHeading,
  Surface,
  Tag,
} from "@/components/chess-layout";
import { chessColors } from "@/constants/chess-theme";
import {
  analyzePosition,
  type AnalysisMode,
  type ChessAnalysis,
} from "@/lib/chess/analysis";

type LastMove = { from: Square; to: Square } | null;
type HistoryEntry = { fen: string; san?: string; lastMove?: LastMove };
type Promotion = "q" | "r" | "b" | "n";

const initialFen = new Chess().fen();
const historyKey = "haven-chess-local-game-v1";

function isSquare(value: unknown): value is Square {
  return typeof value === "string" && /^[a-h][1-8]$/.test(value);
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  if (typeof entry.fen !== "string" || entry.fen.length > 200) return false;
  try {
    new Chess(entry.fen);
  } catch {
    return false;
  }
  if (entry.san !== undefined && typeof entry.san !== "string") return false;
  if (entry.lastMove === undefined || entry.lastMove === null) return true;
  if (typeof entry.lastMove !== "object") return false;
  const move = entry.lastMove as Record<string, unknown>;
  return isSquare(move.from) && isSquare(move.to);
}

function parseSavedGame(stored: string) {
  try {
    const value = JSON.parse(stored) as Record<string, unknown>;
    if (
      !Array.isArray(value.timeline) ||
      value.timeline.length === 0 ||
      value.timeline.length > 10_000 ||
      !value.timeline.every(isHistoryEntry)
    )
      return null;
    const lastIndex = value.timeline.length - 1;
    const cursor =
      typeof value.cursor === "number" && Number.isInteger(value.cursor)
        ? Math.max(0, Math.min(value.cursor, lastIndex))
        : lastIndex;
    return { timeline: value.timeline, cursor };
  } catch {
    return null;
  }
}

const analysisModes: { id: AnalysisMode; label: string; detail: string }[] = [
  { id: "quick", label: "سريع", detail: "0.6 ث" },
  { id: "balanced", label: "متوازن", detail: "1.7 ث" },
  { id: "deep", label: "أعمق", detail: "3.8 ث" },
];

function statusFor(game: Chess) {
  if (game.isCheckmate())
    return game.turn() === "w" ? "كش مات — الأسود فاز" : "كش مات — الأبيض فاز";
  if (game.isStalemate()) return "تعادل — جمود";
  if (game.isDraw()) return "تعادل";
  if (game.isCheck())
    return `كش على ${game.turn() === "w" ? "الأبيض" : "الأسود"}`;
  return `الدور على ${game.turn() === "w" ? "الأبيض" : "الأسود"}`;
}

function moveToSan(fen: string, uci: string) {
  const game = new Chess(fen);
  const move = game.move({
    from: uci.slice(0, 2) as Square,
    to: uci.slice(2, 4) as Square,
    ...(uci[4] ? { promotion: uci[4] as Promotion } : {}),
  });
  return { game, move };
}

export default function BoardScreen() {
  const [timeline, setTimeline] = useState<HistoryEntry[]>([
    { fen: initialFen },
  ]);
  const [cursor, setCursor] = useState(0);
  const [restored, setRestored] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [promotion, setPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [analysis, setAnalysis] = useState<ChessAnalysis | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>("balanced");
  const [analysisError, setAnalysisError] = useState("");
  const [analysing, setAnalysing] = useState(false);
  const [dataModal, setDataModal] = useState(false);
  const [positionText, setPositionText] = useState("");
  const [importError, setImportError] = useState("");
  const [playMode, setPlayMode] = useState<"free" | "engine">("free");
  const [engineError, setEngineError] = useState("");
  const [engineRetry, setEngineRetry] = useState(0);
  const engineRequestRef = useRef(0);
  const analysisRequestRef = useRef(0);
  const analysisControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(historyKey)
      .then((stored) => {
        if (!stored) return;
        const parsed = parseSavedGame(stored);
        if (!parsed) return;
        analysisRequestRef.current += 1;
        engineRequestRef.current += 1;
        setAnalysis(null);
        setAnalysisError("");
        setTimeline(parsed.timeline);
        setCursor(parsed.cursor);
      })
      .catch(() => undefined)
      .finally(() => setRestored(true));
  }, []);

  useEffect(() => {
    if (restored)
      AsyncStorage.setItem(
        historyKey,
        JSON.stringify({ timeline, cursor }),
      ).catch(() => undefined);
  }, [cursor, restored, timeline]);

  const current = timeline[cursor] ?? timeline[0];
  const game = useMemo(() => new Chess(current.fen), [current.fen]);
  const engineThinking =
    playMode === "engine" &&
    game.turn() === "b" &&
    !game.isGameOver() &&
    cursor === timeline.length - 1 &&
    !engineError;
  const legalTargets = useMemo(() => {
    if (!selectedSquare) return [];
    return game
      .moves({ square: selectedSquare, verbose: true })
      .map((move) => move.to);
  }, [game, selectedSquare]);
  const checkedKing = useMemo(() => {
    if (!game.isCheck()) return null;
    const currentKing = game
      .board()
      .flat()
      .find((piece) => piece?.type === "k" && piece.color === game.turn());
    return currentKing?.square ?? null;
  }, [game]);
  const sanMoves = timeline
    .slice(1, cursor + 1)
    .flatMap((entry) => (entry.san ? [entry.san] : []));
  const recentNotation = sanMoves.slice(-10).join("   ") || "ابدأ بنقلة للأبيض";

  useEffect(() => {
    if (
      playMode !== "engine" ||
      game.turn() !== "b" ||
      game.isGameOver() ||
      cursor !== timeline.length - 1
    )
      return;

    const requestId = ++engineRequestRef.current;
    const controller = new AbortController();
    let cancelled = false;
    analyzePosition(current.fen, analysisMode, controller.signal)
      .then((result) => {
        if (cancelled || engineRequestRef.current !== requestId) return;
        const uci = result.lines[0]?.moves[0];
        if (!uci) {
          setEngineError("لم يرجع Stockfish نقلة قانونية. أعد المحاولة.");
          return;
        }
        try {
          const { game: nextGame, move } = moveToSan(current.fen, uci);
          const nextTimeline = [
            ...timeline.slice(0, cursor + 1),
            {
              fen: nextGame.fen(),
              san: move.san,
              lastMove: { from: move.from, to: move.to },
            },
          ];
          setTimeline(nextTimeline);
          setCursor(nextTimeline.length - 1);
          setSelectedSquare(null);
        } catch {
          setEngineError("تعذّر تطبيق نقلة Stockfish. أعد المحاولة.");
        }
      })
      .catch((error) => {
        if (cancelled || engineRequestRef.current !== requestId) return;
        setEngineError(
          error instanceof Error ? error.message : "تعذّر الاتصال بالمحرك.",
        );
      });

    return () => {
      cancelled = true;
      if (engineRequestRef.current === requestId) engineRequestRef.current += 1;
      controller.abort();
    };
  }, [
    analysisMode,
    current.fen,
    cursor,
    engineRetry,
    game,
    playMode,
    timeline,
  ]);

  const cancelActiveAnalysis = () => {
    analysisRequestRef.current += 1;
    analysisControllerRef.current?.abort();
    analysisControllerRef.current = null;
    setAnalysing(false);
  };

  const commitMove = (
    from: Square,
    to: Square,
    chosenPromotion?: Promotion,
  ) => {
    const nextGame = new Chess(current.fen);
    try {
      const move = nextGame.move({
        from,
        to,
        ...(chosenPromotion ? { promotion: chosenPromotion } : {}),
      });
      cancelActiveAnalysis();
      engineRequestRef.current += 1;
      const nextTimeline = [
        ...timeline.slice(0, cursor + 1),
        { fen: nextGame.fen(), san: move.san, lastMove: { from, to } },
      ];
      setTimeline(nextTimeline);
      setCursor(nextTimeline.length - 1);
      setSelectedSquare(null);
      setAnalysis(null);
      setAnalysisError("");
      setEngineError("");
    } catch {
      setSelectedSquare(null);
    }
  };

  const pressSquare = (square: Square) => {
    if (
      !restored ||
      promotion ||
      game.isGameOver() ||
      analysing ||
      engineThinking ||
      (playMode === "engine" && game.turn() !== "w")
    )
      return;
    if (selectedSquare && legalTargets.includes(square)) {
      const movingPiece = game.get(selectedSquare);
      const reachesLastRank =
        movingPiece?.type === "p" &&
        (square.endsWith("8") || square.endsWith("1"));
      if (reachesLastRank) {
        setPromotion({ from: selectedSquare, to: square });
        return;
      }
      commitMove(selectedSquare, square);
      return;
    }
    const tappedPiece = game.get(square);
    if (tappedPiece && tappedPiece.color === game.turn()) {
      setSelectedSquare(square);
      return;
    }
    setSelectedSquare(null);
  };

  const loadPosition = () => {
    setImportError("");
    const input = positionText.trim();
    if (!input) {
      setImportError("ألصق FEN أو PGN أولاً.");
      return;
    }
    try {
      const imported = new Chess();
      if (input.includes("/") && !input.includes("[Event"))
        imported.load(input);
      else imported.loadPgn(input);
      const replay = new Chess();
      const nextTimeline: HistoryEntry[] = [{ fen: replay.fen() }];
      for (const move of imported.history({ verbose: true })) {
        const applied = replay.move({
          from: move.from,
          to: move.to,
          ...(move.promotion ? { promotion: move.promotion } : {}),
        });
        nextTimeline.push({
          fen: replay.fen(),
          san: applied.san,
          lastMove: { from: move.from, to: move.to },
        });
      }
      if (input.includes("/") && !input.includes("[Event"))
        nextTimeline.splice(0, nextTimeline.length, { fen: imported.fen() });
      cancelActiveAnalysis();
      engineRequestRef.current += 1;
      setTimeline(nextTimeline);
      setCursor(nextTimeline.length - 1);
      setAnalysis(null);
      setSelectedSquare(null);
      setAnalysisError("");
      setEngineError("");
      setPositionText("");
      setDataModal(false);
    } catch {
      setImportError(
        "لم أتمكن من قراءة هذا النص. استخدم FEN كاملاً أو PGN صحيحاً.",
      );
    }
  };

  const runAnalysis = async () => {
    if (!restored) return;
    analysisControllerRef.current?.abort();
    const controller = new AbortController();
    analysisControllerRef.current = controller;
    const requestId = ++analysisRequestRef.current;
    const requestedFen = current.fen;
    setAnalysing(true);
    setAnalysisError("");
    setAnalysis(null);
    try {
      const result = await analyzePosition(
        requestedFen,
        analysisMode,
        controller.signal,
      );
      if (analysisRequestRef.current !== requestId) return;
      setAnalysis(result);
      if (!result.lines.length)
        setAnalysisError(
          "انتهت المباراة في هذه الوضعية ولا توجد نقلة قانونية.",
        );
    } catch (error) {
      if (analysisRequestRef.current !== requestId) return;
      setAnalysisError(
        error instanceof Error ? error.message : "تعذّر الاتصال بمحرك التحليل.",
      );
    } finally {
      if (analysisRequestRef.current === requestId) {
        analysisControllerRef.current = null;
        setAnalysing(false);
      }
    }
  };

  const applyLine = (moves: string[]) => {
    const branch = timeline.slice(0, cursor + 1);
    let position = new Chess(current.fen);
    for (const uci of moves.slice(0, 8)) {
      try {
        const { game: nextGame, move } = moveToSan(position.fen(), uci);
        position = nextGame;
        branch.push({
          fen: position.fen(),
          san: move.san,
          lastMove: { from: move.from, to: move.to },
        });
      } catch {
        break;
      }
    }
    if (branch.length > cursor + 1) {
      cancelActiveAnalysis();
      engineRequestRef.current += 1;
      setTimeline(branch);
      setCursor(branch.length - 1);
      setSelectedSquare(null);
      setAnalysis(null);
      setEngineError("");
    }
  };

  const resetBoard = () => {
    engineRequestRef.current += 1;
    cancelActiveAnalysis();
    setTimeline([{ fen: initialFen }]);
    setCursor(0);
    setSelectedSquare(null);
    setAnalysis(null);
    setAnalysisError("");
    setEngineError("");
  };

  const switchPlayMode = (mode: "free" | "engine") => {
    if (mode === playMode) return;
    setPlayMode(mode);
    resetBoard();
  };

  return (
    <ScreenShell
      title="قاعة اللعب"
      subtitle="العب بحرية أو واجه Stockfish، ثم راجع خطتك."
    >
      <Surface style={styles.playCard}>
        <View style={styles.cardTop}>
          <View style={styles.turnPill}>
            <View
              style={[
                styles.turnDot,
                {
                  backgroundColor: game.turn() === "w" ? "#F7F3EA" : "#3F4140",
                },
              ]}
            />
            <Text style={styles.turnText}>{statusFor(game)}</Text>
          </View>
          <Tag active>
            {playMode === "engine" ? "ضد Stockfish" : "اللعب الحر"}
          </Tag>
        </View>
        <View style={styles.modeRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: playMode === "free" }}
            disabled={!restored}
            onPress={() => switchPlayMode("free")}
            style={[
              styles.modeOption,
              playMode === "free" && styles.modeOptionActive,
            ]}
          >
            <Text
              style={[
                styles.modeOptionText,
                playMode === "free" && styles.modeOptionTextActive,
              ]}
            >
              تدريب حر
            </Text>
            <Text
              style={[
                styles.modeOptionHint,
                playMode === "free" && styles.modeOptionTextActive,
              ]}
            >
              حرّك الطرفين
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: playMode === "engine" }}
            disabled={!restored}
            onPress={() => switchPlayMode("engine")}
            style={[
              styles.modeOption,
              playMode === "engine" && styles.modeOptionActive,
            ]}
          >
            <Text
              style={[
                styles.modeOptionText,
                playMode === "engine" && styles.modeOptionTextActive,
              ]}
            >
              واجه Stockfish
            </Text>
            <Text
              style={[
                styles.modeOptionHint,
                playMode === "engine" && styles.modeOptionTextActive,
              ]}
            >
              أنت الأبيض
            </Text>
          </Pressable>
        </View>
        {playMode === "engine" ? (
          <View style={styles.engineStatus}>
            <Text style={styles.engineStatusText}>
              {engineThinking
                ? "Stockfish يفكر في الرد…"
                : "المحرك يلعب بالأسود — اختر زمن التفكير من إعداد التحليل."}
            </Text>
            {engineError ? (
              <View style={styles.engineErrorRow}>
                <Text style={styles.errorText}>{engineError}</Text>
                <Pressable
                  onPress={() => {
                    setEngineError("");
                    setEngineRetry((value) => value + 1);
                  }}
                >
                  <Text style={styles.retryText}>إعادة</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/openings")}
          style={({ pressed }) => [
            styles.openingsLink,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.openingsLinkMark}>♜</Text>
          <Text style={styles.openingsLinkText}>موسوعة الافتتاحات</Text>
          <Text style={styles.openingsLinkArrow}>←</Text>
        </Pressable>
        <ChessBoard
          fen={current.fen}
          selectedSquare={selectedSquare}
          legalTargets={legalTargets}
          lastMove={current.lastMove ?? null}
          checkedKingSquare={checkedKing}
          onPressSquare={pressSquare}
        />
        <View style={styles.notationBox}>
          <Text style={styles.notationLabel}>سجل النقلات</Text>
          <Text style={styles.notationText} numberOfLines={2}>
            {recentNotation}
          </Text>
        </View>
        <View style={styles.controlsRow}>
          <ControlButton
            title="تراجع"
            icon="‹"
            onPress={() => {
              cancelActiveAnalysis();
              engineRequestRef.current += 1;
              setAnalysis(null);
              setEngineError("");
              setCursor((value) => Math.max(0, value - 1));
              setSelectedSquare(null);
            }}
            disabled={!restored || cursor === 0 || analysing || engineThinking}
          />
          <ControlButton
            title="إعادة"
            icon="›"
            onPress={() => {
              cancelActiveAnalysis();
              engineRequestRef.current += 1;
              setAnalysis(null);
              setEngineError("");
              setCursor((value) => Math.min(timeline.length - 1, value + 1));
              setSelectedSquare(null);
            }}
            disabled={
              !restored ||
              cursor >= timeline.length - 1 ||
              analysing ||
              engineThinking
            }
          />
          <ControlButton
            title="FEN / PGN"
            icon="↗"
            onPress={() => {
              setImportError("");
              setDataModal(true);
            }}
            disabled={!restored || analysing || engineThinking}
          />
          <ControlButton
            title="بداية"
            icon="↻"
            onPress={resetBoard}
            disabled={!restored || analysing || engineThinking}
          />
        </View>
      </Surface>

      <Surface>
        <SectionHeading
          title="تحليل Stockfish"
          detail={analysis?.depth ? `عمق ${analysis.depth}` : "أفضل النقلات"}
        />
        <Text style={styles.analysisIntro}>
          Stockfish يعرض أفضل الخطوط المتاحة ضمن وقت التحليل المختار. يلزم اتصال
          بخادم المحرك.
        </Text>
        <View style={styles.analysisModes}>
          {analysisModes.map((mode) => (
            <Pressable
              key={mode.id}
              disabled={!restored || analysing || engineThinking}
              onPress={() => {
                setAnalysisMode(mode.id);
                setAnalysis(null);
                setAnalysisError("");
              }}
              style={[
                styles.analysisMode,
                analysisMode === mode.id && styles.analysisModeActive,
              ]}
            >
              <Text
                style={[
                  styles.analysisModeLabel,
                  analysisMode === mode.id && styles.analysisModeLabelActive,
                ]}
              >
                {mode.label}
              </Text>
              <Text
                style={[
                  styles.analysisModeDetail,
                  analysisMode === mode.id && styles.analysisModeLabelActive,
                ]}
              >
                {mode.detail}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          onPress={runAnalysis}
          disabled={!restored || analysing || engineThinking}
          style={({ pressed }) => [
            styles.analyzeButton,
            pressed && !analysing && styles.pressed,
          ]}
        >
          {analysing ? (
            <ActivityIndicator size="small" color="#FFF9EF" />
          ) : null}
          <Text style={styles.analyzeButtonText}>
            {engineThinking
              ? "Stockfish يفكر في الرد…"
              : analysing
                ? "المحرّك يحلل الوضعية…"
                : "حلّل الوضعية"}
          </Text>
        </Pressable>
        {analysisError ? (
          <Text style={styles.errorText}>{analysisError}</Text>
        ) : null}
        {analysis?.lines.map((line) => (
          <Pressable
            key={line.multipv}
            disabled={analysing || engineThinking}
            onPress={() => applyLine(line.moves)}
            style={({ pressed }) => [
              styles.engineLine,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.engineLineTop}>
              <Text style={styles.lineNumber}>الخيار {line.multipv}</Text>
              <Text style={styles.evalText}>
                {line.mate !== null
                  ? `مات ${line.mate}`
                  : `${(line.centipawns ?? 0) >= 0 ? "+" : ""}${((line.centipawns ?? 0) / 100).toFixed(2)}`}
              </Text>
            </View>
            <Text style={styles.pvText} numberOfLines={2}>
              {line.san.slice(0, 7).join("  ") || "—"}
            </Text>
            <Text style={styles.useLine}>اضغط لعرض الخط على الرقعة</Text>
          </Pressable>
        ))}
      </Surface>

      <Surface style={styles.tipCard}>
        <View style={styles.tipIcon}>
          <Text style={styles.tipKnight}>♞</Text>
        </View>
        <View style={styles.tipCopy}>
          <Text style={styles.tipTitle}>قبل أن تلعب</Text>
          <Text style={styles.tipBody}>
            اسأل نفسك: ما الذي يهاجمه خصمي؟ ثم افحص الكشّات والأسر والتهديدات.
          </Text>
        </View>
      </Surface>

      <Modal
        transparent
        visible={!!promotion}
        animationType="fade"
        onRequestClose={() => setPromotion(null)}
      >
        <View style={styles.modalScrim}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>اختر القطعة للترقية</Text>
            <View style={styles.promotionRow}>
              {(["q", "r", "b", "n"] as Promotion[]).map((piece) => (
                <Pressable
                  key={piece}
                  style={styles.promotionChoice}
                  onPress={() => {
                    if (promotion)
                      commitMove(promotion.from, promotion.to, piece);
                    setPromotion(null);
                  }}
                >
                  <Text style={styles.promotionGlyph}>
                    {{ q: "♛", r: "♜", b: "♝", n: "♞" }[piece]}
                  </Text>
                  <Text style={styles.promotionName}>
                    {{ q: "وزير", r: "رخ", b: "فيل", n: "حصان" }[piece]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={dataModal}
        animationType="slide"
        onRequestClose={() => setDataModal(false)}
      >
        <View style={styles.modalScrim}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>استيراد وضعية أو مباراة</Text>
            <Text style={styles.modalHint}>
              الصق FEN لوضعية أو PGN لمباراة.
            </Text>
            <TextInput
              multiline
              value={positionText}
              onChangeText={setPositionText}
              placeholder="FEN أو PGN"
              placeholderTextColor="#9B9183"
              autoCapitalize="none"
              textAlign="left"
              style={styles.positionInput}
            />
            {importError ? (
              <Text style={styles.errorText}>{importError}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => {
                  setPositionText("");
                  setDataModal(false);
                }}
                style={styles.secondaryAction}
              >
                <Text style={styles.secondaryActionText}>إلغاء</Text>
              </Pressable>
              <Pressable onPress={loadPosition} style={styles.primaryAction}>
                <Text style={styles.primaryActionText}>تحميل</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

function ControlButton({
  title,
  icon,
  onPress,
  disabled = false,
}: {
  title: string;
  icon: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.controlButton,
        disabled && styles.controlDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.controlIcon}>{icon}</Text>
      <Text style={styles.controlLabel}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  playCard: { padding: 12, paddingBottom: 14 },
  modeRow: { flexDirection: "row", gap: 8, marginBottom: 11 },
  modeOption: {
    flex: 1,
    minHeight: 54,
    justifyContent: "center",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: chessColors.border,
    backgroundColor: "#F8F4EB",
  },
  modeOptionActive: {
    backgroundColor: chessColors.forest,
    borderColor: chessColors.brass,
  },
  modeOptionText: { color: chessColors.ink, fontSize: 12, fontWeight: "900" },
  modeOptionHint: { color: chessColors.muted, fontSize: 9, fontWeight: "700" },
  modeOptionTextActive: { color: "#FFF8E9" },
  engineStatus: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: chessColors.forestSoft,
    borderWidth: 1,
    borderColor: "#C5D4C9",
  },
  engineStatusText: {
    color: chessColors.forest,
    fontSize: 10,
    lineHeight: 16,
    textAlign: "right",
    fontWeight: "800",
  },
  engineErrorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
  },
  retryText: {
    color: chessColors.forest,
    fontSize: 11,
    fontWeight: "900",
    textDecorationLine: "underline",
  },
  openingsLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 11,
    paddingHorizontal: 12,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: chessColors.forest,
    borderWidth: 1,
    borderColor: chessColors.brass,
  },
  openingsLinkMark: { color: "#E6C66D", fontSize: 19 },
  openingsLinkText: {
    flex: 1,
    color: "#FFF8E9",
    textAlign: "right",
    fontSize: 11,
    fontWeight: "900",
  },
  openingsLinkArrow: { color: "#E6C66D", fontSize: 18, fontWeight: "900" },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 3,
  },
  turnPill: { flexDirection: "row", alignItems: "center", gap: 7 },
  turnDot: {
    width: 11,
    height: 11,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "#B6A68F",
  },
  turnText: { fontSize: 12, color: chessColors.ink, fontWeight: "700" },
  notationBox: {
    marginTop: 14,
    padding: 11,
    borderRadius: 12,
    backgroundColor: "#F5EFE4",
  },
  notationLabel: {
    color: chessColors.muted,
    textAlign: "right",
    fontSize: 10,
    fontWeight: "700",
    marginBottom: 4,
  },
  notationText: {
    color: chessColors.ink,
    textAlign: "left",
    fontSize: 13,
    fontWeight: "700",
    minHeight: 18,
  },
  controlsRow: { flexDirection: "row", gap: 7, marginTop: 12 },
  controlButton: {
    flex: 1,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 13,
    backgroundColor: "#F9F4EA",
    borderWidth: 1,
    borderColor: chessColors.border,
  },
  controlDisabled: { opacity: 0.42 },
  controlIcon: {
    color: chessColors.walnut,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 22,
  },
  controlLabel: {
    color: chessColors.muted,
    fontSize: 9,
    fontWeight: "700",
    marginTop: 3,
  },
  analysisIntro: {
    textAlign: "right",
    color: chessColors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  analysisModes: { flexDirection: "row", gap: 8, marginBottom: 11 },
  analysisMode: {
    flex: 1,
    minHeight: 49,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: chessColors.border,
    backgroundColor: "#FCF9F3",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  analysisModeActive: {
    backgroundColor: chessColors.walnut,
    borderColor: chessColors.walnut,
  },
  analysisModeLabel: {
    color: chessColors.ink,
    fontSize: 11,
    fontWeight: "900",
  },
  analysisModeLabelActive: { color: "#FFF9EF" },
  analysisModeDetail: { color: chessColors.muted, fontSize: 9 },
  analyzeButton: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: chessColors.walnut,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  analyzeButtonText: { color: "#FFF9EF", fontWeight: "800", fontSize: 13 },
  errorText: {
    color: chessColors.danger,
    fontSize: 12,
    textAlign: "right",
    marginTop: 9,
    lineHeight: 18,
  },
  engineLine: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: chessColors.border,
    backgroundColor: "#FCF9F3",
  },
  engineLineTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lineNumber: { color: chessColors.muted, fontSize: 11, fontWeight: "700" },
  evalText: { color: chessColors.green, fontSize: 14, fontWeight: "900" },
  pvText: {
    color: chessColors.ink,
    textAlign: "left",
    marginTop: 7,
    fontSize: 14,
    fontWeight: "700",
  },
  useLine: {
    color: chessColors.brass,
    textAlign: "right",
    marginTop: 5,
    fontSize: 10,
    fontWeight: "700",
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F1E8D9",
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#E5D0AE",
    alignItems: "center",
    justifyContent: "center",
  },
  tipKnight: { color: chessColors.walnut, fontSize: 25 },
  tipCopy: { flex: 1 },
  tipTitle: {
    color: chessColors.walnut,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "right",
  },
  tipBody: {
    color: chessColors.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "right",
    marginTop: 4,
  },
  modalScrim: {
    flex: 1,
    backgroundColor: "rgba(27, 22, 17, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 20,
    padding: 19,
    backgroundColor: chessColors.card,
    borderColor: chessColors.border,
    borderWidth: 1,
  },
  modalTitle: {
    color: chessColors.ink,
    textAlign: "right",
    fontSize: 18,
    fontWeight: "900",
  },
  modalHint: {
    color: chessColors.muted,
    textAlign: "right",
    fontSize: 12,
    marginTop: 6,
    marginBottom: 12,
  },
  positionInput: {
    height: 130,
    backgroundColor: "#F7F2E9",
    borderColor: chessColors.border,
    borderWidth: 1,
    borderRadius: 13,
    padding: 12,
    color: chessColors.ink,
    textAlignVertical: "top",
    fontSize: 12,
  },
  modalActions: { flexDirection: "row", gap: 9, marginTop: 14 },
  primaryAction: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: chessColors.walnut,
    alignItems: "center",
    padding: 12,
  },
  primaryActionText: { color: "#FFF9EF", fontSize: 13, fontWeight: "800" },
  secondaryAction: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#F2E9DD",
    alignItems: "center",
    padding: 12,
  },
  secondaryActionText: {
    color: chessColors.walnut,
    fontSize: 13,
    fontWeight: "800",
  },
  promotionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  promotionChoice: { alignItems: "center", padding: 9 },
  promotionGlyph: { color: chessColors.walnut, fontSize: 34 },
  promotionName: { color: chessColors.muted, fontSize: 11, fontWeight: "700" },
  pressed: { opacity: 0.78 },
});
