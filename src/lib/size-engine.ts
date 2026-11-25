import type {
  Confidence,
  FitPreference,
  SizeChart,
  SizeProfile,
  SizeRecommendation,
} from "./size-types";

export const GARMENT_WEIGHTS: Record<string, Record<string, number>> = {
  dirndl: { bust: 0.35, underbust: 0.15, waist: 0.2, hip: 0.1, back_length: 0.1, shoulder: 0.1 },
  lederhosen: { waist: 0.4, hip: 0.3, thigh: 0.15, rise: 0.15 },
  blouse: { bust: 0.35, shoulder: 0.25, waist: 0.2, sleeve_length: 0.1, back_length: 0.1 },
  shirt: { chest: 0.35, neck: 0.25, shoulder: 0.2, sleeve_length: 0.2 },
  janker: { chest: 0.45, shoulder: 0.25, back_length: 0.15, sleeve_length: 0.15 },
};

export function calculateBodyShape(measurements: Record<string, number>) {
  const bust = measurements.bust;
  const waist = measurements.waist;
  const highHip = measurements.high_hip;
  const hip = measurements.hip;
  if (!bust || !waist || !hip) return null;
  if (bust - hip >= 5) return "inverted-triangle" as const;
  if (hip - bust >= 5) return "pear" as const;
  if (bust - waist >= 23 && hip - waist >= 25) return "hourglass" as const;
  if (waist - hip > 8 && waist - bust > 5) return "apple" as const;
  if (highHip && Math.abs(bust - hip) < 5 && Math.abs(waist - bust) < 23) return "rectangle" as const;
  return "rectangle" as const;
}

export function validateMeasurements(measurements: Record<string, number>, gender: "women" | "men") {
  const errors: Record<string, string> = {};
  const limits: Record<string, [number, number]> = {
    height: [120, 220],
    bust: [55, 170],
    underbust: [50, 150],
    chest: [60, 170],
    waist: [45, 160],
    high_hip: [55, 170],
    hip: [60, 180],
    shoulder: [30, 60],
    back_length: [30, 70],
    arm_length: [35, 90],
    upper_arm: [15, 60],
    neck: [25, 60],
    sleeve_length: [40, 100],
    inseam: [45, 110],
    outseam: [60, 140],
    thigh: [35, 100],
    rise: [15, 50],
  };
  for (const [name, value] of Object.entries(measurements)) {
    const limit = limits[name];
    if (limit && (value < limit[0] || value > limit[1])) {
      errors[name] = `This ${name.replaceAll("_", " ")} measurement looks outside the expected range. Please re-measure in cm.`;
    }
  }
  const bust = measurements.bust;
  const underbust = measurements.underbust;
  const waist = measurements.waist;
  const hip = measurements.hip;
  if (gender === "women") {
    if (bust && underbust && bust < underbust) errors.bust = "Bust should be at or above underbust. Please re-measure.";
    if (waist && hip && waist > hip + 30) errors.waist = "This waist-to-hip difference looks unlikely. Check the natural waist and re-measure.";
  }
  return errors;
}

function distanceInRange(value: number, min: number, max: number) {
  if (value >= min && value <= max) return 0;
  if (value < min) return (min - value) / Math.max(max - min, 1);
  return (value - max) / Math.max(max - min, 1);
}

