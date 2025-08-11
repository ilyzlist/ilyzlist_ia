// utils/parseAnalysis.js
export function parseAnalysis(input) {
  const result = {
    summary: "",
    emotional: { analysis: "" },
    cognitive: { analysis: "" },
    creative: { analysis: "" },
    recommendations: { actions: [], text: "" },
    flags: "",
    confidence: "medium"
  };

  if (!input) return result;

  const extractJSON = (s) => {
    if (typeof s !== "string") return s;
    // If the model sneaks extra chars, grab the first JSON object
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try { return JSON.parse(s.slice(start, end + 1)); }
      catch { /* fall through */ }
    }
    try { return JSON.parse(s); } catch { return {}; }
  };

  const obj = typeof input === "string" ? extractJSON(input) : input;

  const pick = (...keys) => {
    for (const k of keys) {
      const v = obj?.[k];
      if (v && typeof v === "string") return v.trim();
      if (v && typeof v === "object" && typeof v.text === "string") return v.text.trim();
    }
    return "";
  };

  result.summary = pick("summary", "overview", "abstract");

  result.emotional.analysis = pick("emotional", "emotions", "affect");
  result.cognitive.analysis = pick("cognitive", "cognition", "thinking");
  result.creative.analysis = pick("creative", "imagination", "creativity");

  const recRaw = pick("recommendations", "advice", "next_steps");
  result.recommendations.text = recRaw;

  // Split any bullets we can find; fallback to sentence-ish splits
  const bullets = recRaw
    .split(/\n|(?:\s*[•\-–]\s+)/g)
    .map(s => s.trim())
    .filter(Boolean);
  if (bullets.length >= 2) {
    result.recommendations.actions = bullets;
  } else {
    result.recommendations.actions = recRaw
      .split(/\. (?=[A-Z(•\-–)]|$)/g)
      .map(s => s.trim())
      .filter(Boolean);
  }

  result.flags = pick("flags", "watchouts", "notes") || "None noted for now.";
  result.confidence = (obj?.confidence && String(obj.confidence)) || "medium";

  return result;
}
