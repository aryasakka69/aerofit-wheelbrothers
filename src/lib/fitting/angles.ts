import { BikeCategory } from '../types/bike';

export interface Point2D {
  x: number; // normalized 0..1 or pixel coordinates
  y: number;
  visibility?: number;
}

export interface PoseLandmarks {
  nose?: Point2D;
  leftEye?: Point2D;
  rightEye?: Point2D;
  leftEar?: Point2D;
  rightEar?: Point2D;
  leftShoulder: Point2D;
  rightShoulder?: Point2D;
  leftElbow: Point2D;
  rightElbow?: Point2D;
  leftWrist: Point2D;
  rightWrist?: Point2D;
  leftHip: Point2D;
  rightHip?: Point2D;
  leftKnee: Point2D;
  rightKnee?: Point2D;
  leftAnkle: Point2D;
  rightAnkle?: Point2D;
}

export interface BiomechanicalAngles {
  kneeExtensionDeg: number; // Sudut lutut saat kayuhan terendah (Bottom Dead Center)
  kneeFlexionDeg?: number; // Sudut lutut saat kayuhan tertinggi (Top Dead Center)
  torsoAngleDeg: number; // Sudut punggung terhadap bidang horizontal
  elbowAngleDeg: number; // Sudut siku
  neckAngleDeg: number; // Sudut leher/kepala terhadap torso
  saddleToHandlebarDropCm?: number; // Estimasi drop saddle-to-cockpit
}

export interface IdealAngleRange {
  min: number;
  max: number;
  optimal: number;
  unit: string;
  label: string;
}

export interface BikeFitStandards {
  kneeExtension: IdealAngleRange;
  torsoAngle: IdealAngleRange;
  elbowAngle: IdealAngleRange;
  neckAngle: IdealAngleRange;
}

/**
 * Ideal fitting ranges by bike category (based on international bike-fitting literature: Retul, Trek Precision Fit, Dan Empfield/F.I.S.T.)
 */
export const BIKE_CATEGORY_FIT_STANDARDS: Record<BikeCategory, BikeFitStandards> = {
  ROAD_ALLROUNDER: {
    kneeExtension: { min: 138, max: 147, optimal: 142, unit: '°', label: 'Sudut Ekstensi Lutut (BDC)' },
    torsoAngle: { min: 40, max: 50, optimal: 45, unit: '°', label: 'Sudut Torso / Punggung' },
    elbowAngle: { min: 130, max: 155, optimal: 145, unit: '°', label: 'Sudut Siku' },
    neckAngle: { min: 25, max: 35, optimal: 30, unit: '°', label: 'Sudut Leher' }
  },
  AERO_ROAD: {
    kneeExtension: { min: 140, max: 148, optimal: 144, unit: '°', label: 'Sudut Ekstensi Lutut (BDC)' },
    torsoAngle: { min: 28, max: 40, optimal: 33, unit: '°', label: 'Sudut Torso / Punggung' },
    elbowAngle: { min: 95, max: 130, optimal: 110, unit: '°', label: 'Sudut Siku' },
    neckAngle: { min: 20, max: 32, optimal: 25, unit: '°', label: 'Sudut Leher' }
  },
  TT_TRIATHLON: {
    kneeExtension: { min: 142, max: 150, optimal: 146, unit: '°', label: 'Sudut Ekstensi Lutut (BDC)' },
    torsoAngle: { min: 14, max: 24, optimal: 18, unit: '°', label: 'Sudut Torso / Punggung' },
    elbowAngle: { min: 82, max: 98, optimal: 90, unit: '°', label: 'Sudut Siku (di Aerobars)' },
    neckAngle: { min: 15, max: 28, optimal: 20, unit: '°', label: 'Sudut Leher' }
  },
  ENDURANCE_GRAVEL: {
    kneeExtension: { min: 136, max: 145, optimal: 140, unit: '°', label: 'Sudut Ekstensi Lutut (BDC)' },
    torsoAngle: { min: 45, max: 55, optimal: 50, unit: '°', label: 'Sudut Torso / Punggung' },
    elbowAngle: { min: 135, max: 160, optimal: 150, unit: '°', label: 'Sudut Siku' },
    neckAngle: { min: 30, max: 40, optimal: 35, unit: '°', label: 'Sudut Leher' }
  }
};

/**
 * Calculate angle ABC (with vertex B) in degrees between vector BA and vector BC
 */
export function calculate3PointAngle(A: Point2D, B: Point2D, C: Point2D): number {
  const BAx = A.x - B.x;
  const BAy = A.y - B.y;
  const BCx = C.x - B.x;
  const BCy = C.y - B.y;

  const dot = BAx * BCx + BAy * BCy;
  const magBA = Math.sqrt(BAx * BAx + BAy * BAy);
  const magBC = Math.sqrt(BCx * BCx + BCy * BCy);

  if (magBA === 0 || magBC === 0) return 0;

  const cosTheta = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  const angleRad = Math.acos(cosTheta);
  return Number(((angleRad * 180) / Math.PI).toFixed(1));
}

