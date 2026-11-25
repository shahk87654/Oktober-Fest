"use client";

import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { useSizeProfileStore } from "@/lib/size-profile-store";
import type { Gender, SizeProfile } from "@/lib/size-types";
import { calculateBodyShape } from "@/lib/size-engine";
import { BodyShapePicker } from "./body-shape-picker";
import { MeasurementGuide } from "./measurement-guide";

const optionalNumber = (min: number, max: number) => z.preprocess(
  (value) => value === "" || value === undefined || (typeof value === "number" && Number.isNaN(value)) ? undefined : value,
  z.coerce.number().min(min).max(max).optional(),
);

const measureSchema = z.object({
  gender: z.enum(["women", "men"]),
  height: z.preprocess((value) => value === "" ? undefined : value, z.coerce.number().min(40).max(220)),
  weight: optionalNumber(30, 550),
  age_range: z.string().optional(),
  bust: optionalNumber(15, 180),
  underbust: optionalNumber(15, 170),
  waist: optionalNumber(15, 180),
  high_hip: optionalNumber(15, 190),
  hip: optionalNumber(15, 200),
  shoulder: optionalNumber(10, 70),
  back_length: optionalNumber(10, 80),
  arm_length: optionalNumber(10, 100),
  upper_arm: optionalNumber(5, 70),
  chest: optionalNumber(15, 180),
  neck: optionalNumber(10, 70),
  sleeve_length: optionalNumber(10, 110),
  inseam: optionalNumber(10, 120),
  outseam: optionalNumber(15, 150),
  thigh: optionalNumber(10, 110),
  rise: optionalNumber(5, 60),
  skirt_length: z.enum(["knee", "midi", "long"]).optional(),
  bra_size: z.string().optional(),
  body_shape: z.string().optional(),
  fit_preference: z.enum(["fitted", "regular", "relaxed"]),
  consent: z.boolean(),
});

type FormValues = z.infer<typeof measureSchema>;

const womenFields = [
  ["bust", "Bust", "Fullest point"],
  ["underbust", "Underbust", "Just below the bust"],
  ["waist", "Natural waist", "Narrowest point above navel"],
  ["high_hip", "High hip", "About 8 cm below waist"],
  ["hip", "Hip", "Fullest point"],
  ["shoulder", "Shoulder width", "Seam to seam across back"],
  ["back_length", "Back length", "Nape to natural waist"],
  ["arm_length", "Arm length", "Shoulder to wrist"],
  ["upper_arm", "Upper arm", "Fullest point"],
] as const;
const menFields = [
  ["chest", "Chest", "Fullest point, under arms"],
  ["neck", "Neck", "Around the base of neck"],
  ["waist", "Natural waist", "At navel; specify if trousers sit lower"],
  ["hip", "Hip", "Fullest point"],
  ["shoulder", "Shoulder width", "Shoulder point to shoulder point"],
  ["back_length", "Back length", "Nape to natural waist (for jackets)"],
  ["sleeve_length", "Sleeve length", "Shoulder point to wrist"],
  ["inseam", "Inseam", "Crotch to ankle"],
  ["outseam", "Outseam", "Waist to ankle"],
  ["thigh", "Thigh", "Fullest point"],
  ["rise", "Rise", "Crotch seam to waist"],
] as const;

