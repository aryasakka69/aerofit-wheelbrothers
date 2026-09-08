import { RecommendationEngineOutput } from './rules-engine';

export interface GenerateNarrativeParams {
  cda: number;
  bikeName?: string;
  bikeCategory: string;
  recommendations: RecommendationEngineOutput;
  userLevel?: string;
}

/**
 * Fallback static narrative generator when Gemini API is unavailable or unconfigured
 */
export function generateFallbackNarrative(params: GenerateNarrativeParams): string {
  const { cda, bikeCategory, recommendations, bikeName } = params;
  const bikeLabel = bikeName || bikeCategory.replace('_', ' ');

  let tierAnalysis = '';
  if (cda < 0.25) {
    tierAnalysis = `Profil aerodinamika Anda sebesar **${cda.toFixed(4)} m²** tergolong luar biasa! Angka ini berada di level pembalap time-trial kompetitif. Hambatan udara sudah ditekan dengan sangat baik pada sepeda ${bikeLabel}.`;
  } else if (cda < 0.32) {
    tierAnalysis = `Hasil perhitungan menunjukkan nilai CdA sebesar **${cda.toFixed(4)} m²**, mencerminkan postur berkendara road race yang cepat dan efisien pada sepeda ${bikeLabel}. Anda sudah berada di jalur yang tepat!`;
  } else if (cda < 0.38) {
    tierAnalysis = `Nilai CdA Anda saat ini adalah **${cda.toFixed(4)} m²** pada sepeda ${bikeLabel}. Ini adalah angka tipikal pesepeda road bike posisi tuas rem (hoods). Potensi peningkatan kecepatan Anda masih sangat terbuka lebar.`;
  } else {
    tierAnalysis = `Dengan nilai CdA sebesar **${cda.toFixed(4)} m²**, hambatan aerodinamika menjadi faktor terbesar yang menguras tenaga Anda di kecepatan tinggi pada sepeda ${bikeLabel}. Kabar baiknya, perbaikan postur tubuh dasar akan langsung memberikan lonjakan efisiensi drastis!`;
  }

  const topTips = recommendations.tips.slice(0, 3);
  const tipsText = topTips
    .map((t, idx) => `${idx + 1}. **${t.title}** (${t.badge}): ${t.description} (Estimasi penghematan: ~${t.estimatedWattsSavedAt40Kmh} Watt).`)
    .join('\n');

  return `
### Ringkasan Analisis Aerodinamika
${tierAnalysis}

### Langkah Prioritas (Quick Wins)
${tipsText}

> **Saran Coach AeroFit**: Fokuslah terlebih dahulu pada penurunan posisi lengan bawah (*horizontal forearms*) dan perbaikan fit pakaian sebelum mengeluarkan biaya untuk upgrade komponen mahal. Mengubah sudut tubuh tidak memerlukan biaya sepeser pun, namun menyumbang hingga 70% dari total hambatan angin!
  `.trim();
}

/**
 * Call Gemini API on backend to synthesize an inspiring, actionable narrative
 */
export async function callGeminiNarrative(params: GenerateNarrativeParams): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Graceful fallback if API key is not configured
    return generateFallbackNarrative(params);
  }

  try {
    const prompt = `
Anda adalah coach performa dan aerodinamika pesepeda profesional untuk aplikasi AeroFit.
Tugas Anda adalah merangkai ringkasan naratif yang memotivasi, jelas, dan personal berdasarkan DATA VALID berikut:
- Nilai CdA Terhitung: ${params.cda.toFixed(4)} m²
- Sepeda yang Digunakan: ${params.bikeName || 'Sepeda'} (Kategori: ${params.bikeCategory})
- Total Potensi Penurunan CdA: ${params.recommendations.summary.totalPotentialCdaReduction} m²
- Total Potensi Penghematan Daya: ~${params.recommendations.summary.totalPotentialWattsSaved} Watt pada 40 km/h
- Rekomendasi Prioritas:
${params.recommendations.tips.slice(0, 4).map(t => `  * [${t.badge}] ${t.title}: ${t.description} (Potensi hemat: ${t.estimatedWattsSavedAt40Kmh}W)`).join('\n')}

ATURAN KETAT:
1. JANGAN MENGHITUNG ULANG atau mengubah angka-angka numerik di atas. Gunakan angka persis seperti yang disediakan.
2. Gunakan Bahasa Indonesia yang ramah, profesional, dan membakar semangat (ala coach balap sepeda).
3. Berikan saran praktis langkah demi langkah (utamakan perbaikan postur gratis terlebih dahulu sebelum upgrade part mahal).
4. Buat dalam format Markdown yang rapi dan terstruktur (gunakan bullet points, bolding).
5. Panjang respon sekitar 3-4 paragraf ringkas dan to-the-point.
    `.trim();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600
        }
      })
    });

    if (!response.ok) {
      console.warn('Gemini API call returned non-200 status:', response.status);
      return generateFallbackNarrative(params);
    }

    const data = await response.json();
    const narrative = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (narrative && narrative.trim().length > 0) {
      return narrative.trim();
    }

    return generateFallbackNarrative(params);
  } catch (error) {
    console.error('Error invoking Gemini API:', error);
    return generateFallbackNarrative(params);
  }
}