/**
 * Calculate torso inclination angle relative to the horizontal floor
 * 0° = completely horizontal (flat back), 90° = vertical upright
 */
export function calculateTorsoAngle(hip: Point2D, shoulder: Point2D): number {
  // In canvas/image coordinates: y increases downwards
  const dx = Math.abs(shoulder.x - hip.x);
  const dy = Math.abs(hip.y - shoulder.y); // hip is lower (higher y) than shoulder

  if (dx === 0) return 90;
  const rad = Math.atan2(dy, dx);
  return Number(((rad * 180) / Math.PI).toFixed(1));
}

/**
 * Calculate all biomechanical angles from side-view pose landmarks
 */
export function extractBiomechanicalAngles(landmarks: PoseLandmarks): BiomechanicalAngles {
  // Use left side landmarks (or right if left is not visible)
  const hip = landmarks.leftHip;
  const knee = landmarks.leftKnee;
  const ankle = landmarks.leftAnkle;
  const shoulder = landmarks.leftShoulder;
  const elbow = landmarks.leftElbow;
  const wrist = landmarks.leftWrist;
  const ear = landmarks.leftEar || landmarks.nose || { x: shoulder.x + 0.05, y: shoulder.y - 0.1 };

  // 1. Knee Extension: angle Hip - Knee - Ankle
  const kneeExt = calculate3PointAngle(hip, knee, ankle);

  // 2. Torso Angle vs horizontal
  const torso = calculateTorsoAngle(hip, shoulder);

  // 3. Elbow Angle: angle Shoulder - Elbow - Wrist
  const elbowAngle = calculate3PointAngle(shoulder, elbow, wrist);

  // 4. Neck Angle: angle between torso line and ear line
  const neckAngle = calculate3PointAngle(hip, shoulder, ear);

  // 5. Saddle to handlebar vertical drop approximation (in normalized units scaled to ~cm)
  const dropEstimatedCm = Number(Math.max(0, (wrist.y - hip.y) * 80).toFixed(1));

  return {
    kneeExtensionDeg: kneeExt,
    torsoAngleDeg: torso,
    elbowAngleDeg: elbowAngle,
    neckAngleDeg: neckAngle,
    saddleToHandlebarDropCm: dropEstimatedCm
  };
}

export interface AngleEvaluation {
  angleName: string;
  actualDeg: number;
  idealMinDeg: number;
  idealMaxDeg: number;
  optimalDeg: number;
  status: 'OPTIMAL' | 'TOO_LOW' | 'TOO_HIGH';
  differenceDeg: number;
  recommendation: string;
}

/**
 * Compare actual calculated angles against ideal standards for the bike category
 */
