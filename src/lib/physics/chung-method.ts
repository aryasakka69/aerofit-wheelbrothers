import { ActivityDataPoint, ChungCalibrationResult } from '../types/cda';
import { GRAVITY } from './cda-formulas';

/**
 * Compute Virtual Elevation profile using Robert Chung's method
 * @param points Time-series activity points (distance, speed, power, altitude)
 * @param cda Estimated CdA value
 * @param crr Estimated rolling resistance coefficient
 * @param totalWeightKg Rider + bike + equipment (kg)
 * @param rho Air density (kg/m³)
 * @param drivetrainEfficiency Drivetrain efficiency (e.g. 0.975)
 */
export function calculateVirtualElevation(
  points: ActivityDataPoint[],
  cda: number,
  crr: number,
  totalWeightKg: number,
  rho: number = 1.204,
  drivetrainEfficiency: number = 0.975
): ChungCalibrationResult {
  if (!points || points.length === 0) {
    return {
      cda,
      crr,
      points: [],
      rSquared: 0
    };
  }

  const resultPoints: {
    distanceKm: number;
    actualElevationM: number;
    virtualElevationM: number;
  }[] = [];

  let currentVirtualElevation = points[0].altitudeM || 0;
  const baseActualElevation = points[0].altitudeM || 0;
  let prevElevation = baseActualElevation;

  let sumActual = 0;
  let sumVirtual = 0;

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const dt = i === 0 ? 1 : Math.max(0.5, Math.min(5, (pt.timestamp - points[i - 1].timestamp) / 1000));
    const v = Math.max(0.5, pt.speedMps);
    const p = Math.max(0, pt.powerWatts);

    // Forces:
    // Drag: F_drag = 0.5 * rho * v^2 * CdA
    const fDrag = 0.5 * rho * Math.pow(v, 2) * cda;
    
    // Rolling: F_rr = Crr * m * g
    const fRolling = crr * totalWeightKg * GRAVITY;

    // Net driving force at wheels: F_prop = (P * eta) / v
    const fProp = (p * drivetrainEfficiency) / v;

    // Net force available for climb and acceleration:
    // F_net = F_prop - F_drag - F_rr = m * g * dh/ds + m * dv/dt
    // dh_v = ((F_prop - F_drag - F_rr) * dt * v - 0.5 * m * (v_next^2 - v^2)) / (m * g)
    const powerExcessWatts = (fProp - fDrag - fRolling) * v;
    
    // Kinetic energy change
    let deltaKineticEnergy = 0;
    if (i < points.length - 1) {
      const vNext = Math.max(0.5, points[i + 1].speedMps);
      deltaKineticEnergy = 0.5 * totalWeightKg * (Math.pow(vNext, 2) - Math.pow(v, 2));
    }

    const deltaElevationM = (powerExcessWatts * dt - deltaKineticEnergy) / (totalWeightKg * GRAVITY);
    currentVirtualElevation += Math.max(-5, Math.min(5, deltaElevationM));

    const distanceKm = Number((pt.distanceM / 1000).toFixed(3));
    const actualElevationM = Number(pt.altitudeM.toFixed(2));
    const virtualElevationM = Number(currentVirtualElevation.toFixed(2));

    sumActual += actualElevationM;
    sumVirtual += virtualElevationM;

    resultPoints.push({
      distanceKm,
      actualElevationM,
      virtualElevationM
    });
  }

  // Calculate correlation / R-squared approximation
  const n = resultPoints.length;
  const meanActual = sumActual / n;
  const meanVirtual = sumVirtual / n;

  let ssTotal = 0;
  let ssResidual = 0;

  for (const pt of resultPoints) {
    ssTotal += Math.pow(pt.actualElevationM - meanActual, 2);
    ssResidual += Math.pow(pt.actualElevationM - pt.virtualElevationM, 2);
  }

  const rSquared = ssTotal > 0 ? Math.max(0, 1 - (ssResidual / ssTotal)) : 0;

  return {
    cda,
    crr,
    points: resultPoints,
    rSquared: Number(rSquared.toFixed(3))
  };
}
