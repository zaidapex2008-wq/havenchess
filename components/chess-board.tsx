import { Chess, type Square } from "chess.js";
import { useMemo } from "react";
import {
  ImageBackground,
  I18nManager,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { chessColors } from "@/constants/chess-theme";

type BoardMove = { from: Square; to: Square } | null;

type ChessBoardProps = {
  fen: string;
  selectedSquare: Square | null;
  legalTargets: Square[];
  lastMove: BoardMove;
  checkedKingSquare: Square | null;
  onPressSquare: (square: Square) => void;
};

const pieceSprites: Record<"w" | "b", Record<string, number>> = {
  b: {
    p: require("@/assets/images/chess-pieces/black-p.png"),
    r: require("@/assets/images/chess-pieces/black-r.png"),
    n: require("@/assets/images/chess-pieces/black-n.png"),
    b: require("@/assets/images/chess-pieces/black-b.png"),
    q: require("@/assets/images/chess-pieces/black-q.png"),
    k: require("@/assets/images/chess-pieces/black-k.png"),
  },
  w: {
    p: require("@/assets/images/chess-pieces/white-p.png"),
    r: require("@/assets/images/chess-pieces/white-r.png"),
    n: require("@/assets/images/chess-pieces/white-n.png"),
    b: require("@/assets/images/chess-pieces/white-b.png"),
    q: require("@/assets/images/chess-pieces/white-q.png"),
    k: require("@/assets/images/chess-pieces/white-k.png"),
  },
};
const files = "abcdefgh";
const woodTexture = require("@/assets/images/chessboard-texture.png");

export function ChessBoard({
  fen,
  selectedSquare,
  legalTargets,
  lastMove,
  checkedKingSquare,
  onPressSquare,
}: ChessBoardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const boardSize = Math.min(windowWidth - 42, 440);
  const squareSize = (boardSize - 8) / 8;
  const board = useMemo(() => new Chess(fen).board(), [fen]);

  return (
    <View style={[styles.frame, { width: boardSize, height: boardSize, padding: 2 }]}>
      <ImageBackground
        nativeID="chess-board-grid"
        source={woodTexture}
        resizeMode="stretch"
        style={[
          styles.board,
          { flexDirection: Platform.OS === "web" || I18nManager.isRTL ? "row-reverse" : "row" },
        ]}
        imageStyle={styles.boardTexture}
      >
        {board.map((rank, rowIndex) =>
          rank.map((piece, columnIndex) => {
            const square = `${files[columnIndex]}${8 - rowIndex}` as Square;
            const isSelected = square === selectedSquare;
            const isLastMove = square === lastMove?.from || square === lastMove?.to;
            const isChecked = square === checkedKingSquare;
            const isLegalTarget = legalTargets.includes(square);
            const overlayColor = isSelected
              ? "rgba(235, 193, 75, 0.78)"
              : isChecked
                ? "rgba(196, 76, 61, 0.78)"
                : isLastMove
                  ? "rgba(222, 172, 75, 0.54)"
                  : "transparent";
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${square}${piece ? `، ${piece.color === "w" ? "أبيض" : "أسود"}` : ""}`}
                key={square}
                onPress={() => onPressSquare(square)}
                style={({ pressed }) => [
                  styles.square,
                  {
                    width: squareSize,
                    height: squareSize,
                    backgroundColor: overlayColor,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
              >
                {isLegalTarget && !piece ? <View pointerEvents="none" style={styles.moveDot} /> : null}
                {isLegalTarget && piece ? <View pointerEvents="none" style={styles.captureRing} /> : null}
                {piece ? (
                  <Image
                    accessibilityLabel={`${piece.color === "w" ? "قطعة بيضاء" : "قطعة سوداء"}: ${piece.type}`}
                    source={pieceSprites[piece.color][piece.type]}
                    resizeMode="stretch"
                    style={styles.pieceSprite}
                  />
                ) : null}
              </Pressable>
            );
          }),
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignSelf: "center",
    backgroundColor: "#D0B48C",
    borderColor: chessColors.walnut,
    borderWidth: 2,
    shadowColor: "#342113",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 11,
    elevation: 4,
  },
  board: {
    flex: 1,
    flexWrap: "wrap",
    overflow: "hidden",
  },
  boardTexture: { width: "100%", height: "100%" },
  square: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  pieceSprite: { width: "100%", height: "100%", zIndex: 2 },
  moveDot: {
    position: "absolute",
    width: "23%",
    height: "23%",
    borderRadius: 999,
    backgroundColor: "rgba(52, 45, 37, 0.33)",
    zIndex: 1,
  },
  captureRing: {
    ...StyleSheet.absoluteFill,
    borderWidth: 4,
    borderColor: "rgba(52, 45, 37, 0.34)",
    borderRadius: 999,
    zIndex: 1,
  },
});
