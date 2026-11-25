export type UnitSystem = "metric" | "imperial";
export type InputMode = "quick" | "exact" | "scan";
export type Confidence = "High" | "Medium" | "Low";
export type Gender = "women" | "men";
export type FitPreference = "fitted" | "regular" | "relaxed";

export type BodyShape =
  | "hourglass"
  | "pear"
  | "apple"
  | "rectangle"
  | "inverted-triangle";

export type SizeRow = {
  size: string;
  eu?: string;
  us?: string;
  uk?: string;
  body_ranges: Record<string, { min: number; max: number }>;
  garment_measurements?: Record<string, number>;
  stretch?: "none" | "low" | "high";
  fit_type?: "slim" | "regular" | "relaxed";
  adjustable?: boolean;
};

export type SizeChart = {
  name: string;
  category: "dirndl" | "blouse" | "apron" | "lederhosen" | "shirt" | "janker";
  gender: Gender;
  sizes: SizeRow[];
  disclaimer?: string;
};

export type SizeProfile = {
  gender: Gender;
  unit: UnitSystem;
  mode: InputMode;
  consent: boolean;
  height?: number;
  weight?: number;
  age_range?: string;
  body_shape?: BodyShape | "athletic" | "broad" | "round";
  fit_preference?: FitPreference;
  bra_size?: string;
  skirt_length?: "knee" | "midi" | "long";
  measurements: Record<string, number>;
};

export type SizeRecommendation = {
  recommendedSize: string;
  confidence: Confidence;
  betweenSizes: string | null;
  fitNote: string;
  explanation: string;
  modeLabel: "estimated" | "precise";
  bodiceSize?: string;
  skirtSize?: string;
  fixedBodiceWarning?: string;
  bodyShape?: string;
  cupEstimate?: number;
  waistHipRatio?: number;
  variantMappingWarning?: string;
};
