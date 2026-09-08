import { Point2D, PoseLandmarks } from '../fitting/angles';
import { BikeCategory } from '../types/bike';

export interface AirParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  pressure: number; // 0 (low/negative pressure wake) to 1 (high stagnation pressure)
  age: number;
  maxAge: number;
  streamlineId: number;
}

export interface BodyGeometryBoundary {
  head: { cx: number; cy: number; r: number };
  torso: { p1: Point2D; p2: Point2D; thickness: number };
  arms: { p1: Point2D; p2: Point2D; p3: Point2D; thickness: number };
  thigh: { p1: Point2D; p2: Point2D; thickness: number };
  shank: { p1: Point2D; p2: Point2D; thickness: number };
}

export interface BikeGeometryBoundary {
  category: BikeCategory;
  frontWheel: { cx: number; cy: number; r: number; isDeepRim: boolean; isDisc: boolean };
  rearWheel: { cx: number; cy: number; r: number; isDeepRim: boolean; isDisc: boolean };
  frameLines: { p1: Point2D; p2: Point2D; thickness: number }[];
  cockpit: { p1: Point2D; p2: Point2D; isAeroBar: boolean };
}

/**
 * Build geometry collision boundaries from landmarks and bike category
 */
export function buildCombinedGeometry(
  landmarks: PoseLandmarks,
  category: BikeCategory,
  canvasWidth: number,
  canvasHeight: number
): {
  body: BodyGeometryBoundary;
  bike: BikeGeometryBoundary;
} {
  const w = canvasWidth;
  const h = canvasHeight;

  // Body points
  const hip = { x: landmarks.leftHip.x * w, y: landmarks.leftHip.y * h };
  const knee = { x: landmarks.leftKnee.x * w, y: landmarks.leftKnee.y * h };
  const ankle = { x: landmarks.leftAnkle.x * w, y: landmarks.leftAnkle.y * h };
  const shoulder = { x: landmarks.leftShoulder.x * w, y: landmarks.leftShoulder.y * h };
  const elbow = { x: landmarks.leftElbow.x * w, y: landmarks.leftElbow.y * h };
  const wrist = { x: landmarks.leftWrist.x * w, y: landmarks.leftWrist.y * h };
  const ear = landmarks.leftEar ? { x: landmarks.leftEar.x * w, y: landmarks.leftEar.y * h } : { x: shoulder.x + 20, y: shoulder.y - 30 };

  const body: BodyGeometryBoundary = {
    head: { cx: ear.x + 8, cy: ear.y - 5, r: 24 },
    torso: { p1: hip, p2: shoulder, thickness: 36 },
    arms: { p1: shoulder, p2: elbow, p3: wrist, thickness: 18 },
    thigh: { p1: hip, p2: knee, thickness: 26 },
    shank: { p1: knee, p2: ankle, thickness: 20 }
  };

  // Bike points
  const wheelRadius = 46;
  const frontWheelCenter = { cx: w * 0.74, cy: h * 0.85, r: wheelRadius, isDeepRim: category === 'AERO_ROAD' || category === 'TT_TRIATHLON', isDisc: category === 'TT_TRIATHLON' };
  const rearWheelCenter = { cx: w * 0.26, cy: h * 0.85, r: wheelRadius, isDeepRim: category === 'AERO_ROAD' || category === 'TT_TRIATHLON', isDisc: category === 'TT_TRIATHLON' };
  const bbCenter = { x: w * 0.48, y: h * 0.84 };
  const saddleClamp = { x: hip.x, y: hip.y + 12 };
  const headTubeTop = { x: shoulder.x + 35, y: wrist.y + 8 };

  const bikeThickness = category === 'AERO_ROAD' || category === 'TT_TRIATHLON' ? 14 : 9;

  const bike: BikeGeometryBoundary = {
    category,
    frontWheel: frontWheelCenter,
    rearWheel: rearWheelCenter,
    frameLines: [
      { p1: { x: rearWheelCenter.cx, y: rearWheelCenter.cy }, p2: saddleClamp, thickness: bikeThickness },
      { p1: saddleClamp, p2: headTubeTop, thickness: bikeThickness },
      { p1: headTubeTop, p2: { x: frontWheelCenter.cx, y: frontWheelCenter.cy }, thickness: bikeThickness },
      { p1: saddleClamp, p2: bbCenter, thickness: bikeThickness },
      { p1: bbCenter, p2: { x: rearWheelCenter.cx, y: rearWheelCenter.cy }, thickness: bikeThickness },
      { p1: bbCenter, p2: headTubeTop, thickness: bikeThickness }
    ],
    cockpit: {
      p1: headTubeTop,
      p2: wrist,
      isAeroBar: category === 'TT_TRIATHLON'
    }
  };

  return { body, bike };
}

/**
 * Determine fluid flow influence at point (px, py)
 * Returns adjusted velocity vector { vx, vy } and relative pressure (0..1)
 */
export function sampleFlowField(
  px: number,
  py: number,
  baseSpeed: number,
  geo: { body: BodyGeometryBoundary; bike: BikeGeometryBoundary }
): { vx: number; vy: number; pressure: number; isTurbulentWake: boolean } {
  let vx = baseSpeed;
  let vy = 0;
  let pressure = 0.5;
  let isTurbulentWake = false;

  const { body, bike } = geo;

  // Check proximity to head / helmet
  const dHead = Math.hypot(px - body.head.cx, py - body.head.cy);
  if (dHead < body.head.r + 40) {
    if (px < body.head.cx) {
      // Ahead of head: stagnation pressure zone
      pressure = Math.min(1.0, 0.5 + (1 - dHead / (body.head.r + 40)) * 0.5);
      vx *= Math.max(0.2, (dHead - body.head.r) / 40);
      // Deflect up or down
      vy += (py - body.head.cy) * 0.08;
    } else {
      // Behind head: low pressure wake / separation
      pressure = Math.max(0.05, 0.5 - (1 - dHead / (body.head.r + 40)) * 0.4);
      isTurbulentWake = true;
      vx *= 0.6;
      vy += Math.sin(px * 0.1) * 0.4;
    }
  }

  // Check proximity to Torso line segment
  const torsoMidX = (body.torso.p1.x + body.torso.p2.x) / 2;
  const torsoMidY = (body.torso.p1.y + body.torso.p2.y) / 2;
  const dTorso = Math.hypot(px - torsoMidX, py - torsoMidY);

  if (dTorso < 110) {
    // Air moving over the back
    if (py < torsoMidY) {
      // Upper flow accelerates over back (Bernoulli principle)
      vx *= 1.25;
      vy -= 0.15;
    } else {
      // Under torso / behind legs: boundary separation
      isTurbulentWake = true;
      vx *= 0.7;
      vy += Math.cos(px * 0.08) * 0.3;
      pressure = 0.2;
    }
  }

  // Check Large Low-Pressure Wake Pocket behind the rider (to the left/rear of hip and saddle)
  if (px < body.torso.p1.x && px > bike.rearWheel.cx - 50 && py > body.head.cy && py < bike.rearWheel.cy) {
    isTurbulentWake = true;
    pressure = 0.1;
    vx *= 0.45;
    // Micro vortex circulation
    vy += Math.sin((px - py) * 0.05) * 0.6;
  }

  return { vx, vy, pressure, isTurbulentWake };
}