export function MeasurementForm({
  gender,
  mode,
  productType,
  onComplete,
}: {
  gender: Gender;
  mode: "quick" | "exact";
  productType: string;
  onComplete: (profile: SizeProfile) => void;
}) {
  const unit = useSizeProfileStore((state) => state.unit);
  const savedProfile = useSizeProfileStore((state) => state.profile);
  const setUnit = useSizeProfileStore((state) => state.setUnit);
  const fields = gender === "women" ? womenFields : (() => {
    const type = productType.toLowerCase();
    if (/shirt/.test(type)) return menFields.filter(([key]) => ["chest", "neck", "shoulder", "sleeve_length"].includes(key));
    if (/janker|jacket/.test(type)) return menFields.filter(([key]) => ["chest", "shoulder", "sleeve_length", "back_length"].includes(key));
    if (/lederhosen|trouser|pants/.test(type)) return menFields.filter(([key]) => ["waist", "hip", "inseam", "outseam", "thigh", "rise"].includes(key));
    return menFields;
  })();
  const profileValue = (key: string) => {
    const value = savedProfile?.gender === gender ? savedProfile.measurements[key] : undefined;
    return value === undefined ? undefined : unit === "imperial" ? value / 2.54 : value;
  };
  const activeProfile = savedProfile?.gender === gender ? savedProfile : null;
  const { register, handleSubmit, control, getValues, setValue, formState: { errors } } = useForm<
    z.input<typeof measureSchema>,
    unknown,
    FormValues
  >({
    resolver: zodResolver(measureSchema),
    defaultValues: {
      gender,
      height: activeProfile?.height ? (unit === "imperial" ? activeProfile.height / 2.54 : activeProfile.height) : undefined,
      weight: activeProfile?.weight ? (unit === "imperial" ? activeProfile.weight / 0.453592 : activeProfile.weight) : undefined,
      bust: profileValue("bust"),
      underbust: profileValue("underbust"),
      waist: profileValue("waist"),
      high_hip: profileValue("high_hip"),
      hip: profileValue("hip"),
      shoulder: profileValue("shoulder"),
      back_length: profileValue("back_length"),
      arm_length: profileValue("arm_length"),
      upper_arm: profileValue("upper_arm"),
      chest: profileValue("chest"),
      neck: profileValue("neck"),
      sleeve_length: profileValue("sleeve_length"),
      inseam: profileValue("inseam"),
      outseam: profileValue("outseam"),
      thigh: profileValue("thigh"),
      rise: profileValue("rise"),
      body_shape: activeProfile?.body_shape ?? undefined,
      fit_preference: activeProfile?.fit_preference ?? "regular",
      age_range: activeProfile?.age_range ?? "",
      consent: activeProfile?.consent ?? false,
    },
  });
  const bustValue = useWatch({ control, name: "bust" });
  const waistValue = useWatch({ control, name: "waist" });
  const highHipValue = useWatch({ control, name: "high_hip" });
  const hipValue = useWatch({ control, name: "hip" });
  const selectedShape = useWatch({ control, name: "body_shape" }) ?? "";
  const selectedFit = useWatch({ control, name: "fit_preference" }) ?? "regular";
  const selectedSkirtLength = useWatch({ control, name: "skirt_length" }) ?? "midi";
  const computedShape = mode === "exact" && gender === "women"
    ? calculateBodyShape({
        bust: Number(bustValue),
        waist: Number(waistValue),
        high_hip: Number(highHipValue),
        hip: Number(hipValue),
      })
    : null;
  const changeUnit = (nextUnit: "metric" | "imperial") => {
    if (unit === nextUnit) return;
    const factor = unit === "metric" ? 1 / 2.54 : 2.54;
    const weightFactor = unit === "metric" ? 1 / 0.453592 : 0.453592;
    const numericFields = [
      "height", "bust", "underbust", "waist", "high_hip", "hip", "shoulder",
      "back_length", "arm_length", "upper_arm", "chest", "neck",
      "sleeve_length", "inseam", "outseam", "thigh", "rise",
    ] as const;
    for (const field of numericFields) {
      const value = getValues(field);
      if (typeof value === "number" && Number.isFinite(value)) {
        setValue(field, value * factor, { shouldDirty: true, shouldValidate: true });
      }
    }
    const weight = getValues("weight");
    if (typeof weight === "number" && Number.isFinite(weight)) {
      setValue("weight", weight * weightFactor, { shouldDirty: true, shouldValidate: true });
    }
    setUnit(nextUnit);
  };
  const setNumericRegister = (name: typeof womenFields[number][0] | typeof menFields[number][0]) =>
    register(name, { valueAsNumber: true });

  const submit = (values: FormValues) => {
    const measurements: Record<string, number> = {};
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === "number" && key !== "weight") {
        measurements[key] = unit === "imperial" ? value * 2.54 : value;
      }
    }
    const profile: SizeProfile = {
      gender,
      unit,
      mode,
      consent: values.consent,
      height: values.height ? (unit === "imperial" ? values.height * 2.54 : values.height) : undefined,
      weight: values.weight ? (unit === "imperial" ? values.weight * 0.453592 : values.weight) : undefined,
      age_range: values.age_range,
      body_shape: values.body_shape as SizeProfile["body_shape"],
      fit_preference: values.fit_preference,
      bra_size: values.bra_size || undefined,
      skirt_length: values.skirt_length,
      measurements,
    };
    onComplete(profile);
  };

  return (
    <form className="size-advisor-form" onSubmit={handleSubmit(submit)}>
      <fieldset className="size-unit-toggle" aria-label="Measurement units">
        <legend>UNITS</legend>
        <button type="button" className={unit === "metric" ? "is-active" : ""} aria-pressed={unit === "metric"} onClick={() => changeUnit("metric")}>cm <span>/</span> kg</button>
        <button type="button" className={unit === "imperial" ? "is-active" : ""} aria-pressed={unit === "imperial"} onClick={() => changeUnit("imperial")}>in <span>/</span> lb</button>
      </fieldset>
      <div className="advisor-field">
        <label htmlFor={`${mode}-height`}>Height ({unit === "metric" ? "cm" : "in"})</label>
        <input id={`${mode}-height`} type="number" step="any" {...register("height", { valueAsNumber: true })} required />
        {errors.height && <span className="advisor-error">Enter a height between 120 and 220 cm.</span>}
      </div>
      {mode === "quick" ? (
        <>
          <div className="advisor-field">
            <label htmlFor="quick-weight">Weight ({unit === "metric" ? "kg" : "lb"})</label>
            <input id="quick-weight" type="number" step="any" {...register("weight", { valueAsNumber: true })} required />
            {errors.weight && <span className="advisor-error">Enter a realistic weight in the selected unit.</span>}
          </div>
          <div className="advisor-field">
            <label htmlFor="age-range">Age range</label>
            <select id="age-range" {...register("age_range")} defaultValue="" required>
              <option value="" disabled>Select range</option>
              <option>18–29</option><option>30–44</option><option>45–59</option><option>60+</option>
            </select>
          </div>
          <label className="advisor-label">Body shape <span>Choose what feels closest</span></label>
          <BodyShapePicker gender={gender} value={selectedShape} onChange={(value) => setValue("body_shape", value)} />
        </>
      ) : (
        <>
          {gender === "men" && /lederhosen|trouser|pants/i.test(productType) && <p className="advisor-hint">Which waist do you wear? Measure at navel height or at the hip where the waistband sits.</p>}
          <div className="measurement-overview" aria-label="Measurement positions">
            <div className="measurement-photo-reference">
              <Image
                src={gender === "women"
                  ? "https://oktoberfestoutfits.com/cdn/shop/files/comfort-stylish-dirndl-hero-banner.webp?v=1783725787&width=1100"
                  : "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=900&q=85"}
                alt={gender === "women" ? "Real dirndl fit reference" : "Real men's heritage clothing fit reference"}
                fill
                sizes="112px"
                unoptimized={gender === "women"}
              />
              <span>Real fit reference</span>
            </div>
            <Image src={`/size-guide/${gender}-front.svg`} alt={`${gender} technical front measurement positions`} width={112} height={150} />
            <Image src={`/size-guide/${gender}-side.svg`} alt={`${gender} technical side measurement positions`} width={112} height={150} />
          </div>
          <div className="measurement-fields">
            {fields.map(([name, label, hint]) => {
              const optional = gender === "women"
                  ? name === "arm_length" || name === "upper_arm"
                  : name === "back_length" || name === "thigh" || name === "rise";
              return (
                  <div className="advisor-field measurement-field" key={name}>
                    <MeasurementGuide measurement={name} gender={gender} />
                    <div>
                      <label htmlFor={`exact-${name}`}>{label} ({unit === "metric" ? "cm" : "in"})</label>
                      <input id={`exact-${name}`} type="number" step="any" {...setNumericRegister(name)} required={!optional} />
                      <small>{hint}</small>
                      {errors[name] && <span className="advisor-error">Check this measurement and re-measure.</span>}
                    </div>
                  </div>
              );
            })}
          </div>
          {gender === "women" && (
            <>
              {computedShape && (
                <div className="computed-shape">
                  <p>From your measurements, your shape looks like <strong>{computedShape.replace("-", " ")}</strong>. Confirm or choose another:</p>
                  <BodyShapePicker gender={gender} value={selectedShape || computedShape} onChange={(value) => setValue("body_shape", value)} />
                </div>
              )}
              <div className="advisor-field">
                <label htmlFor="bra-size">Bra size (optional)</label>
                <input id="bra-size" placeholder="e.g. 75C" {...register("bra_size")} />
                <span className="advisor-label">Preferred skirt length</span>
                <div className="advisor-choice-row" role="group" aria-label="Preferred skirt length">
                {(["knee", "midi", "long"] as const).map((length) => (
                  <button
                    type="button"
                    aria-pressed={selectedSkirtLength === length}
                    className={selectedSkirtLength === length ? "is-selected" : ""}
                    key={length}
                    onClick={() => setValue("skirt_length", length, { shouldDirty: true })}
                  >{length}</button>
                ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
      <div className="advisor-field">
        <span className="advisor-label">How do you like it to fit?</span>
        <div className="advisor-fit-options" role="group" aria-label="Fit preference">
          {([
            ["fitted", "Close", "A defined silhouette"],
            ["regular", "Classic", "Easy, balanced comfort"],
            ["relaxed", "Relaxed", "A little extra room"],
          ] as const).map(([value, title, description]) => (
            <button
              key={value}
              type="button"
              aria-pressed={selectedFit === value}
              className={selectedFit === value ? "is-selected" : ""}
              onClick={() => setValue("fit_preference", value, { shouldDirty: true })}
            >
              <span className="advisor-fit-mark" />
              <strong>{title}</strong>
              <small>{description}</small>
            </button>
          ))}
        </div>
      </div>
      <label className="advisor-consent">
        <input type="checkbox" {...register("consent")} />
        Save my measurements on this device for next time (optional).
      </label>
      <p className="advisor-privacy">Your measurements stay in this browser. No photos or sensitive personal data are collected. Delete your profile anytime.</p>
      <button className="advisor-primary-button" type="submit">See my size recommendation</button>
    </form>
  );
}
