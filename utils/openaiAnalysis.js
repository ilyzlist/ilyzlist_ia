// utils/openaiAnalysis.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function analyzeDrawingWithOpenAIVision(imageBase64) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: "You're a child psychologist specializing in drawing analysis. Provide detailed insights about emotional state, cognitive development, and potential psychological indicators."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this child's drawing in detail, focusing on: 1. Emotional indicators 2. Developmental stage markers 3. Potential psychological insights 4. Creative expression. Provide professional but parent-friendly analysis."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    return response.choices[0]?.message?.content || "Analysis unavailable";
  } catch (error) {
    console.error("OpenAI Vision Error:", error);
    throw new Error("Failed to analyze drawing");
  }
}