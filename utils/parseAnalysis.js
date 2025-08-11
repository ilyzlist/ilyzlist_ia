// utils/parseAnalysis.js

/**
 * Robust parser for the 4-section analysis.
 * - First tries to read a JSON block if present.
 * - Falls back to tolerant regex for the exact headings your UI uses.
 * - Extracts bullet recommendations whether '-', '*', '•', or numbered.
 */
export function parseAnalysis(content) {
  const sections = {
    emotional: { analysis: "" },
    cognitive: { analysis: "" },
    creative: { analysis: "" },
    recommendations: { actions: [] },
  };

  if (typeof content !== "string") {
    console.warn("⚠️ parseAnalysis: content is not a string:", typeof content);
    return sections;
  }

  // Normalize weird whitespace and stray markdown
  const normalize = (s = "") =>
    s
      .replace(/\r/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^#+\s*/gm, "") // strip markdown headings if any
      .trim();

  const tryJsonFirst = () => {
    // Look for a JSON block (```json ... ``` or a raw object)
    const jsonFence =
      content.match(/```json\s*([\s\S]*?)```/i) ||
      content.match(/```[\s\S]*?({[\s\S]*?})[\s\S]*?```/);
    const rawJson = jsonFence ? jsonFence[1] : content.match(/\{[\s\S]*\}/)?.[0];
    if (!rawJson) return false;

    try {
      const obj = JSON.parse(rawJson);
      // Accept various possible keys and map into our structure
      sections.emotional.analysis = normalize(
        obj.emotional?.analysis || obj.emotional || ""
      );
      sections.cognitive.analysis = normalize(
        obj.cognitive?.analysis || obj.cognitive || obj.development || ""
      );
      sections.creative.analysis = normalize(
        obj.creative?.analysis || obj.creative || ""
      );

      const recs =
        obj.recommendations?.actions ||
        obj.recommendations ||
        obj.actions ||
        [];
      sections.recommendations.actions = Array.isArray(recs)
        ? recs.map((r) => String(r).trim()).filter(Boolean)
        : [];

      // If we actually got meaningful content, accept it.
      const meaningful =
        sections.emotional.analysis ||
        sections.cognitive.analysis ||
        sections.creative.analysis ||
        sections.recommendations.actions.length > 0;
      return meaningful;
    } catch (_) {
      return false;
    }
  };

  if (tryJsonFirst()) return sections;

  // ---- Regex fallback (tolerant to optional punctuation/formatting) ----
  const text = content;

  const grab = (labelRegex, untilRegex) => {
    const start = text.match(labelRegex);
    if (!start) return "";
    const from = start.index + start[0].length;
    const rest = text.slice(from);
    const end = rest.match(untilRegex);
    return normalize(end ? rest.slice(0, end.index) : rest);
  };

  // Accept tiny variations: "1. Emotional Indicators", "1) Emotional Indicators", "1 - Emotional Indicators"
  const R = {
    emotional: /^\s*1[\.\)\-]?\s*Emotional Indicators\s*\n?/im,
    cognitive: /^\s*2[\.\)\-]?\s*Cognitive Development\s*\n?/im,
    creative: /^\s*3[\.\)\-]?\s*Creative Expression\s*\n?/im,
    recommendations: /^\s*4[\.\)\-]?\s*Recommendations\s*\n?/im,
  };

  sections.emotional.analysis = grab(R.emotional, R.cognitive);
  sections.cognitive.analysis = grab(R.cognitive, R.creative);
  sections.creative.analysis = grab(R.creative, R.recommendations);

  // Recommendations: collect bullets (-, *, •) or numbered 1. 2. 3.
  const recBlock = grab(R.recommendations, /$a^/); // to end
  if (recBlock) {
    const lines = recBlock
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const bullets = lines
      .flatMap((line) => {
        // capture "- x", "* x", "• x", "1. x", "1) x"
        const m =
          line.match(/^[-*•]\s+(.*)$/) ||
          line.match(/^\d+[\.\)]\s+(.*)$/);
        return m ? [m[1].trim()] : [];
      })
      .filter(Boolean);

    // If we didn't find bullets, treat whole block as one actionable note
    sections.recommendations.actions =
      bullets.length > 0 ? bullets : [recBlock];
  }

  // As a safety net: if a section is still empty, put a gentle message
  if (!sections.emotional.analysis)
    sections.emotional.analysis =
      "No clear emotional indicators could be parsed from the model output.";
  if (!sections.cognitive.analysis)
    sections.cognitive.analysis =
      "No clear cognitive observations could be parsed from the model output.";
  if (!sections.creative.analysis)
    sections.creative.analysis =
      "No clear creative observations could be parsed from the model output.";

  return sections;
}
