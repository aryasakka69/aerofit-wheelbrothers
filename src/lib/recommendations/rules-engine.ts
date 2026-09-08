import { BikeCategory } from '../types/bike';
import { CdaCalculationResult } from '../types/cda';

export interface AeroTip {
  id: string;
  category: 'BODY_POSITION' | 'EQUIPMENT' | 'APPAREL_ACCESSORIES';
  title: string;
  description: string;
  estimatedCdaDeltaMin: number; // e.g. -0.015
  estimatedCdaDeltaMax: number; // e.g. -0.030
  estimatedWattsSavedAt40Kmh: number; // approx watts saved at 40km/h
  effortLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  costLevel: 'FREE' | 'LOW' | 'MEDIUM' | 'HIGH';
  priorityScore: number; // Higher means higher priority (Quick Win)
  badge: 'Quick Win' | 'High Impact' | 'Gear Upgrade' | 'Long Term';
  applicableCategories?: BikeCategory[];
}

export const AERO_TIPS_DATABASE: AeroTip[] = [
  {
    id: 'tip-hoods-90-elbows',
    category: 'BODY_POSITION',
    title: 'Posisi "Horizontal Forearms" di Hoods',
    description: 'Tekuk siku hingga mendekati 90° dengan lengan bawah sejajar permukaan jalan. Menurunkan torso secara dramatis memotong frontal area.',
    estimatedCdaDeltaMin: -0.025,
    estimatedCdaDeltaMax: -0.045,
    estimatedWattsSavedAt40Kmh: 20,
    effortLevel: 'LOW',
    costLevel: 'FREE',
    priorityScore: 98,
    badge: 'Quick Win',
    applicableCategories: ['ROAD_ALLROUNDER', 'AERO_ROAD', 'ENDURANCE_GRAVEL']
  },
  {
    id: 'tip-head-tuck',
    category: 'BODY_POSITION',
    title: 'Turtle Head & Shrug Bahu',
    description: 'Rapatkan bahu ke arah leher ("turtle posture") dan turunkan kepala tanpa menghalangi pandangan ke depan. Mengurangi turbulensi di belakang helm.',
    estimatedCdaDeltaMin: -0.010,
    estimatedCdaDeltaMax: -0.020,
    estimatedWattsSavedAt40Kmh: 12,
    effortLevel: 'LOW',
    costLevel: 'FREE',
    priorityScore: 92,
    badge: 'Quick Win'
  },
  {
    id: 'tip-tight-apparel',
    category: 'APPAREL_ACCESSORIES',
    title: 'Kenakan Jersey Pas Badan (Race-Fit / Skinsuit)',
    description: 'Kain yang berkibar menciptakan hambatan gesek dan separasi aliran udara besar. Jersey race-fit ketat memberikan efisiensi instan.',
    estimatedCdaDeltaMin: -0.015,
    estimatedCdaDeltaMax: -0.030,
    estimatedWattsSavedAt40Kmh: 15,
    effortLevel: 'LOW',
    costLevel: 'LOW',
    priorityScore: 89,
    badge: 'Quick Win'
  },
  {
    id: 'tip-aero-helmet',
    category: 'EQUIPMENT',
    title: 'Gunakan Helm Aero Road / TT',
    description: 'Mengganti helm standar berventilasi banyak dengan helm aero road terbukti memangkas turbulensi udara di atas kepala dan leher.',
    estimatedCdaDeltaMin: -0.010,
    estimatedCdaDeltaMax: -0.020,
    estimatedWattsSavedAt40Kmh: 10,
    effortLevel: 'LOW',
    costLevel: 'MEDIUM',
    priorityScore: 82,
    badge: 'High Impact'
  },
  {
    id: 'tip-narrow-handlebar',
    category: 'EQUIPMENT',
    title: 'Persempit Lebar Handlebar (38cm atau 40cm)',
    description: 'Banyak pesepeda menggunakan handlebar 42-44cm yang terlalu lebar. Memakai handlebar 38-40cm merapatkan bahu dan memotong frontal area secara nyata.',
    estimatedCdaDeltaMin: -0.012,
    estimatedCdaDeltaMax: -0.025,
    estimatedWattsSavedAt40Kmh: 14,
    effortLevel: 'MEDIUM',
    costLevel: 'MEDIUM',
    priorityScore: 80,
    badge: 'High Impact',
    applicableCategories: ['ROAD_ALLROUNDER', 'AERO_ROAD', 'ENDURANCE_GRAVEL']
  },
  {
    id: 'tip-aero-socks',
    category: 'APPAREL_ACCESSORIES',
    title: 'Kaos Kaki Aero Bertekstur',
    description: 'Kaki pesepeda bergerak konstan dan menghasilkan aliran turbulen. Bahan bertekstur/ribbed menunda separasi aliran udara.',
    estimatedCdaDeltaMin: -0.005,
    estimatedCdaDeltaMax: -0.010,
    estimatedWattsSavedAt40Kmh: 5,
    effortLevel: 'LOW',
    costLevel: 'LOW',
    priorityScore: 78,
    badge: 'Quick Win'
  },
  {
    id: 'tip-deep-wheels',
    category: 'EQUIPMENT',
    title: 'Upgrade Wheelset Profil Sedang/Dalam (45-60mm)',
    description: 'Rim berprofil aerofoil mengurangi drag rotasi dan efek hambatan angin silang (crosswind sail effect).',
    estimatedCdaDeltaMin: -0.010,
    estimatedCdaDeltaMax: -0.022,
    estimatedWattsSavedAt40Kmh: 12,
    effortLevel: 'MEDIUM',
    costLevel: 'HIGH',
    priorityScore: 65,
    badge: 'Gear Upgrade'
  },
  {
    id: 'tip-aerobars-clipon',
    category: 'EQUIPMENT',
    title: 'Pasang Clip-on Aerobars (Untuk Solo / TT / Tri)',
    description: 'Menempatkan lengan pada pads aerobars mengubah postur secara radikal menjadi profil TT, menghasilkan penurunan CdA paling besar.',
    estimatedCdaDeltaMin: -0.040,
    estimatedCdaDeltaMax: -0.070,
    estimatedWattsSavedAt40Kmh: 35,
    effortLevel: 'MEDIUM',
    costLevel: 'MEDIUM',
    priorityScore: 75,
    badge: 'High Impact',
    applicableCategories: ['ROAD_ALLROUNDER', 'AERO_ROAD', 'ENDURANCE_GRAVEL']
  },
  {
    id: 'tip-integrated-aero-frame',
    category: 'EQUIPMENT',
    title: 'Pertimbangkan Frame Sepeda Aero Terintegrasi (Jangka Panjang)',
    description: 'Sepeda kategori road non-aero/climbing memiliki bentuk tabung bundar. Beralih ke frame aero dengan kabel tersembunyi penuh memangkas drag intrinsik sepeda.',
    estimatedCdaDeltaMin: -0.015,
    estimatedCdaDeltaMax: -0.025,
    estimatedWattsSavedAt40Kmh: 14,
    effortLevel: 'HIGH',
    costLevel: 'HIGH',
    priorityScore: 50,
    badge: 'Long Term',
    applicableCategories: ['ROAD_ALLROUNDER', 'ENDURANCE_GRAVEL']
  }
];

