// utils/parseAnalysis.js

export function parseAnalysis(content) {
  const sections = {
    emotional: { analysis: '' },
    cognitive: { analysis: '' },
    creative: { analysis: '' },
    recommendations: { actions: [] },
  };

  if (typeof content !== 'string') {
    console.warn("⚠️ Content n'est pas une string :", typeof content);
    return sections;
  }

  try {
    // DEBUG : Voir le contenu complet généré par GPT
    console.log("🧠 Contenu GPT complet reçu :\n", content);

    // Regex plus tolérantes
    const emotionalMatch = content.match(/1\.\s*Emotional Indicators\s*\n?([\s\S]*?)(?=2\.\s*Cognitive Development)/i);
    const cognitiveMatch = content.match(/2\.\s*Cognitive Development\s*\n?([\s\S]*?)(?=3\.\s*Creative Expression)/i);
    const creativeMatch = content.match(/3\.\s*Creative Expression\s*\n?([\s\S]*?)(?=4\.\s*Recommendations)/i);
    const recommendationsMatch = content.match(/4\.\s*Recommendations\s*\n?([\s\S]*)/i);

    // Extraction avec log de vérification
    if (emotionalMatch) {
      sections.emotional.analysis = emotionalMatch[1].trim();
      console.log("✅ Emotional section trouvée");
    } else {
      console.warn("❌ Emotional section introuvable");
    }

    if (cognitiveMatch) {
      sections.cognitive.analysis = cognitiveMatch[1].trim();
      console.log("✅ Cognitive section trouvée");
    } else {
      console.warn("❌ Cognitive section introuvable");
    }

    if (creativeMatch) {
      sections.creative.analysis = creativeMatch[1].trim();
      console.log("✅ Creative section trouvée");
    } else {
      console.warn("❌ Creative section introuvable");
    }

    if (recommendationsMatch) {
      const raw = recommendationsMatch[1];
      const lines = raw.split('\n');
      const actions = lines
        .filter(line => line.trim().match(/^[-*•]/))
        .map(line => line.replace(/^[-*•]\s*/, '').trim());

      sections.recommendations.actions = actions;
      console.log("✅ Recommendations trouvées :", actions.length, "action(s)");
    } else {
      console.warn("❌ Recommendations introuvables");
    }

    return sections;
  } catch (err) {
    console.error("❌ Erreur dans parseAnalysis:", err.message);
    sections.emotional.analysis = content; // Fallback brut
    return sections;
  }
}
