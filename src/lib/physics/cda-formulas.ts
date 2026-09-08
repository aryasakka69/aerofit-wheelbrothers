import { CdaManualInput, CdaCalculationResult, PositionBenchmark } from '../types/cda';

/**
 * Standard gravitational acceleration (m/s²)
 */
export const GRAVITY = 9.80665;

/**
 * Gas constant for dry air (J/(kg·K))
 */
export const R_SPECIFIC_AIR = 287.058;

/**
 * Sea level standard atmospheric pressure (Pa)
 */
export const P0_SEA_LEVEL = 101325;

/**
 * Standard temperature lapse rate (K/m)
 */
export const TEMPERATURE_LAPSE_RATE = 0.0065;

/**
 * Sea level standard temperature (K)
 */
export const T0_SEA_LEVEL = 288.15;

/**
 * Calculate air density (rho, kg/m³) based on temperature (°C) and altitude (m)
 * using standard barometric formula.
 */
export function calculateAirDensity(temperatureC: number, altitudeM: number): number {
  const tempKelvin = temperatureC + 273.15;
  
  // Barometric pressure at altitude
  const pressure = P0_SEA_LEVEL * Math.pow(
    1 - (TEMPERATURE_LAPSE_RATE * altitudeM) / T0_SEA_LEVEL,
    (GRAVITY * 0.0289644) / (8.3144598 * TEMPERATURE_LAPSE_RATE)
  );

  // Ideal gas law: rho = P / (R_specific * T)
  const rho = pressure / (R_SPECIFIC_AIR * tempKelvin);
  return Number(rho.toFixed(4));
}

/**
 * Standard position benchmarks for cyclists
 */
export const POSITION_BENCHMARKS: PositionBenchmark[] = [
  {
    positionName: 'Time Trial / Aerobars Agresif',
    description: 'Posisi TT optimal, siku rapat, kepala rendah, helm aero.',
    cdaRangeMin: 0.20,
    cdaRangeMax: 0.24,
    typicalRider: 'Pro TT / Triathlete elite'
  },
  {
    positionName: 'Time Trial Standar / Breakaway Hoods',
    description: 'Aerobars standar atau posisi "puppy paws / 90° elbows" di hoods drop-bar.',
    cdaRangeMin: 0.24,
    cdaRangeMax: 0.28,
    typicalRider: 'Semi-pro, fast breakaway'
  },
  {
    positionName: 'Road Bike - Drops Position',
    description: 'Tangan di lekukan stang (drops), torso membungkuk ~30° dari horizontal.',
    cdaRangeMin: 0.28,
    cdaRangeMax: 0.33,
    typicalRider: 'Road race peloton, descending, sprint lead-out'
  },
  {
    positionName: 'Road Bike - Hoods (Brake Levers)',
    description: 'Tangan di tuas rem (hoods), siku sedikit menekuk ~45°.',
    cdaRangeMin: 0.33,
    cdaRangeMax: 0.39,
    typicalRider: 'Grup ride santai / solo endurance rider'
  },
  {
    positionName: 'Road Bike - Tops / Upright Climbing',
    description: 'Tangan di stang atas dekat stem, dada terbuka lebar.',
    cdaRangeMin: 0.40,
    cdaRangeMax: 0.50,
    typicalRider: 'Menanjak curam atau recovery posisi tegak'
  }
];

/**
 * Calculate CdA and power breakdowns from manual input
 */
