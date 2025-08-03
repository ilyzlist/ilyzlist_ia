// utils/drawinganalysis.js

export const analyzeDrawing = async (imageUrl, childAge, userId, drawingId) => {
  try {
    // Vérifie que tout est bien fourni
    if (!imageUrl || typeof childAge !== 'number' || !userId || !drawingId) {
      console.error("❌ Données manquantes :", { imageUrl, childAge, userId, drawingId });
      throw new Error("Missing required fields");
    }

    console.log("📦 Envoi à /api/analyze :", { imageUrl, childAge, userId, drawingId });

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, childAge, userId, drawingId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Analysis failed");
    }

    return await response.json();
  } catch (error) {
    console.error("🔴 analyzeDrawing error:", error);
    throw error;
  }
};
