import { NextRequest, NextResponse } from 'next/server';
import { BiomechanicalAngles, AngleEvaluation } from '@/lib/fitting/angles';
export const runtime = 'edge';
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { angles, evaluations, bikeName, bikeCategory } = body;

    if (!angles || !evaluations) {
      return NextResponse.json(
        { error: 'Missing angles or evaluations' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback narrative function
    const generateLocalSummary = () => {
      const kneeEval = evaluations.find((e: AngleEvaluation) => e.angleName.includes('Lutut'));
      const torsoEval = evaluations.find((e: AngleEvaluation) => e.angleName.includes('Torso'));
      const elbowEval = evaluations.find((e: AngleEvaluation) => e.angleName.includes('Siku'));

      return `
### Ringkasan Kondisi Fit Postur Anda
Berdasarkan pemindaian sudut biomekanik pada sepeda **${bikeName || 'Sepeda Anda'}** (${(bikeCategory || 'ROAD').replace('_', ' ')}):

1. **Ekstensi Lutut (${angles.kneeExtensionDeg}°)**: ${kneeEval?.recommendation || 'Rentang lutut normal.'}
2. **Kemiringan Torso (${angles.torsoAngleDeg}°)**: ${torsoEval?.recommendation || 'Kemiringan punggung stabil.'}
3. **Tekukan Siku (${angles.elbowAngleDeg}°)**: ${elbowEval?.recommendation || 'Posisi lengan rileks.'}

> **Catatan Fitter**: Penyesuaian bertahap (5–10 mm per sesi) sangat dianjurkan agar otot-otot lumbar dan hamstring memiliki waktu adaptasi yang cukup sebelum rute panjang.
      `.trim();
    };

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        narrative: generateLocalSummary(),
        isAiGenerated: false
      });
    }

    // Call Gemini API
    const prompt = `
Anda adalah seorang bike fitter profesional bersertifikat (Retul / IBFI).
Tugas Anda adalah merangkai ringkasan naratif bike fitting yang ramah, komunikatif, dan mudah dipahami berdasarkan data sudut terukur:
- Sepeda: ${bikeName || 'Sepeda'} (Kategori: ${bikeCategory})
- Sudut Ekstensi Lutut: ${angles.kneeExtensionDeg}°
- Sudut Torso/Punggung: ${angles.torsoAngleDeg}°
- Sudut Siku: ${angles.elbowAngleDeg}°
- Evaluasi & Rekomendasi Tiap Sendi:
${evaluations.map((e: AngleEvaluation) => `  * ${e.angleName}: Terukur ${e.actualDeg}° (Rentang ideal: ${e.idealMinDeg}° - ${e.idealMaxDeg}°). Status: ${e.status}. Saran: ${e.recommendation}`).join('\n')}

ATURAN KETAT:
1. JANGAN mengubah nilai angka sudut di atas.
2. Jelaskan dengan bahasa Indonesia yang jelas, sportif, dan memotivasi.
3. Beri saran praktis langkah demi langkah (misal penyesuaian saddle, stem, atau posisi tangan).
4. Buat dalam format Markdown 2-3 paragraf ringkas.
    `.trim();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      })
    });

    if (!response.ok) {
      return NextResponse.json({
        success: true,
        narrative: generateLocalSummary(),
        isAiGenerated: false
      });
    }

    const data = await response.json();
    const narrativeText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return NextResponse.json({
      success: true,
      narrative: narrativeText || generateLocalSummary(),
      isAiGenerated: !!narrativeText
    });
  } catch (error) {
    console.error('Bike fit narrative API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
