// utils/drawingAnalysis.js
export const analyzeDrawing = async (imageUrl, childAge, userId) => {
  try {
    const response = await fetch('/api/analyze-drawing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl, childAge, userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Analysis failed');
    }

    return await response.json();
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};