export function evaluateFitAngles(
  angles: BiomechanicalAngles,
  category: BikeCategory
): AngleEvaluation[] {
  const standards = BIKE_CATEGORY_FIT_STANDARDS[category] || BIKE_CATEGORY_FIT_STANDARDS.ROAD_ALLROUNDER;
  const results: AngleEvaluation[] = [];

  // 1. Knee extension evaluation
  const knee = angles.kneeExtensionDeg;
  const kStd = standards.kneeExtension;
  let kStatus: 'OPTIMAL' | 'TOO_LOW' | 'TOO_HIGH' = 'OPTIMAL';
  let kRec = 'Tinggi saddle Anda sudah berada dalam rentang ideal untuk kayuhan efisien tanpa membebani patella.';
  let kDiff = 0;

  if (knee < kStd.min) {
    kStatus = 'TOO_LOW';
    kDiff = Number((kStd.min - knee).toFixed(1));
    kRec = `Saddle terlalu rendah (${kDiff}° di bawah batas). Rekomendasi: Naikkan tiang saddle 1.0 – 2.0 cm untuk mencegah nyeri lutut anterior.`;
  } else if (knee > kStd.max) {
    kStatus = 'TOO_HIGH';
    kDiff = Number((knee - kStd.max).toFixed(1));
    kRec = `Lutut terlalu meregang (${kDiff}° di atas batas). Rekomendasi: Turunkan tiang saddle 0.5 – 1.5 cm agar pinggul tidak bergoyang (rocking hips).`;
  }

  results.push({
    angleName: 'Sudut Ekstensi Lutut (BDC)',
    actualDeg: knee,
    idealMinDeg: kStd.min,
    idealMaxDeg: kStd.max,
    optimalDeg: kStd.optimal,
    status: kStatus,
    differenceDeg: kDiff,
    recommendation: kRec
  });

  // 2. Torso angle evaluation
  const torso = angles.torsoAngleDeg;
  const tStd = standards.torsoAngle;
  let tStatus: 'OPTIMAL' | 'TOO_LOW' | 'TOO_HIGH' = 'OPTIMAL';
  let tRec = `Kemiringan punggung Anda (${torso}°) sudah optimal untuk karakteristik sepeda ${category.replace('_', ' ')}.`;
  let tDiff = 0;

  if (torso > tStd.max) {
    tStatus = 'TOO_HIGH';
    tDiff = Number((torso - tStd.max).toFixed(1));
    tRec = `Posisi torso terlalu tegak (${tDiff}° lebih tinggi). Rekomendasi: Turunkan stem 1–2 spacer atau biasakan menekuk siku agar frontal area lebih ramping.`;
  } else if (torso < tStd.min) {
    tStatus = 'TOO_LOW';
    tDiff = Number((tStd.min - torso).toFixed(1));
    tRec = `Posisi torso sangat agresif (${tDiff}° di bawah batas ideal). Pastikan kelenturan hamstring & pinggang bawah cukup untuk menghindari kelelahan dini.`;
  }

  results.push({
    angleName: 'Sudut Kemiringan Torso',
    actualDeg: torso,
    idealMinDeg: tStd.min,
    idealMaxDeg: tStd.max,
    optimalDeg: tStd.optimal,
    status: tStatus,
    differenceDeg: tDiff,
    recommendation: tRec
  });

  // 3. Elbow angle evaluation
  const elbow = angles.elbowAngleDeg;
  const eStd = standards.elbowAngle;
  let eStatus: 'OPTIMAL' | 'TOO_LOW' | 'TOO_HIGH' = 'OPTIMAL';
  let eRec = 'Tekukan siku elastis dan mampu meredam getaran jalan dengan baik.';
  let eDiff = 0;

  if (elbow > eStd.max) {
    eStatus = 'TOO_HIGH';
    eDiff = Number((elbow - eStd.max).toFixed(1));
    eRec = `Lengan terlalu lurus / terkunci (${eDiff}°). Rekomendasi: Perpendek panjang stem 10-20mm atau majukan posisi saddle sedikit ke depan.`;
  } else if (elbow < eStd.min) {
    eStatus = 'TOO_LOW';
    eDiff = Number((eStd.min - elbow).toFixed(1));
    eRec = `Siku terlalu menekuk (${eDiff}° di bawah ideal). Rekomendasi: Pertimbangkan menambah panjang stem untuk memperluas ruang dada.`;
  }

  results.push({
    angleName: 'Sudut Tekukan Siku',
    actualDeg: elbow,
    idealMinDeg: eStd.min,
    idealMaxDeg: eStd.max,
    optimalDeg: eStd.optimal,
    status: eStatus,
    differenceDeg: eDiff,
    recommendation: eRec
  });

  return results;
}

/**
 * Preset sample landmarks for rapid testing without webcam
 */
export const SAMPLE_POSES: Record<'ROAD_UPRIGHT' | 'ROAD_AGGRESSIVE' | 'TT_AERO', PoseLandmarks> = {
  ROAD_UPRIGHT: {
    nose: { x: 0.62, y: 0.28 },
    leftEar: { x: 0.58, y: 0.26 },
    leftShoulder: { x: 0.52, y: 0.36 },
    leftElbow: { x: 0.58, y: 0.48 },
    leftWrist: { x: 0.67, y: 0.52 },
    leftHip: { x: 0.35, y: 0.56 },
    leftKnee: { x: 0.42, y: 0.76 },
    leftAnkle: { x: 0.36, y: 0.90 }
  },
  ROAD_AGGRESSIVE: {
    nose: { x: 0.68, y: 0.36 },
    leftEar: { x: 0.63, y: 0.33 },
    leftShoulder: { x: 0.55, y: 0.40 },
    leftElbow: { x: 0.62, y: 0.52 },
    leftWrist: { x: 0.70, y: 0.54 },
    leftHip: { x: 0.34, y: 0.56 },
    leftKnee: { x: 0.45, y: 0.78 },
    leftAnkle: { x: 0.38, y: 0.92 }
  },
  TT_AERO: {
    nose: { x: 0.74, y: 0.38 },
    leftEar: { x: 0.69, y: 0.35 },
    leftShoulder: { x: 0.58, y: 0.42 },
    leftElbow: { x: 0.68, y: 0.54 },
    leftWrist: { x: 0.77, y: 0.53 },
    leftHip: { x: 0.36, y: 0.54 },
    leftKnee: { x: 0.47, y: 0.76 },
    leftAnkle: { x: 0.40, y: 0.92 }
  }
};
