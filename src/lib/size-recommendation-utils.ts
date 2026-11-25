import { recommendSize } from "./size-engine";
import {
  MEN_JANKER_DEFAULT,
  MEN_LEDERHOSEN_DEFAULT,
  MEN_SHIRT_DEFAULT,
  WOMEN_APRON_DEFAULT,
  WOMEN_BLOUSE_DEFAULT,
  WOMEN_DIRNDL_DEFAULT,
} from "./default-size-charts";
import type { Gender, SizeChart, SizeProfile } from "./size-types";

export function inferSizingGender(productType: string, title = ""): Gender {
  return /dirndl|women|blouse|apron|dress/i.test(`${productType} ${title}`) ? "women" : "men";
}

export function getSizeChart(value: string | undefined, gender: Gender, productType = ""): SizeChart {
  const type = productType.toLowerCase();
  const fallback = gender === "women"
    ? /blouse/i.test(type) ? WOMEN_BLOUSE_DEFAULT : /apron/i.test(type) ? WOMEN_APRON_DEFAULT : WOMEN_DIRNDL_DEFAULT
    : /janker|jacket/i.test(type) ? MEN_JANKER_DEFAULT : /shirt/i.test(type) ? MEN_SHIRT_DEFAULT : MEN_LEDERHOSEN_DEFAULT;
  if (!value) return fallback;
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === "object" && parsed !== null &&
      "sizes" in parsed && Array.isArray(parsed.sizes) &&
      "category" in parsed && "gender" in parsed
    ) return parsed as SizeChart;
  } catch (error) {
    console.error("Invalid custom.size_chart Shopify metafield; using seed chart.", error);
  }
  return fallback;
}

export function getProfileSize(profile: SizeProfile, productType: string, chartValue?: string) {
  const gender = inferSizingGender(productType);
  if (gender !== profile.gender) return null;
  const chart = getSizeChart(chartValue, gender, productType);
  return recommendSize(profile, chart).recommendedSize;
}
