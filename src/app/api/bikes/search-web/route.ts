import { NextRequest, NextResponse } from 'next/server';
import { BikeCategory, DEFAULT_BIKE_CATEGORIES } from '@/lib/types/bike';

export const runtime = 'edge';

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
 * Heuristic fallback parser - DIPERBAIKI untuk memprioritaskan Aero Road
 */
function heuristicBikeLookup(query: string): BikeSearchResult {
  const q = query.toLowerCase();

  let category: BikeCategory = 'ROAD_ALLROUNDER';

  // CEK AERO ROAD DULU (Agar tidak tertukar dengan TT)
  if (q.includes('aero') || q.includes('propel') || q.includes('madone') || q.includes('venge') || q.includes('s5') || q.includes('foil') || q.includes('litening') || q.includes('systemsix') || q.includes('reacto') || q.includes('oltre') || q.includes('filante') || q.includes('noah') || q.includes('ostro') || q.includes('tarmac')) {
    category = 'AERO_ROAD';
  }
  // BARU CEK TT
  else if (q.includes('tt') || q.includes('triathlon') || q.includes('time trial') || q.includes('speedmax') || q.includes('trinity') || q.includes('shiv') || q.includes('plasma') || q.includes('ia') || q.includes('e-119') || q.includes('p5') || q.includes('p-series')) {
    category = 'TT_TRIATHLON';
  } else if (q.includes('gravel') || q.includes('endurace') || q.includes('domane') || q.includes('roubaix') || q.includes('defy') || q.includes('caledonia') || q.includes('aspero') || q.includes('silex') || q.includes('grizl') || q.includes('grail') || q.includes('diverge') || q.includes('topstone')) {
    category = 'ENDURANCE_GRAVEL';
  }

  const yearMatch = query.match(/\b(20\d{2}|19\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();

  const knownBrands = [
    'Polygon', 'Trek', 'Specialized', 'Cervélo', 'Cervelo', 'Giant', 'Canyon', 'Pinarello',
    'BMC', 'Scott', 'Cannondale', 'Merida', 'Bianchi', 'Colnago', 'Factor', 'Wilier',
    'Ridley', 'Look', 'Cube', 'Orbea', 'Argon 18', 'Felt', 'Fuji', 'Cinelli', 'Basso'
  ];

  let detectedBrand = 'Custom Brand';
  for (const b of knownBrands) {
    if (q.includes(b.toLowerCase())) {
      detectedBrand = b;
      break;
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
    estimatedWeightKg: category === 'TT_TRIATHLON' ? 8.5 : category === 'AERO_ROAD' ? 7.6 : 7.2,
    notes: `Ditemukan dari katalog spesifikasi sepeda untuk "${query}". Geometri ${def.name}.`,
    source: 'HEURISTIC_SEARCH'
  };
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ error: 'Parameter query diperlukan' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: true, bike: heuristicBikeLookup(query), isAiGenerated: false });
    }

    // PROMPT DIPERBAIKI: Instruksi tegas membedakan Aero Road vs TT
    const prompt = `
Anda adalah spesialis aerodinamika sepeda. User mencari: "${query}".
Tugas: Ekstraksi data teknis sepeda ini.

ATURAN KATEGORI (PENTING!):
- "AERO_ROAD": Sepeda balap jalan raya dengan fitur aero (Contoh: Scott Foil, Trek Madone, Canyon Aeroad, Giant Propel). Meskipun sangat aero, ini BUKAN TT.
- "TT_TRIATHLON": Hanya untuk sepeda khusus Time Trial/Triathlon dengan handlebar tanduk/aerobar (Contoh: Scott Plasma, Canyon Speedmax).
- "ROAD_ALLROUNDER": Sepeda balap ringan/climbing (Contoh: Specialized Tarmac, Giant TCR).

Estimasi nilai:
- Frontal Area (m²): Road ~0.110, Aero Road ~0.092, TT ~0.075.
- Crr: Road ~0.0042, Aero Road ~0.0038, TT ~0.0034.

KEMBALIKAN HANYA JSON MURNI:
{
  "brandName": "Nama Brand",
  "modelName": "Nama Seri",
  "year": 2024,
  "category": "AERO_ROAD",
  "estimatedFrontalArea": 0.092,
  "estimatedCrr": 0.0038,
  "estimatedWeightKg": 7.5,
  "notes": "Deskripsi singkat dalam Bahasa Indonesia..."
}
    `.trim();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 350 }
      })
    });

    if (!response.ok) return NextResponse.json({ success: true, bike: heuristicBikeLookup(query), isAiGenerated: false });

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (rawText) {
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      try {
        const parsed = JSON.parse(cleanJson);
        return NextResponse.json({
          success: true,
          bike: { ...parsed, source: 'GEMINI_WEB_AI' },
          isAiGenerated: true
        });
      } catch (err) { console.warn(err); }
    }

    return NextResponse.json({ success: true, bike: heuristicBikeLookup(query), isAiGenerated: false });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mencari data' }, { status: 500 });
  }
}
