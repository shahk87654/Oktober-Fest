import { describe, expect, it } from "vitest";
import { recommendSize, validateMeasurements } from "./size-engine";
import type { SizeChart, SizeProfile } from "./size-types";

const chart: SizeChart = {
  name: "test",
  category: "dirndl",
  gender: "women",
  sizes: [
    { size: "S", body_ranges: { waist: { min: 60, max: 70 }, bust: { min: 80, max: 90 } } },
    { size: "M", body_ranges: { waist: { min: 70, max: 80 }, bust: { min: 90, max: 100 } } },
    { size: "L", body_ranges: { waist: { min: 80, max: 90 }, bust: { min: 100, max: 110 } } },
  ],
};

function profile(measurements: Record<string, number>): SizeProfile {
  return {
    gender: "women",
    unit: "metric",
    mode: "exact",
    consent: false,
    fit_preference: "regular",
    measurements,
  };
}

describe("recommendSize", () => {
  it("reports neighboring sizes when a measurement sits on a shared boundary", () => {
    const result = recommendSize(profile({ waist: 70 }), chart);
    expect(result.recommendedSize).toBe("S");
    expect(result.betweenSizes).toBe("M");
    expect(result.confidence).toBe("Low");
  });

  it("chooses the nearest available range for out-of-range measurements", () => {
    const result = recommendSize(profile({ waist: 94 }), chart);
    expect(result.recommendedSize).toBe("L");
    expect(result.betweenSizes).toBeNull();
  });

  it("scores on measurements provided and tolerates missing optional values", () => {
    const result = recommendSize(profile({ bust: 95 }), chart);
    expect(result.recommendedSize).toBe("M");
    expect(result.explanation).toContain("bust (95 cm)");
  });

  it("flags impossible female measurement combinations for re-measurement", () => {
    expect(validateMeasurements({ bust: 80, underbust: 85 }, "women").bust).toContain("re-measure");
    expect(validateMeasurements({ waist: 110, hip: 75 }, "women").waist).toContain("re-measure");
  });
});
