// utils/openaiAnalysis.js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeDrawing({ signedUrl, childName, childAge }) {
  const name = childName || "the child";
  const age = Number.isFinite(+childAge) ? String(childAge) : "unknown";

  // --- SYSTEM STYLE GUARDRAILS ---
  const systemText = [
    "You are a child-development specialist and art therapist writing to caring parents.",
    "Sound warm, precise, and evidence-based. Tie every claim to something visible in the drawing (layout, colors, pressure, figures, spacing, symbols, repetition, overlaps).",
    "Vary verbs and adjectives; avoid hedging clichés like “may indicate”, “could suggest”, “it seems that”. Prefer fresher wording (signals, points to, aligns with, reads as).",
    "Never diagnose. Offer gentle, practical, age-appropriate ideas. No medical labels. No moral judgments.",
    "Write so a parent learns something new, feels reassured, and wants to keep exploring art together."
  ].join(" ");

  // --- JSON SPEC (kept compatible with your UI sections) ---
  const spec = `Return STRICT JSON with keys exactly:
{
  "summary": "2–3 sentences (40–80 words) describing overall mood and standout features.",
  "emotional": "140–190 words. Emotional themes grounded in 3–4 concrete observations (e.g., color warmth, figure spacing, facial cues, safe-base symbols). No filler.",
  "cognitive": "140–190 words. Planning, sequencing, spatial reasoning, perspective, proportion, detail. Map to expectations for age ${age}. Use specific evidence.",
  "creative": "140–190 words. Imagination, symbolism, story choices, risks taken, playful surprises. Cite exact elements.",
  "recommendations": "140–190 words. 4–6 upbeat, do-this-now ideas (home activities, prompts, scaffolds). Write as one paragraph with mini-bullets using •.",
  "flags": "40–90 words. Neutral watchouts to monitor over time and what to note. If none, write: 'None noted for now.'",
  "confidence": "high | medium | low"
}`;

  // --- USER MESSAGE PARTS (vision + instructions) ---
  const userParts = [
    {
      type: "text",
      text: [
        `Analyze this child's drawing for a parent. Child: ${name}; Age: ${age}.`,
        "Use second person sparingly (“you can…”) and keep a kind, curious tone.",
        "Favor concrete references over abstractions. If the photo is unclear on a detail, avoid inventing specific content.",
        spec,
        "Formatting rules:",
        "- No markdown; values are plain strings.",
        "- Do not include extra keys.",
        "- Do not wrap JSON in code fences."
      ].join("\n")
    }
  ];

  if (signedUrl) {
    userParts.push({
      type: "image_url",
      image_url: { url: signedUrl }
    });
  }

  const resp = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.8,
    max_tokens: 1700,
    response_format: { type: "json_object" }, // enforce valid JSON
    messages: [
      { role: "system", content: systemText },
      { role: "user", content: userParts }
    ]
  });

  return resp.choices?.[0]?.message?.content || "";
}
