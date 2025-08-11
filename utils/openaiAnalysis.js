// utils/openaiAnalysis.js
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeDrawing({ signedUrl, childName, childAge }) {
  const name = childName || "the child";
  const age = childAge ? `${childAge}` : "unknown";

  const messages = [
    {
      role: "system",
      content: [
        "You are a child-development specialist writing for caring parents.",
        "Write with warmth and specificity. Avoid generic filler.",
        "Ground claims in what could plausibly be seen in a child's drawing.",
        "Use varied language and concrete observations.",
        "Never diagnose. Offer gentle, practical suggestions.",
      ].join(" "),
    },
    {
      role: "user",
      content: [
        `Analyze this child's drawing for a parent. Child age: ${age}. Name: ${name}.`,
        "When possible, infer *from the image* (composition, color choices, pressure, figures, spacing, symbols).",
        "Return strict JSON only with these keys:",
        `{
  "summary": "2–3 sentences (40–70 words) that capture the overall mood and standout features.",
  "emotional": "120–180 words. Emotional themes with 2–3 specific observations tied to elements in the picture. Vary verbs and adjectives; avoid repeating 'suggests' and 'may indicate'.",
  "cognitive": "120–180 words. What skills are visible (planning, sequencing, perspective, proportion, detail). Map observations to approximate developmental expectations for age ${age}.",
  "creative": "120–180 words. Imagination, symbolism, color/story choices, originality. Mention any risks taken or playful surprises.",
  "recommendations": "120–180 words. 4–6 practical, upbeat actions the parent can try this week. Blend home activities, conversation starters, and gentle scaffolds.",
  "flags": "30–80 words. Non-diagnostic watchouts phrased as neutral observations with what to monitor over time. If none, write 'None noted for now.'",
  "confidence": "high | medium | low"
}`,
        "Forbidden phrases: 'this may indicate', 'it seems that', 'could suggest' (use fresher wording).",
        "Keep tone kind and curious.",
        `Image URL:\n${signedUrl || "N/A"}`,
      ].join("\n"),
    },
  ];

  const resp = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 900,
    messages,
  });

  // Return raw text; the API route will parse/normalize.
  return resp.choices?.[0]?.message?.content || "";
}
