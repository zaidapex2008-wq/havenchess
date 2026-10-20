import { getApiBaseUrl } from "@/constants/oauth";

export type ChessAnalysisLine = {
  multipv: number;
  depth: number;
  centipawns: number | null;
  mate: number | null;
  moves: string[];
  san: string[];
};

export type ChessAnalysis = {
  engine: string;
  depth: number;
  lines: ChessAnalysisLine[];
};

export type AnalysisMode = "quick" | "balanced" | "deep";

type AnalysisError = { error?: string };

function isAnalysisLine(value: unknown): value is ChessAnalysisLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.multipv === "number" &&
    typeof line.depth === "number" &&
    (line.centipawns === null || typeof line.centipawns === "number") &&
    (line.mate === null || typeof line.mate === "number") &&
    Array.isArray(line.moves) &&
    line.moves.every((move) => typeof move === "string") &&
    Array.isArray(line.san) &&
    line.san.every((move) => typeof move === "string")
  );
}

function isChessAnalysis(value: unknown): value is ChessAnalysis {
  if (!value || typeof value !== "object") return false;
  const result = value as Record<string, unknown>;
  return (
    typeof result.engine === "string" &&
    typeof result.depth === "number" &&
    Array.isArray(result.lines) &&
    result.lines.every(isAnalysisLine)
  );
}

const requestTimeoutMs = 15_000;

export async function analyzePosition(
  fen: string,
  mode: AnalysisMode = "balanced",
  signal?: AbortSignal,
): Promise<ChessAnalysis> {
  const controller = new AbortController();
  const forwardAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener("abort", forwardAbort, { once: true });
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    let response: Response;
    try {
      response = await fetch(`${getApiBaseUrl()}/api/chess/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen, mode }),
        signal: controller.signal,
      });
    } catch {
      if (controller.signal.aborted)
        throw new Error("انتهت مهلة الاتصال بمحرك الشطرنج. أعد المحاولة.");
      throw new Error("تعذّر الاتصال بخادم محرك الشطرنج.");
    }

    let result: unknown;
    try {
      result = await response.json();
    } catch {
      if (controller.signal.aborted)
        throw new Error("انتهت مهلة الاتصال بمحرك الشطرنج. أعد المحاولة.");
      throw new Error("لم تصل استجابة مفهومة من خادم المحرك.");
    }

    if (!response.ok) {
      const message =
        result &&
        typeof result === "object" &&
        typeof (result as AnalysisError).error === "string"
          ? (result as AnalysisError).error
          : "تعذّر تحليل الوضعية الآن.";
      throw new Error(message);
    }
    if (!isChessAnalysis(result)) {
      throw new Error("أعاد خادم المحرك بيانات تحليل غير مكتملة.");
    }
    return result;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", forwardAbort);
  }
}
