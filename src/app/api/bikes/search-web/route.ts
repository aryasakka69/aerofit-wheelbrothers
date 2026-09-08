import { NextRequest, NextResponse } from 'next/server';
import { BikeCategory, DEFAULT_BIKE_CATEGORIES } from '@/lib/types/bike';

export interface BikeSearchResult {
  brandName: string;
  modelName: string;
  year: number;
  category: BikeCategory;
  estimatedFrontalArea: number;
  estimatedCrr: number;
  estimatedWeightKg: number;
  notes: string;
  source: 'GEMINI_WEB_AI' | 'HEURISTIC_SEARCH';
}

/**
 * Heuristic fallback parser when Gemini API key is not configured
 */
function heuristicBikeLookup(query: string): BikeSearchResult {
  const q = query.toLowerCase();

  // 1. Detect Category
  let category: BikeCategory = 'ROAD_ALLROUNDER';
  if (q.includes('tt') || q.includes('triathlon') || q.includes('time trial') || q.includes('speed') || q.includes('trinity') || q.includes('shiv') || q.includes('plasma') || q.includes('ia') || q.includes('e-119')) {
    category = 'TT_TRIATHLON';
  } else if (q.includes('aero') || q.includes('propel') || q.includes('madone') || q.includes('venge') || q.includes('s5') || q.includes('foil') || q.includes('litening') || q.includes('systemsix') || q.includes('reacto') || q.includes('oltre') || q.includes('filante') || q.includes('noah') || q.includes('ostro')) {
    category = 'AERO_ROAD';
  } else if (q.includes('gravel') || q.includes('endurace') || q.includes('domane') || q.includes('roubaix') || q.includes('defy') || q.includes('caledonia') || q.includes('aspero') || q.includes('silex') || q.includes('grizl') || q.includes('grail') || q.includes('diverge') || q.includes('topstone') || q.includes('tambora')) {
    category = 'ENDURANCE_GRAVEL';
  }

  // 2. Detect Year (e.g. 2024, 2022, etc.)
  const yearMatch = query.match(/\b(20\d{2}|19\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

  // 3. Detect Brand
  const knownBrands = [
    'Polygon', 'Trek', 'Specialized', 'Cervélo', 'Cervelo', 'Giant', 'Canyon', 'Pinarello',
    'BMC', 'Scott', 'Cannondale', 'Merida', 'Bianchi', 'Colnago', 'Factor', 'Wilier',
    'Ridley', 'Look', 'Cube', 'Orbea', 'Argon 18', 'Felt', 'Fuji', 'Cinelli', 'Basso',
    'Marin', 'KTM', 'Quintana Roo', 'Ceepo', 'Boardman', 'Ribble', 'Lapierre', 'Focus', 'Chapter2'
  ];

  let detectedBrand = 'Custom Brand';
  for (const b of knownBrands) {
    if (q.includes(b.toLowerCase())) {
      detectedBrand = b;
      break;
    }
  }

  // If no known brand matched, use first word
  if (detectedBrand === 'Custom Brand') {
    const words = query.trim().split(/\s+/);
    if (words.length > 0) {
      detectedBrand = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    }
  }

  const def = DEFAULT_BIKE_CATEGORIES[category];

  return {
    brandName: detectedBrand,
    modelName: query.trim(),
    year,
    category,
    estimatedFrontalArea: def.defaultFrontalArea,
    estimatedCrr: def.defaultCrr,
    estimatedWeightKg: category === 'TT_TRIATHLON' ? 8.5 : category === 'AERO_ROAD' ? 7.6 : category === 'ROAD_ALLROUNDER' ? 7.2 : 8.8,
    notes: `Ditemukan dari katalog spesifikasi sepeda untuk "${query}". Geometri ${def.name}.`,
    source: 'HEURISTIC_SEARCH'
  };
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json({ error: 'Parameter query diperlukan' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Offline / No API key fallback
      const result = heuristicBikeLookup(query);
      return NextResponse.json({
        success: true,
        bike: result,
        isAiGenerated: false
      });
    }

    // Call Gemini API to extract bike technical aerodynamics
    const prompt = `
Anda adalah bike database engineer dan spesialis aerodinamika sepeda balap.
User mencari data sepeda dengan query: "${query}".

Tugas Anda:
1. Ekstraksi dan identifikasi informasi sepeda tersebut.
2. Tentukan brand, nama model resmi, tahun rilis (default tahun saat ini jika tidak spesifik), kategori sepeda (PILIH SALAH SATU: "ROAD_ALLROUNDER", "AERO_ROAD", "TT_TRIATHLON", atau "ENDURANCE_GRAVEL").
3. Berikan estimasi frontal area kontribusi sepeda saja dalam m² (Road ~0.110 m², Aero ~0.090 m², TT ~0.070 m², Gravel ~0.130 m²).
4. Berikan estimasi koefisien rolling resistance Crr (Road ~0.0042, Aero ~0.0038, TT ~0.0034, Gravel ~0.0060).
5. Berikan estimasi berat sepeda standar (kg) dan catatan geometri/fitur aero singkat dalam 1-2 kalimat bahasa Indonesia.

KEMBALIKAN HANYA JSON MURNI dengan format berikut (tanpa markdown backtick):
{
  "brandName": "Nama Brand",
  "modelName": "Nama Seri/Model Resmi",
  "year": 2024,
  "category": "AERO_ROAD",
  "estimatedFrontalArea": 0.089,
  "estimatedCrr": 0.0038,
  "estimatedWeightKg": 7.5,
  "notes": "Deskripsi fitur aerodinamika atau geometri sepeda..."
}
    `.trim();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 350
        }
      })
    });

    if (!response.ok) {
      const fallback = heuristicBikeLookup(query);
      return NextResponse.json({ success: true, bike: fallback, isAiGenerated: false });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (rawText) {
      // Clean possible markdown code fences
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      try {
        const parsed = JSON.parse(cleanJson);
        const category: BikeCategory = ['ROAD_ALLROUNDER', 'AERO_ROAD', 'TT_TRIATHLON', 'ENDURANCE_GRAVEL'].includes(parsed.category)
          ? parsed.category
          : 'ROAD_ALLROUNDER';

        return NextResponse.json({
          success: true,
          bike: {
            brandName: parsed.brandName || 'Custom Brand',
            modelName: parsed.modelName || query,
            year: parsed.year || new Date().getFullYear(),
            category,
            estimatedFrontalArea: Number(parsed.estimatedFrontalArea) || 0.095,
            estimatedCrr: Number(parsed.estimatedCrr) || 0.0040,
            estimatedWeightKg: Number(parsed.estimatedWeightKg) || 7.8,
            notes: parsed.notes || `Data spesifikasi untuk ${query}`,
            source: 'GEMINI_WEB_AI'
          },
          isAiGenerated: true
        });
      } catch (err) {
        console.warn('Failed to parse Gemini JSON output', err);
      }
    }

    const fallback = heuristicBikeLookup(query);
    return NextResponse.json({ success: true, bike: fallback, isAiGenerated: false });

  } catch (error) {
    console.error('Error in bike search web API:', error);
    return NextResponse.json({ error: 'Gagal mencari data sepeda di internet' }, { status: 500 });
  }
}
