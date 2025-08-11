// utils/openaiAnalysis.js
import OpenAI from "openai";
import { safeParseAnalysis } from "./parseAnalysis";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Backwards-compatible signature:
 * - analyzeDrawing({ imageUrl, childAge, childName?, userId?, drawingId?, locale? })
 * - analyzeDrawing(imageUrl, childAge, userId?, drawingId?)
 */
export async function analyzeDrawing(arg1, arg2, arg3, arg4) {
  let imageUrl, childAge, childName = "", userId, drawingId, locale = "en";

  if (typeof arg1 === "object") {
    ({ imageUrl, childAge, childName = "", userId, drawingId, locale = "en" } = arg1 || {});
  } else {
    imageUrl = arg1;
    childAge = arg2;
    userId = arg3;
    drawingId = arg4;
  }

  if (!imageUrl) throw new Error("analyzeDrawing: imageUrl is required");
  if (typeof childAge !== "number") throw new Error("analyzeDrawing: childAge (number) is required");

  // --- Prompt: force depth, evidence, and concrete guidance ---
  const system = [
    "You are a child development specialist and art therapist.",
    "Goal: give parents a clear, constructive, *evidence-backed* analysis of a child's drawing.",
    "Do not diagnose. Avoid generic platitudes. Be specific about what you see and why it might matter.",
    "Write in warm, professional English. Keep reading flow lively and positive.",
  ].join(" ");

  const nameBit = childName ? ` The child's name is ${childName}.` : "";
  const parentContext = `Child age: ${childAge}.${nameBit}`;

  const schema = `
Return STRICT JSON with this shape (no prose outside JSON):
{
  "version": "2.0",
  "summary": "1–2 polished sentences that capture the heart of the drawing and the child's current vibe.",
  "emotional": "120–180 words. Start with a 1–2 sentence reading, then cite 3–5 concrete visual cues (colors, pressure, density, faces, suns/animals/weather, page areas used) and explain *because → therefore* links.",
  "cognitive": "120–180 words. Cover fine-motor control (stroke control, pressure, shapes), visual-spatial planning (layout, symmetry/baseline/ground), symbolic/narrative thinking (characters, sequences). Include specific observations as evidence.",
  "creative": "120–180 words. Discuss originality, theme coherence, motif reuse, risk-taking, and playfulness. Mention at least 3 specific details from the drawing.",
  "recommendations": "120–180 words. Give parents 4–6 actionable, short items that feel fresh: 2 conversation starters, 2 quick 10-min activities, 1 weekend idea, and 1 gentle habit to build. Prefix each item with '• '.",
  "flags": "One short paragraph with 2–3 *watch-fors* that are non-alarming (e.g., if heavy dark scribbling persists for weeks). End with a single sentence on when to consider a professional consult.",
  "confidence": "high | medium | low (based on image clarity and signal)."
}
  `.trim();

  const user = [
    parentContext,
    "First, briefly describe the main elements you *actually see* in the image (one sentence), then produce the JSON above.",
    "Be concrete and varied; do not repeat the same wording across sections.",
    "Do not invent details that are not visible; when uncertain, say so and reduce confidence.",
    "Tone guidelines: warm, specific, empowering; avoid therapy jargon.",
  ].join("\n");

  const messages = [
    { role: "system", content: system },
    {
      role: "user",
      content: [
        { type: "text", text: user + "\n\n" + schema },
        {
          type: "image_url",
          image_url: { url: imageUrl },
        },
      ],
    },
  ];

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.6,
    messages,
    max_tokens: 1400,
    response_format: { type: "json_object" }, // encourages valid JSON
  });

  const raw = resp?.choices?.[0]?.message?.content ?? "";
  return safeParseAnalysis(raw, {
    fallback: {
      summary: "",
      emotional: "",
      cognitive: "",
      creative: "",
      recommendations: "",
      flags: "",
      confidence: "medium",
    },
  });
}
