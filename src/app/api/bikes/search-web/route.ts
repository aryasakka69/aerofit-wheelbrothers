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
 * HEURISTIC ENGINE UNIVERSAL
 * Logika cerdas memisahkan Aero Road vs TT untuk semua brand
 */
function heuristicBikeLookup(query: string): BikeSearchResult {
  const q = query.toLowerCase();
  let category: BikeCategory = 'ROAD_ALLROUNDER';

  // 1. DAFTAR KATA KUNCI KHUSUS TT/TRIATHLON (Sangat Spesifik)
  const ttKeywords = [
    'tt', 'triathlon', 'time trial', 'speedmax', 'trinity', 'shiv', 'plasma', 'ia',
    'e-119', 'p5', 'p-series', 'aquila', 'slice', 'viper', 'timemachine tt'
  ];

  // 2. DAFTAR KATA KUNCI AERO ROAD (Semua Brand Utama)
  const aeroKeywords = [
    'aero', 'foil', 'madone', 'venge', 'tarmac', 'propel', 's5', 's3', 'litening',
    'systemsix', 'reacto', 'oltre', 'filante', 'noah', 'ostro', 'aeroad', 'dogma',
    'f-series', 'concept', 'scultura aero'
  ];

  // LOGIKA: Cek apakah ada indikasi kuat TT dulu, jika tidak ada dan ada kata aero, maka masuk AERO_ROAD
  const isTT = ttKeywords.some(key => q.includes(key));
  const isAero = aeroKeywords.some(key => q.includes(key));

  if (isTT) {
    category = 'TT_TRIATHLON';
  } else if (isAero) {
    category = 'AERO_ROAD';
  } else if (q.includes('gravel') || q.includes('endurace') || q.includes('domane') || q.includes('roubaix') || q.includes('diverge')) {
    category = 'ENDURANCE_GRAVEL';
  }

  const yearMatch = query.match(/\b(20\d{2}|19\d{2})\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : new Date().getFullYear();
  const def = DEFAULT_BIKE_CATEGORIES[category];

  return {
    brandName: 'Detected Brand',
    modelName: query.trim(),
    year,
    category,
    estimatedFrontalArea: def.defaultFrontalArea,
    estimatedCrr: def.defaultCrr,
    estimatedWeightKg: category === 'TT_TRIATHLON' ? 8.5 : 7.6,
    notes: `Klasifikasi cerdas untuk "${query}". Kategori: ${def.name}.`,
    source: 'HEURISTIC_SEARCH'
  };
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ success: true, bike: heuristicBikeLookup(query), isAiGenerated: false });

    // PROMPT AI UNIVERSAL: Mengajari AI cara membedakan kategori secara fisik & fungsional
    const prompt = `
Anda adalah database engineer sepeda balap dunia. User mencari: "${query}".
Identifikasi spesifikasi teknisnya dengan aturan klasifikasi UNIVERSAL berikut:

ATURAN KLASIFIKASI KATEGORI:
1. "AERO_ROAD": Sepeda balap jalan raya (drop bar) yang didesain aerodinamis. 
   Contoh: Scott Foil, Trek Madone, Giant Propel, Canyon Aeroad, Specialized Venge/Tarmac, Cervelo S5.
   Ciri: Tidak punya tanduk/aerobar tambahan secara standar.
   
2. "TT_TRIATHLON": Sepeda khusus balap sendirian (Time Trial) atau Triathlon.
   Contoh: Scott Plasma, Canyon Speedmax, Cervelo P5, Specialized Shiv, Giant Trinity.
   Ciri: Menggunakan aerobar/extension bar di depan.

3. "ROAD_ALLROUNDER": Sepeda balap ringan (climbing). Contoh: Giant TCR, Specialized Aethos.
4. "ENDURANCE_GRAVEL": Sepeda jarak jauh atau medan kasar. Contoh: Specialized Diverge, Canyon Grizl.

KEMBALIKAN JSON MURNI:
{
  "brandName": "Merk Sepeda",
  "modelName": "Nama Seri Lengkap",
  "year": 2024,
  "category": "PILIH SALAH SATU DARI 4 DI ATAS",
  "estimatedFrontalArea": 0.092, 
  "estimatedCrr": 0.0038,
  "estimatedWeightKg": 7.5,
  "notes": "Jelaskan mengapa masuk kategori tersebut (1 kalimat)."
}
    `.trim();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 400 }
      })
    });

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (rawText) {
      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      return NextResponse.json({ success: true, bike: { ...parsed, source: 'GEMINI_WEB_AI' }, isAiGenerated: true });
    }

    return NextResponse.json({ success: true, bike: heuristicBikeLookup(query), isAiGenerated: false });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal' }, { status: 500 });
  }
}