"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import { MdArrowBack, MdSettings, MdNotifications } from "react-icons/md";

function pick(a, keys) {
  for (const k of keys) {
    const v = a?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

export default function AnalysisPage({ params }) {
  const router = useRouter();
  const search = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(null);
  const [analysisRow, setAnalysisRow] = useState(null);
  const [error, setError] = useState("");

  const id = params?.id;

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError("");
      try {
        // 1) drawing + signed image
        const { data: d, error: dErr } = await supabase
          .from("drawings")
          .select("*, children(id, name, age)")
          .eq("id", id)
          .single();
        if (dErr) throw dErr;

        let signedUrl = null;
        if (d?.file_path) {
          const { data: s } = await supabase
            .storage.from(process.env.NEXT_PUBLIC_SUPABASE_DRAWINGS_BUCKET || "drawings-bucket")
            .createSignedUrl(d.file_path, 3600);
          signedUrl = s?.signedUrl || null;
        }
        setDrawing({ ...d, signedUrl });

        // 2) latest analysis row (any schema)
        const { data: aRows, error: aErr } = await supabase
          .from("analyses")
          .select("*")
          .eq("drawing_id", id)
          .order("created_at", { ascending: false })
          .limit(1);
        if (aErr) throw aErr;

        setAnalysisRow(aRows?.[0] || null);

        // trigger analysis if requested with ?start=1 and nothing exists
        if (!aRows?.[0] && search.get("start") === "1") {
          await fetch(`/api/analyze?drawingId=${id}`, { method: "POST" });
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load analysis. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [id, search]);

  const a = useMemo(() => {
    if (!analysisRow) return null;
    const raw =
      analysisRow.analysis ||
      analysisRow.result ||
      analysisRow.ai_result ||
      analysisRow.data ||
      {};
    // tolerate text blobs
    const obj = typeof raw === "string" ? (() => {
      try { return JSON.parse(raw); } catch { return {}; }
    })() : raw;

    const summary = pick(obj, ["summary", "overview", "intro"]);
    const emotional = pick(obj, ["emotional", "emotionalIndicators", "emotions"]);
    const cognitive = pick(obj, ["cognitive", "cognitiveDevelopment", "cognition"]);
    const creative = pick(obj, ["creative", "creativeExpression", "creativity"]);
    const recommendations = pick(obj, ["recommendations", "parentTips", "nextSteps"]);
    const flags = pick(obj, ["flags", "redFlags", "observations"]);
    const confidence =
      (obj.confidence && String(obj.confidence).toLowerCase()) || "medium";

    return {
      summary, emotional, cognitive, creative, recommendations, flags, confidence,
    };
  }, [analysisRow]);

  const sections = useMemo(() => {
    if (!a) return [];
    return [
      ["Summary", a.summary],
      ["Emotional Indicators", a.emotional],
      ["Cognitive Development", a.cognitive],
      ["Creative Expression", a.creative],
      ["Recommendations", a.recommendations],
      ["Things to Monitor (Not Diagnostic)", a.flags],
    ].filter(([, text]) => text && text.trim());
  }, [a]);

  return (
    <div className="bg-white rounded-[30px] max-w-md mx-auto min-h-screen p-6 pb-24">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="p-1">
          <MdArrowBack className="w-5 h-5 text-[#3742D1]" />
        </button>
        <h1 className="text-xl font-bold text-[#3742D1]">Drawing Analysis</h1>
        <div className="flex gap-4">
          <Link href="/notifications"><MdNotifications className="w-5 h-5 text-[#3742D1]" /></Link>
          <Link href="/settings"><MdSettings className="w-5 h-5 text-[#3742D1]" /></Link>
        </div>
      </header>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Drawing card */}
      {drawing && (
        <div className="bg-[#ECF1FF] rounded-2xl p-4 mb-5">
          <div className="rounded-xl overflow-hidden bg-gray-50">
            <img
              src={drawing.signedUrl || "/images/default-drawing.png"}
              alt={drawing.file_name}
              className="w-full h-auto object-contain"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/default-drawing.png";
              }}
            />
          </div>
          <p className="mt-3 font-medium text-[#3742D1]">{drawing.file_name}</p>
          {drawing.children?.name && (
            <p className="text-sm text-gray-600">
              {drawing.children.name}
              {drawing.children.age ? ` (Age: ${drawing.children.age})` : ""}
            </p>
          )}
        </div>
      )}

      {/* Analysis */}
      {loading ? (
        <div className="text-center text-gray-600">Loading…</div>
      ) : sections.length ? (
        <div className="space-y-4">
          {sections.map(([title, text]) => (
            <details key={title} className="bg-[#EFF3FF] rounded-xl p-4" open>
              <summary className="font-semibold text-[#3742D1] cursor-pointer">
                {title}
              </summary>
              <div className="mt-2 text-gray-800 whitespace-pre-wrap">{text}</div>
            </details>
          ))}
          {a?.confidence && (
            <p className="text-xs text-gray-500 mt-2">
              Confidence: {a.confidence}. This is informational, not diagnostic.
            </p>
          )}
        </div>
      ) : (
        <div className="text-center bg-[#EFF3FF] p-4 rounded-xl">
          <p className="mb-3">No analysis yet.</p>
          <button
            onClick={async () => {
              await fetch(`/api/analyze?drawingId=${id}`, { method: "POST" });
              location.reload();
            }}
            className="px-4 py-2 rounded-full bg-[#3742D1] text-white"
          >
            Generate Analysis
          </button>
        </div>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#3742D1] py-2 px-6 flex justify-around max-w-md mx-auto rounded-t-2xl shadow-lg">
        <button onClick={() => router.push("/")} className="flex flex-col items-center text-white">
          <span className="text-xs mt-1">Home</span>
        </button>
        <button onClick={() => router.push("/drawings/upload")} className="flex flex-col items-center text-white">
          <span className="text-xs mt-1">Upload</span>
        </button>
        <button onClick={() => router.push("/account")} className="flex flex-col items-center text-white">
          <span className="text-xs mt-1">Account</span>
        </button>
      </nav>
    </div>
  );
}
