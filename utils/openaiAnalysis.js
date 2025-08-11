// utils/openaiAnalysis.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze a child's drawing with OpenAI Vision.
 * - Keeps the exact 4-section structure your parser/UI expects.
 * - Produces fuller, parent-friendly insights and practical actions.
 * - Optional `lang` param: "en" (default) or "fr".
 */
export async function analyzeDrawingWithOpenAIVision(imageBase64, lang = "en") {
  const languageLine =
    lang === "fr"
      ? "Rédige la réponse en français simple et bienveillant."
      : "Write the response in clear, warm English for parents.";

  try {
    const response = await openai.chat.completions.create({
      // Keep compatibility with your current SDK usage
      model: "gpt-4-vision-preview",
      temperature: 0.4,
      max_tokens: 1100,
      messages: [
        {
          role: "system",
          content:
            "You are a licensed child psychologist who specializes in interpreting children's drawings. " +
            "Be empathetic, practical, and avoid clinical diagnosis. Ground every point in observable visual evidence (colors, pressure, placement, symbols, line quality, composition). " +
            "Keep it encouraging. Never alarm. Always add helpful context and gentle caveats.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                `${languageLine}\n\n` +
                "Analyze this child's drawing and return EXACTLY these four sections with these exact headings (no extra sections):\n\n" +
                "1. Emotional Indicators\n" +
                "   - 5–7 sentences. Refer to color choices, energy/pressure, facial expressions, and overall mood. Clearly separate strong/weak signals and acknowledge ambiguity when relevant.\n\n" +
                "2. Cognitive Development\n" +
                "   - 5–7 sentences. Discuss age-typical markers (planning, spatial layout, sequencing, fine-motor control, symbol consistency) without stating an age. Mention strengths and areas to nurture.\n\n" +
                "3. Creative Expression\n" +
                "   - 4–6 sentences. Describe themes, imagination/narrative, risk-taking, and originality. Highlight what is unique and what might be developing next.\n\n" +
                "4. Recommendations\n" +
                "   - Provide 6–10 actionable bullet points starting with '- ' (dash + space). Mix quick activities at home, conversation starters, suggested materials, and gentle watch-fors phrased non-alarmingly.\n\n" +
                "IMPORTANT:\n" +
                "- Use ONLY those four headings *exactly* (with the same numbering and wording).\n" +
                "- No markdown formatting (no **bold**, no lists except the dashes in section 4).\n" +
                "- Keep the overall length around 400–600 words.\n" +
                "- Include a short, friendly one-sentence caveat that this is not a diagnosis.\n",
            },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    return content || "Analysis unavailable";
  } catch (error) {
    console.error("OpenAI Vision Error:", error);
    throw new Error("Failed to analyze drawing");
  }
}
