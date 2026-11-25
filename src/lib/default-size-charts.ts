import type { SizeChart, SizeRow } from "./size-types";

const womenSizes: SizeRow[] = Array.from({ length: 12 }, (_, index) => {
  const eu = 32 + index * 2;
  const bust = 76 + index * 4;
  const underbust = 66 + index * 4;
  const waist = 58 + index * 4;
  const hip = 84 + index * 4;
  return {
    size: String(eu),
    eu: String(eu),
    us: String(index * 2),
    uk: String(index * 2 + 4),
    stretch: "low",
    fit_type: "regular",
    adjustable: true,
    body_ranges: {
      bust: { min: bust, max: bust + 4 },
      underbust: { min: underbust, max: underbust + 4 },
      waist: { min: waist, max: waist + 4 },
      hip: { min: hip, max: hip + 4 },
      back_length: { min: 39 + Math.floor(index / 3), max: 41 + Math.floor(index / 3) },
      shoulder: { min: 35 + Math.floor(index / 2), max: 37 + Math.floor(index / 2) },
    },
  };
});

const menSizes: SizeRow[] = Array.from({ length: 10 }, (_, index) => {
  const eu = 44 + index * 2;
  const waist = 76 + index * 4;
  const hip = 88 + index * 4;
  return {
    size: String(eu),
    eu: String(eu),
    us: String(eu - 10),
    uk: String(eu - 10),
    stretch: "none",
    fit_type: "regular",
    adjustable: true,
    body_ranges: {
      waist: { min: waist, max: waist + 4 },
      hip: { min: hip, max: hip + 4 },
      thigh: { min: 58 + index * 2, max: 62 + index * 2 },
      rise: { min: 28 + Math.floor(index / 3), max: 30 + Math.floor(index / 3) },
    },
  };
});

export const WOMEN_DIRNDL_DEFAULT: SizeChart = {
  name: "Dirndl seed chart",
  category: "dirndl",
  gender: "women",
  disclaimer: "Illustrative seed chart based on common European body-measurement conventions. Replace with the brand's real chart before launch.",
  sizes: womenSizes,
};

export const MEN_LEDERHOSEN_DEFAULT: SizeChart = {
  name: "Lederhosen seed chart",
  category: "lederhosen",
  gender: "men",
  disclaimer: "Illustrative seed chart based on common European body-measurement conventions. Replace with the brand's real chart before launch.",
  sizes: menSizes,
};

export const WOMEN_BLOUSE_DEFAULT: SizeChart = {
  ...WOMEN_DIRNDL_DEFAULT,
  name: "Blouse seed chart",
  category: "blouse",
};

export const WOMEN_APRON_DEFAULT: SizeChart = {
  ...WOMEN_DIRNDL_DEFAULT,
  name: "Apron seed chart",
  category: "apron",
};

export const MEN_SHIRT_DEFAULT: SizeChart = {
  ...MEN_LEDERHOSEN_DEFAULT,
  name: "Trachten shirt seed chart",
  category: "shirt",
  sizes: menSizes.map((row, index) => {
    const chest = 84 + index * 4;
    return {
      ...row,
      body_ranges: {
        chest: { min: chest, max: chest + 4 },
        neck: { min: 36 + index, max: 38 + index },
        shoulder: { min: 42 + Math.floor(index / 2), max: 44 + Math.floor(index / 2) },
        sleeve_length: { min: 60 + Math.floor(index / 3), max: 62 + Math.floor(index / 3) },
      },
    };
  }),
};

export const MEN_JANKER_DEFAULT: SizeChart = {
  ...MEN_SHIRT_DEFAULT,
  name: "Janker seed chart",
  category: "janker",
  sizes: MEN_SHIRT_DEFAULT.sizes.map((row, index) => ({
    ...row,
    body_ranges: {
      ...row.body_ranges,
      back_length: { min: 68 + index, max: 70 + index },
    },
  })),
};