export interface RecommendationEngineOutput {
  cda: number;
  bikeCategory: BikeCategory;
  tips: AeroTip[];
  summary: {
    totalPotentialCdaReduction: number;
    totalPotentialWattsSaved: number;
    quickWinsCount: number;
  };
}

/**
 * Run deterministic rule engine based on CdA result and bike category
 */
export function generateRecommendations(
  calculation: CdaCalculationResult,
  bikeCategory: BikeCategory
): RecommendationEngineOutput {
  const cda = calculation.cda;

  // Filter tips applicable to this bike category
  const filtered = AERO_TIPS_DATABASE.filter(tip => {
    if (tip.applicableCategories && !tip.applicableCategories.includes(bikeCategory)) {
      return false;
    }
    // If rider already has very low CdA (< 0.24), omit basic road position tips
    if (cda < 0.24 && tip.id === 'tip-hoods-90-elbows') {
      return false;
    }
    // If rider is using TT bike, prioritize TT head tuck & aero bottles over road handlebars
    if (bikeCategory === 'TT_TRIATHLON' && tip.id === 'tip-narrow-handlebar') {
      return false;
    }
    return true;
  });

  // Sort by priorityScore descending (Quick Wins first)
  const sorted = [...filtered].sort((a, b) => b.priorityScore - a.priorityScore);

  const totalReduction = sorted
    .slice(0, 4)
    .reduce((acc, curr) => acc + Math.abs(curr.estimatedCdaDeltaMax), 0);
  
  const totalWatts = sorted
    .slice(0, 4)
    .reduce((acc, curr) => acc + curr.estimatedWattsSavedAt40Kmh, 0);

  const quickWins = sorted.filter(t => t.badge === 'Quick Win').length;

  return {
    cda,
    bikeCategory,
    tips: sorted,
    summary: {
      totalPotentialCdaReduction: Number(totalReduction.toFixed(3)),
      totalPotentialWattsSaved: Math.round(totalWatts),
      quickWinsCount: quickWins
    }
  };
}
