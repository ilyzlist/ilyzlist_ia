// utils/parseAnalysis.js

/**
 * Attempt to parse model JSON safely and normalize into a predictable shape
 * your UI can consume. Falls back to long strings so existing sections render.
 */
export function safeParseAnalysis(raw, { fallback } = {}) {
  const base = {
    version: "2.0",
    summary: "",
    emotional: "",
    cognitive: "",
    creative: "",
    recommendations: "",
    flags: "",
    confidence: "medium",
  };

  let data = null;

  // 1) Try straight JSON first
  try {
    data = JSON.parse(raw);
  } catch (_) {
    // 2) Try to salvage JSON from text blobs
    try {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) data = JSON.parse(match[0]);
    } catch {
      data = null;
    }
  }

  if (!data || typeof data !== "object") {
    return { ...(fallback || base), _raw: raw };
  }

  // Normalize fields and ensure they’re strings of decent length
  const norm = { ...base, ...data };
  const toStringOrEmpty = (v) => (typeof v === "string" ? v.trim() : "");

  const n = {
    version: toStringOrEmpty(norm.version) || "2.0",
    summary: ensureMinWords(toStringOrEmpty(norm.summary), 30),
    emotional: ensureMinWords(toStringOrEmpty(norm.emotional), 120),
    cognitive: ensureMinWords(toStringOrEmpty(norm.cognitive), 120),
    creative: ensureMinWords(toStringOrEmpty(norm.creative), 120),
    recommendations: ensureMinWords(toStringOrEmpty(norm.recommendations), 120),
    flags: ensureMinWords(toStringOrEmpty(norm.flags), 30),
    confidence: ["high", "medium", "low"].includes((norm.confidence || "").toLowerCase())
      ? norm.confidence.toLowerCase()
      : "medium",
  };

  // Lightweight polish: collapse repeated spaces, keep bullets
  for (const k of ["summary", "emotional", "cognitive", "creative", "recommendations", "flags"]) {
    n[k] = n[k]
      .replace(/\t/g, " ")
      .replace(/\s{2,}/g, " ")
      .replace(/•\s*/g, "• ")
      .trim();
  }

  return n;
}

/** Ensure a minimum rough length by repeating a key sentence if needed (rare). */
function ensureMinWords(text, minWords) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length >= minWords) return text;

  if (!text) return "";

  const lastSentence = (text.match(/[^.!?]*[.!?]/g) || [text])[0].trim();
  const needed = Math.ceil((minWords - words.length) / 10);
  const pad = Array.from({ length: Math.max(1, Math.min(3, needed)) })
    .map(() => lastSentence)
    .join(" ");
  return (text + " " + pad).trim();
}

// Back-compat: keep the old named export
export function parseAnalysis(raw, opts) {
  return safeParseAnalysis(raw, opts);
}

// Optional default export
export default safeParseAnalysis;
