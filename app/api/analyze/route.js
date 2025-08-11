// app/api/analyze/route.js
import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { createClient } from "@supabase/supabase-js";
import { parseAnalysis } from "@/utils/parseAnalysis"; // JSON-based parser

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

    // If an analysis already exists, return it
    const { data: existing, error: exErr } = await supabase
      .from("drawings")
      .select("analysis_result")
      .eq("id", drawingId)
      .single();
    if (exErr) throw exErr;

    if (existing?.analysis_result) {
      return NextResponse.json({ analysis: existing.analysis_result, metadata: { fromCache: true } });
    }

    // Check quota
    const { data: user, error: uErr } = await supabase
      .from("profiles")
      .select("analysis_quota")
      .eq("id", userId)
      .single();
    if (uErr) throw uErr;

    if (!user || (typeof user.analysis_quota === "number" && user.analysis_quota <= 0)) {
      return NextResponse.json({ error: "Quota exceeded" }, { status: 403 });
    }

    // Stronger prompt + strict JSON format
    const systemText = [
      "You are a child-development specialist and art therapist writing to caring parents.",
      "Write warmly and precisely. Tie each claim to something visible (layout, spacing, color temperature, pressure, posture, repetition, overlap, perspective).",
      "No diagnoses. Avoid boring hedges like 'may indicate', 'could suggest', 'it seems'. Prefer: signals, aligns with, reads as, points to.",
      "Each section must meet the word range. If short, add more concrete observations. Vary verbs/adjectives."
    ].join(" ");

    const spec = `Return STRICT JSON with keys exactly:
{
  "summary": "2–3 sentences (40–80 words) describing overall mood and standout features.",
  "emotional": "150–200 words with 3–4 concrete observations (e.g., color warmth, spacing, facial cues, safe-base symbols).",
  "cognitive": "150–200 words on planning, sequencing, spatial reasoning, perspective, proportion, detail — mapped to expectations for age ${Number.isFinite(+childAge) ? childAge : "unknown"}.",
  "creative": "150–200 words on imagination, symbolism/story choices, risks taken; cite exact elements.",
  "recommendations": "150–200 words. 4–6 upbeat, do-this-now ideas (home activities, prompts, scaffolds). Write as one paragraph using mini-bullets like •.",
  "flags": "40–90 words. Neutral watchouts to monitor over time and what to note. If none, write 'None noted for now.'",
  "confidence": "high | medium | low"
}`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.85,
      max_tokens: 2400,                 // ⬅️ give it room to write
      response_format: { type: "json_object" }, // ⬅️ force valid JSON
      messages: [
        { role: "system", content: systemText },
        {
          role: "user",
          content: [
            { type: "text", text: `Analyze this child's drawing. Age: ${childAge ?? "unknown"}.\n${spec}\nRules: Output JSON only (no markdown, no extra commentary).` },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ]
    });

    const rawJson = response.choices?.[0]?.message?.content;
    if (!rawJson) throw new Error("No analysis content from model");

    const parsed = parseAnalysis(rawJson); // keeps full text, no trimming

    // Save result
    const { error: saveErr } = await supabase
      .from("drawings")
      .update({
        analysis_result: parsed,
        analyzed_at: new Date().toISOString()
      })
      .eq("id", drawingId);
    if (saveErr) throw saveErr;

    // Decrement quota (if numeric)
    if (typeof user.analysis_quota === "number") {
      await supabase.from("profiles")
        .update({ analysis_quota: Math.max(0, user.analysis_quota - 1) })
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
