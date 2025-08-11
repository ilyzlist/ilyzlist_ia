// utils/openaiAnalysis.js
import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeDrawing({ signedUrl, childName, childAge }) {
  const name = childName || "the child";
  const age = Number.isFinite(+childAge) ? String(childAge) : "unknown";

  const systemText = [
    "You are a child-development specialist and art therapist writing to caring parents.",
    "Write warmly and precisely. Tie every claim to visible evidence (layout, color temperature, pressure, spacing, posture, repetition, overlap, perspective).",
    "Avoid hedging clichés: never use “may indicate”, “could suggest”, “it seems”. Prefer: signals, points to, aligns with, reads as, is consistent with.",
    "Never diagnose. Offer practical, age-appropriate ideas. No labels.",
    "Each section must meet its word range. If a section is short, expand it with more specific observations. Vary verbs/adjectives to avoid repetition."
  ].join(" ");

  const spec = `Return STRICT JSON with keys exactly:
{
  "summary": "2–3 sentences (40–80 words) describing overall mood and standout features.",
  "emotional": "150–200 words. 3–4 concrete observations (color warmth, spacing, facial cues, safe-base symbols).",
  "cognitive": "150–200 words. Planning, sequencing, spatial reasoning, perspective, proportion, detail — mapped to expectations for age ${age}.",
  "creative": "150–200 words. Imagination, symbolism/story choices, risks taken, playful surprises — cite exact elements.",
  "recommendations": "150–200 words. 4–6 upbeat, do-this-now ideas (home activities, prompts, scaffolds). Write as one paragraph with mini-bullets using •.",
  "flags": "40–90 words. Neutral watchouts to monitor over time and what to note. If none, write 'None noted for now.'",
  "confidence": "high | medium | low"
}`;

  const userParts = [
    {
      type: "text",
      text: [
        `Analyze this child's drawing for a parent. Child: ${name}; Age: ${age}.`,
        spec,
        "Formatting rules:",
        "- Response must be valid JSON (no markdown, no extra keys, no commentary).",
        "- If any field falls below its minimum, add more concrete detail until it fits."
      ].join("\n")
    }
  ];
  if (signedUrl) {
    userParts.push({ type: "image_url", image_url: { url: signedUrl } });
  }

  const resp = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.85,
    max_tokens: 2400,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemText },
      { role: "user", content: userParts }
    ]
  });

  return resp.choices?.[0]?.message?.content || "";
}
