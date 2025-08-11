// app/api/analyze/route.js
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { createClient } from "@supabase/supabase-js";
import { parseAnalysis } from "@/utils/parseAnalysis";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { imageUrl, childAge, userId, drawingId } = await request.json();

    if (!imageUrl || !userId || !drawingId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1) Return cached analysis if present
    const { data: existing, error: exErr } = await supabase
      .from("drawings")
      .select("analysis_result")
      .eq("id", drawingId)
      .single();
    if (exErr) throw exErr;
    if (existing?.analysis_result) {
      return NextResponse.json({ analysis: existing.analysis_result, metadata: { fromCache: true } });
    }

    // 2) Check analysis quota
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("analysis_quota")
      .eq("id", userId)
      .single();
    if (pErr) throw pErr;
    if (typeof profile?.analysis_quota === "number" && profile.analysis_quota <= 0) {
      return NextResponse.json({ error: "Quota exceeded" }, { status: 403 });
    }

    const ageStr = Number.isFinite(+childAge) ? String(childAge) : "unknown";

    // 3) Prompt: rich, specific, and JSON-only
    const systemText = [
      "You are a child-development specialist and art therapist writing to caring parents.",
      "Write warmly and vividly. Tie each insight to what’s visible (layout, spacing, color warmth, pressure, posture, repetition, overlap, perspective, proportions, narrative clues).",
      "No diagnoses. Avoid dull hedges like 'may indicate'/'could suggest'. Prefer: points to, aligns with, reads as, signals.",
      "Obey word ranges. Vary verbs/adjectives. Avoid repetition."
    ].join(" ");

    const schema = `Return STRICT JSON with these keys:
{
  "summary": "2–3 sentences (40–80 words).",
  "emotional": "150–200 words with 3–4 concrete observations tied to the picture.",
  "cognitive": "150–200 words on planning, sequencing, spatial reasoning, perspective, proportion, and detail—mapped to expectations for age ${ageStr}.",
  "creative": "150–200 words on imagination, symbolism, story choices, risks taken (cite exact elements).",
  "recommendations": "150–200 words. Include 4–6 actionable ideas written inline using dots like •, not numbered list.",
  "flags": "40–90 words. Neutral watchouts with what to monitor. If none, 'None noted for now.'",
  "confidence": "high | medium | low"
}`;

    // Primary call: force JSON
    const primary = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.85,
      max_tokens: 2400,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemText },
        {
          role: "user",
          content: [
            { type: "text", text: `Analyze this child's drawing (age: ${ageStr}). ${schema}\nOutput JSON ONLY (no markdown).` },
            { type: "image_url", image_url: { url: imageUrl, detail: "high" } }
          ]
        }
      ]
    });

    let raw = primary.choices?.[0]?.message?.content || "";

    // 4) Parse; if short/empty, repair once with a secondary call
    let parsed = parseAnalysis(raw);

    const tooShort =
      (!parsed.summary || parsed.summary.length < 40) ||
      !parsed.emotional?.analysis ||
      !parsed.cognitive?.analysis ||
      !parsed.creative?.analysis ||
      (parsed.recommendations?.actions?.length ?? 0) < 4;

    if (tooShort) {
      const repair = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.6,
        max_tokens: 2000,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You fix and expand JSON analyses to match the required schema and word ranges." },
          {
            role: "user",
            content: [
              { type: "text", text: `Here is the previous output (which was empty/short). Expand and repair to match the schema exactly.\n\n---\n${raw}\n\nSchema:\n${schema}` }
            ]
          }
        ]
      });
      raw = repair.choices?.[0]?.message?.content || raw;
      parsed = parseAnalysis(raw);
    }

    // 5) Save & decrement quota
    const { error: saveErr } = await supabase
      .from("drawings")
      .update({ analysis_result: parsed, analyzed_at: new Date().toISOString() })
      .eq("id", drawingId);
    if (saveErr) throw saveErr;

    if (typeof profile?.analysis_quota === "number") {
      await supabase
        .from("profiles")
        .update({ analysis_quota: Math.max(0, profile.analysis_quota - 1) })
        .eq("id", userId);
    }

    return NextResponse.json({
      analysis: parsed,
      metadata: { model: process.env.OPENAI_MODEL || "gpt-4o-mini", timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error("❌ Analysis error:", error);
    return NextResponse.json({ error: error.message || "Analysis failed" }, { status: 500 });
  }
}
