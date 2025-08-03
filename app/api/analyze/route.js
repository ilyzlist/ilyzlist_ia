import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';
import { parseAnalysis } from '@/utils/parseAnalysis'; // ✅ on utilise la bonne version

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { imageUrl, childAge, userId, drawingId } = await request.json();
    
    if (!imageUrl || typeof childAge !== 'number' || !userId || !drawingId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('drawings')
      .select('analysis_result')
      .eq('id', drawingId)
      .single();

    if (existing?.analysis_result) {
      return NextResponse.json({
        analysis: existing.analysis_result,
        metadata: {
          fromCache: true
        }
      });
    }

    const { data: user } = await supabase
      .from('profiles')
      .select('analysis_quota')
      .eq('id', userId)
      .single();

    if (!user || user.analysis_quota <= 0) {
      return NextResponse.json({ error: 'Quota exceeded' }, { status: 403 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1200,
      messages: [
        {
          role: "system",
          content: `Analyze this ${childAge}-year-old's drawing. Respond exactly in this format:

1. Emotional Indicators
[Your analysis]

2. Cognitive Development
[Your analysis]

3. Creative Expression
[Your analysis]

4. Recommendations
- [bullet 1]
- [bullet 2]
`
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please analyze in detail:" },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high"
              }
            }
          ]
        }
      ]
    });

    const analysis = response.choices[0]?.message?.content;
    console.log("🧠 Raw OpenAI output:\n", analysis);

    if (!analysis) throw new Error("No analysis content");

    const parsed = parseAnalysis(analysis);
    console.log("✅ Parsed result to save in Supabase:", JSON.stringify(parsed, null, 2));

    const { error } = await supabase
      .from('drawings')
      .update({
        analysis_result: parsed,
        analyzed_at: new Date().toISOString()
      })
      .eq('id', drawingId);

    if (error) throw error;

    await supabase
      .from('profiles')
      .update({ analysis_quota: user.analysis_quota - 1 })
      .eq('id', userId);

    return NextResponse.json({
      analysis: parsed,
      metadata: {
        model: "gpt-4o",
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