export function calculateCdA(input: CdaManualInput): CdaCalculationResult {
  const speedMps = (input.speedKmh * 1000) / 3600;
  const headwindMps = ((input.headwindKmh || 0) * 1000) / 3600;
  const airspeedMps = speedMps + headwindMps;
  const totalWeightKg = input.riderWeightKg + input.bikeWeightKg;

  // Air density
  const rho = calculateAirDensity(input.temperatureC, input.altitudeM);

  // Drivetrain efficiency factor (e.g. 97.5% -> 0.975)
  const drivetrainEfficiency = (input.drivetrainEfficiencyPct || 97.5) / 100;
  const effectivePower = input.powerWatts * drivetrainEfficiency;
  const drivetrainLossWatts = input.powerWatts * (1 - drivetrainEfficiency);

  // Slope / incline angle
  const slopePercent = input.slopePercent || 0;
  const slopeAngleRad = Math.atan(slopePercent / 100);

  // 1. Power rolling resistance: P_rr = Crr * m * g * cos(theta) * v_ground
  const normalForce = totalWeightKg * GRAVITY * Math.cos(slopeAngleRad);
  const rollingResistanceForce = input.crr * normalForce;
  const rollingPowerWatts = rollingResistanceForce * speedMps;

  // 2. Power gravity: P_grav = m * g * sin(theta) * v_ground
  const gravityForce = totalWeightKg * GRAVITY * Math.sin(slopeAngleRad);
  const gravityPowerWatts = gravityForce * speedMps;

  // 3. Remaining power goes into aerodynamic drag: P_drag = P_eff - P_rr - P_grav
  let dragPowerWatts = effectivePower - rollingPowerWatts - gravityPowerWatts;
  
  // Boundary safety check
  if (dragPowerWatts <= 0) {
    // If entered power is too low to sustain this speed, clamp drag to minimum realistic fraction
    dragPowerWatts = Math.max(10, effectivePower * 0.5);
  }

  // 4. Solve for CdA: P_drag = 0.5 * rho * v_air^2 * CdA * v_ground
  // F_drag = 0.5 * rho * v_air^2 * CdA
  // P_drag = F_drag * v_ground
  const denominator = 0.5 * rho * Math.pow(airspeedMps, 2) * speedMps;
  let cda = denominator > 0 ? dragPowerWatts / denominator : 0.32;

  // Clamp CdA to physically possible human cyclist range [0.18, 0.70]
  cda = Math.min(Math.max(cda, 0.18), 0.70);
  const finalCda = Number(cda.toFixed(4));

  // Recalculate exact drag power with final clamped CdA
  const finalDragPower = 0.5 * rho * Math.pow(airspeedMps, 2) * finalCda * speedMps;
  const totalAccountedPower = finalDragPower + rollingPowerWatts + gravityPowerWatts + drivetrainLossWatts;

  const dragPercent = Number(((finalDragPower / totalAccountedPower) * 100).toFixed(1));
  const rollingPercent = Number(((rollingPowerWatts / totalAccountedPower) * 100).toFixed(1));
  const gravityPercent = Number(((Math.max(0, gravityPowerWatts) / totalAccountedPower) * 100).toFixed(1));
  const drivetrainPercent = Number(((drivetrainLossWatts / totalAccountedPower) * 100).toFixed(1));

  // Determine Position Evaluation
  let status: 'AGGRESSIVE_TT' | 'AERO_HOODS_DROPS' | 'STANDARD_ROAD' | 'UPRIGHT_CLIMB' | 'HIGH_DRAG';
  let label = '';
  let description = '';

  if (finalCda < 0.25) {
    status = 'AGGRESSIVE_TT';
    label = 'Elite Time Trial / Aggressive Aero';
    description = 'Posisi sangat aerodinamis layaknya pembalap pro time-trial dengan aerobar.';
  } else if (finalCda < 0.30) {
    status = 'AERO_HOODS_DROPS';
    label = 'Optimized Aero Road / Fast Drops';
    description = 'Posisi aerodinamis sangat efisien untuk road bike dengan siku tertekuk di drops atau hoods.';
  } else if (finalCda < 0.36) {
    status = 'STANDARD_ROAD';
    label = 'Standard Road Endurance';
    description = 'Posisi umum pesepeda road bike di hoods dengan kenyamanan tinggi.';
  } else if (finalCda < 0.42) {
    status = 'UPRIGHT_CLIMB';
    label = 'Upright Position';
    description = 'Posisi cukup tegak, hambatan angin cukup besar di kecepatan > 30 km/jam.';
  } else {
    status = 'HIGH_DRAG';
    label = 'High Drag / Commuter Posture';
    description = 'Hambatan udara sangat dominan; terdapat peluang peningkatan aerodinamika yang sangat besar.';
  }

  // Impact Projection (e.g., if CdA is reduced by 0.02 m²)
  const deltaCda = 0.02;
  const targetCda = Math.max(0.18, finalCda - deltaCda);
  
  // Power saved at same speed: deltaP = 0.5 * rho * v_air^2 * deltaCda * v_ground / eff
  const wattsSaved = (0.5 * rho * Math.pow(airspeedMps, 2) * deltaCda * speedMps) / drivetrainEfficiency;

  // Speed gained at same power (approx 3rd root relation):
  // v_new approx v_old * (CdA_old / CdA_new)^(1/3) for drag-dominated regime
  const speedRatio = Math.pow(finalCda / targetCda, 0.33);
  const newSpeedKmh = input.speedKmh * speedRatio;
  const speedIncreaseKmh = Number((newSpeedKmh - input.speedKmh).toFixed(2));

  // Time saved over 40 km (standard Olympic TT distance):
  const oldTimeSec = (40 / input.speedKmh) * 3600;
  const newTimeSec = (40 / newSpeedKmh) * 3600;
  const timeSavedMinutes = Number(((oldTimeSec - newTimeSec) / 60).toFixed(2));

  return {
    cda: finalCda,
    airDensityRho: rho,
    breakdown: {
      dragPower: Number(finalDragPower.toFixed(1)),
      dragPercent,
      rollingPower: Number(rollingPowerWatts.toFixed(1)),
      rollingPercent,
      gravityPower: Number(gravityPowerWatts.toFixed(1)),
      gravityPercent,
      drivetrainLoss: Number(drivetrainLossWatts.toFixed(1)),
      drivetrainPercent,
      netPower: Number(effectivePower.toFixed(1))
    },
    speedKmh: input.speedKmh,
    powerWatts: input.powerWatts,
    totalWeightKg,
    positionEvaluation: {
      status,
      label,
      description
    },
    impactEstimates: {
      speedIncreaseAtSamePowerKmh: speedIncreaseKmh,
      wattsSavedAtSameSpeed: Number(wattsSaved.toFixed(1)),
      timeSaved40kmMinutes: Math.max(0, timeSavedMinutes)
    }
  };
}