export function recommendSize(
  profile: SizeProfile,
  chart: SizeChart,
  overrides: { preferredSize?: string; fit?: FitPreference } = {},
): SizeRecommendation {
  const weights = GARMENT_WEIGHTS[chart.category] ?? {
    bust: 0.2,
    chest: 0.2,
    waist: 0.2,
    hip: 0.2,
    height: 0.1,
    shoulder: 0.1,
  };
  const fit = overrides.fit ?? profile.fit_preference ?? "regular";

  const scored = chart.sizes.map((row) => {
    let weightedScore = 0;
    let weightTotal = 0;
    for (const [measurement, weight] of Object.entries(weights)) {
      const value = profile.measurements[measurement];
      const range = row.body_ranges[measurement];
      if (value === undefined || !range) continue;
      const fitEase = fit === "relaxed" ? 2 : fit === "fitted" ? -1 : 0;
      const stretchEase = row.stretch === "high" ? 2 : row.stretch === "low" ? 1 : 0;
      const adjustedRange = {
        min: range.min - fitEase - stretchEase,
        max: range.max + fitEase + stretchEase,
      };
      const deviation = distanceInRange(value, adjustedRange.min, adjustedRange.max);
      weightedScore += deviation * weight;
      weightTotal += weight;
    }
    return { row, score: weightTotal ? weightedScore / weightTotal : 99 };
  }).sort((a, b) => a.score - b.score);

  const top = scored[0];
  if (!top) {
    return {
      recommendedSize: "—",
      confidence: "Low",
      betweenSizes: null,
      fitNote: "Ask an advisor before ordering.",
      explanation: "No size chart data is available for this product.",
      modeLabel: profile.mode === "exact" ? "precise" : "estimated",
    };
  }
  if (top.score >= 99) {
    return {
      recommendedSize: "—",
      confidence: "Low",
      betweenSizes: null,
      fitNote: "Please check that measurements and chart match this garment.",
      explanation: "There are no shared measurement ranges to compare for this product.",
      modeLabel: profile.mode === "exact" ? "precise" : "estimated",
    };
  }
  const runnerUp = scored[1];
  const gap = runnerUp ? runnerUp.score - top.score : 1;
  const isBetween = gap < 0.09 && Boolean(runnerUp);
  const sizeIndex = (size: string) => chart.sizes.findIndex((row) => row.size === size);
  const recommendedRow = isBetween && runnerUp && fit === "relaxed"
    ? sizeIndex(top.row.size) > sizeIndex(runnerUp.row.size) ? top.row : runnerUp.row
    : isBetween && runnerUp && fit === "fitted"
      ? sizeIndex(top.row.size) < sizeIndex(runnerUp.row.size) ? top.row : runnerUp.row
      : top.row;
  const betweenSizes = isBetween && runnerUp
    ? recommendedRow === top.row ? runnerUp.row.size : top.row.size
    : null;
  const totalMeasured = Object.keys(profile.measurements).length;
  const validationIssues = Object.keys(validateMeasurements(profile.measurements, profile.gender)).length;
  let confidence: Confidence = "Low";
  if (profile.mode === "exact" && totalMeasured >= 7 && gap >= 0.12 && !validationIssues) confidence = "High";
  else if ((profile.mode === "exact" && totalMeasured >= 5) || gap >= 0.15) confidence = "Medium";

  const recommendedSize = recommendedRow.size;
  const fitNote =
    fit === "relaxed" ? "Choose this size for a relaxed fit." :
    fit === "fitted" ? "Choose this size for a close, fitted silhouette." :
    "Choose this size for a comfortable, regular fit.";
  const keyMeasurement = Object.entries(weights)
    .filter(([key]) => profile.measurements[key] !== undefined && recommendedRow.body_ranges[key])
    .sort((a, b) => b[1] - a[1])[0]?.[0];
  const keyValue = keyMeasurement ? profile.measurements[keyMeasurement] : undefined;
  const keyRange = keyMeasurement ? recommendedRow.body_ranges[keyMeasurement] : undefined;
  const detail = keyMeasurement && keyValue !== undefined && keyRange
    ? `Your ${keyMeasurement.replaceAll("_", " ")} (${keyValue} cm) ${keyValue >= keyRange.min && keyValue <= keyRange.max ? `fits ${recommendedRow.size} (${keyRange.min}–${keyRange.max} cm)` : `is outside ${recommendedRow.size}'s ${keyRange.min}–${keyRange.max} cm range`}.`
    : "Add measurements for a more specific fit explanation.";
  const explanation = betweenSizes && runnerUp
    ? `${detail} You are between ${top.row.size} and ${runnerUp.row.size}; ${fit === "relaxed" ? `size up to ${recommendedSize} for a relaxed fit` : fit === "fitted" ? `choose ${recommendedSize} for a closer fit` : `choose ${recommendedSize} for a balanced fit`}.`
    : detail;

  return {
    recommendedSize,
    confidence,
    betweenSizes,
    fitNote,
    explanation,
    modeLabel: profile.mode === "exact" ? "precise" : "estimated",
  };
}
