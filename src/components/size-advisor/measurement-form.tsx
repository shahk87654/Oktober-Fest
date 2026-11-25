"use client";

import dynamic from "next/dynamic";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Ruler } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { z } from "zod";
import { calculateBodyShape } from "@/lib/size-engine";
import { useSizeProfileStore } from "@/lib/size-profile-store";
import type { Gender, SizeProfile } from "@/lib/size-types";
import { BodyShapePicker } from "./body-shape-picker";
import { MeasurementGuide } from "./measurement-guide";

const FitAvatar3D = dynamic(
  () => import("./fit-avatar-3d").then((module) => module.FitAvatar3D),
  { ssr: false, loading: () => <div className="fit-avatar-loading"><span>Preparing your 3D fit model…</span></div> },
);

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
type FormInput = z.input<typeof measureSchema>;
type NumericField = "height" | "bust" | "underbust" | "waist" | "high_hip" | "hip" | "shoulder" |
  "back_length" | "arm_length" | "upper_arm" | "chest" | "neck" | "sleeve_length" |
  "inseam" | "outseam" | "thigh" | "rise" | "weight";
type Step = { title: string; subtitle: string; kind: "measure" | "age" | "shape" | "fit" | "extras" | "privacy"; fields: NumericField[] };
type MeasurementDefinition = { key: NumericField; title: string; hint: string; min: number; max: number };

const definitions: Record<Exclude<NumericField, "weight">, Omit<MeasurementDefinition, "key">> = {
  height: { title: "Height", hint: "Stand naturally, without shoes.", min: 120, max: 220 },
  bust: { title: "Bust", hint: "Fullest point, tape level.", min: 55, max: 170 },
  underbust: { title: "Underbust", hint: "Just below the bust.", min: 50, max: 150 },
  waist: { title: "Natural waist", hint: "Narrowest point above navel.", min: 45, max: 160 },
  high_hip: { title: "High hip", hint: "About 8 cm below waist.", min: 55, max: 170 },
  hip: { title: "Hip", hint: "Fullest point around seat.", min: 60, max: 180 },
  shoulder: { title: "Shoulder width", hint: "Seam to seam across back.", min: 30, max: 60 },
  back_length: { title: "Back length", hint: "Nape to natural waist.", min: 30, max: 70 },
  arm_length: { title: "Arm length", hint: "Shoulder point to wrist.", min: 35, max: 90 },
  upper_arm: { title: "Upper arm", hint: "Fullest point of upper arm.", min: 15, max: 60 },
  chest: { title: "Chest", hint: "Fullest point under the arms.", min: 60, max: 170 },
  neck: { title: "Neck", hint: "Around the base of the neck.", min: 25, max: 60 },
  sleeve_length: { title: "Sleeve length", hint: "Shoulder point to wrist.", min: 40, max: 100 },
  inseam: { title: "Inseam", hint: "Crotch to ankle.", min: 45, max: 110 },
  outseam: { title: "Outseam", hint: "Waist to ankle.", min: 60, max: 140 },
  thigh: { title: "Thigh", hint: "Fullest point of thigh.", min: 35, max: 100 },
  rise: { title: "Rise", hint: "Crotch seam to waistband.", min: 15, max: 50 },
};

function measureStep(fields: NumericField[], subtitle?: string): Step {
  const first = fields[0] === "weight"
    ? { title: "Weight", hint: "Used only for a quick estimate." }
    : definitions[fields[0] as Exclude<NumericField, "weight">];
  return {
    title: fields.length > 1 ? `${first.title} & ${definitions[fields[1] as Exclude<NumericField, "weight">].title.toLowerCase()}` : first.title,
    subtitle: subtitle ?? first.hint,
    kind: "measure",
    fields,
  };
}

function exactSteps(gender: Gender, productType: string): Step[] {
  const type = productType.toLowerCase();
  const steps: Step[] = [measureStep(["height"])];
  if (gender === "women") {
    steps.push(
      measureStep(["bust", "underbust"], "These two measurements shape a supportive dirndl bodice."),
      measureStep(["waist", "high_hip"], "Measure the narrowest point, then about 8 cm below."),
      measureStep(["hip"], "Keep the tape level around the fullest point."),
      measureStep(["shoulder", "back_length"], "A friend can help with both back measurements."),
      { title: "Your silhouette", subtitle: "We’ll estimate a shape from your measurements. Choose what feels right.", kind: "shape", fields: [] },
      { title: "A few finishing touches", subtitle: "Optional details help refine the fit.", kind: "extras", fields: ["arm_length", "upper_arm"] },
    );
    steps.push(
      { title: "Your preferred fit", subtitle: "We’ll use this to fine-tune the size suggestion.", kind: "fit", fields: [] },
      { title: "Keep it private", subtitle: "Your measurements are used only to recommend a size.", kind: "privacy", fields: [] },
    );
    return steps;
  }
  if (/shirt/.test(type)) {
    steps.push(
      measureStep(["chest", "neck"], "Measure around the fullest chest and base of the neck."),
      measureStep(["sleeve_length"], "From the shoulder point to your wrist."),
      { title: "A little more detail", subtitle: "Optional: refine the fit with your waist and hip.", kind: "extras", fields: ["waist", "hip", "shoulder", "back_length", "weight"] },
    );
  } else if (/janker|jacket/.test(type)) {
    steps.push(
      measureStep(["chest", "shoulder"], "Chest and shoulder width define the jacket’s structure."),
      measureStep(["sleeve_length", "back_length"], "A friend can help with the back length."),
      { title: "A little more detail", subtitle: "Optional: add your natural waist and hip.", kind: "extras", fields: ["waist", "hip", "inseam", "outseam", "weight"] },
    );
  } else if (/lederhosen|trouser|pants/.test(type)) {
    steps.push(
      measureStep(["waist", "hip"], "Measure where you wear the waistband: at navel or hip."),
      measureStep(["inseam", "outseam"], "Inside leg: crotch to ankle. Outside: waistband to ankle."),
      { title: "Dial in the details", subtitle: "Optional: thigh and rise help us refine a traditional trouser fit.", kind: "extras", fields: ["thigh", "rise", "weight"] },
    );
  } else {
    steps.push(
      measureStep(["chest", "neck"], "Measure around the fullest chest and base of the neck."),
      measureStep(["waist", "hip"], "Natural waist is at navel height; hip is the fullest point."),
      measureStep(["shoulder", "sleeve_length"], "A friend can help measure across your back."),
      measureStep(["inseam", "outseam"], "Inside and outside leg measurements."),
      { title: "A little more detail", subtitle: "Optional measurements for a more complete profile.", kind: "extras", fields: ["back_length", "thigh", "rise", "weight"] },
    );
  }
  return steps;
}

function quickSteps(): Step[] {
  return [
    measureStep(["height"]),
    { title: "Your weight", subtitle: "Only used for an approximate fit estimate.", kind: "measure", fields: ["weight"] },
    { title: "Your age range", subtitle: "A broad range is enough; we don’t need your exact age.", kind: "age", fields: [] },
    { title: "Your silhouette", subtitle: "Choose the shape that feels most like you.", kind: "shape", fields: [] },
    { title: "Your preferred fit", subtitle: "We’ll use this to fine-tune the size suggestion.", kind: "fit", fields: [] },
    { title: "Keep it private", subtitle: "Your measurements are used only to recommend a size.", kind: "privacy", fields: [] },
  ];
}

export function MeasurementForm({
  gender,
  mode,
  productType,
  onComplete,
  onExit,
}: {
  gender: Gender;
  mode: "quick" | "exact";
  productType: string;
  onComplete: (profile: SizeProfile) => void;
  onExit?: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const unit = useSizeProfileStore((state) => state.unit);
  const savedProfile = useSizeProfileStore((state) => state.profile);
  const setUnit = useSizeProfileStore((state) => state.setUnit);
  const activeProfile = savedProfile?.gender === gender ? savedProfile : null;
  const steps = useMemo(() => mode === "quick" ? quickSteps() : exactSteps(gender, productType), [mode, gender, productType]);
  const currentStep = steps[stepIndex];
  const { register, handleSubmit, control, getValues, setValue, trigger, setError, formState: { errors } } = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(measureSchema),
    defaultValues: {
      gender,
      height: activeProfile?.height ? (unit === "imperial" ? activeProfile.height / 2.54 : activeProfile.height) : undefined,
      weight: activeProfile?.weight ? (unit === "imperial" ? activeProfile.weight / 0.453592 : activeProfile.weight) : undefined,
      ...Object.fromEntries(
        Object.keys(definitions)
          .filter((key) => key !== "height")
          .map((key) => {
            const value = activeProfile?.measurements[key];
            return [key, value === undefined ? undefined : unit === "imperial" ? value / 2.54 : value];
          }),
      ),
      body_shape: activeProfile?.body_shape ?? undefined,
      fit_preference: activeProfile?.fit_preference ?? "regular",
      age_range: activeProfile?.age_range ?? "",
      skirt_length: activeProfile?.skirt_length ?? "midi",
      bra_size: activeProfile?.bra_size ?? "",
      consent: activeProfile?.consent ?? false,
    },
    shouldUnregister: false,
  });
  const values = useWatch({ control });
  const selectedShape = values.body_shape ?? "";
  const computedShape = gender === "women"
    ? calculateBodyShape({
        bust: Number(values.bust) * (unit === "imperial" ? 2.54 : 1),
        waist: Number(values.waist) * (unit === "imperial" ? 2.54 : 1),
        high_hip: Number(values.high_hip) * (unit === "imperial" ? 2.54 : 1),
        hip: Number(values.hip) * (unit === "imperial" ? 2.54 : 1),
      })
    : null;
  const focusMeasurement = currentStep.fields[0] === "weight" ? undefined : currentStep.fields[0];
  const percent = Math.round(((stepIndex + 1) / steps.length) * 100);
  const modelMeasurements = Object.fromEntries(
    Object.entries(values)
      .filter((entry): entry is [string, number] => typeof entry[1] === "number" && entry[0] !== "weight")
      .map(([key, value]) => [key, unit === "imperial" ? value * 2.54 : value]),
  );

  const changeUnit = (nextUnit: "metric" | "imperial") => {
    if (unit === nextUnit) return;
    const factor = unit === "metric" ? 1 / 2.54 : 2.54;
    const weightFactor = unit === "metric" ? 1 / 0.453592 : 0.453592;
    const numericFields: NumericField[] = ["height", "weight", ...Object.keys(definitions).filter((key) => key !== "height") as NumericField[]];
    for (const field of numericFields) {
      const value = getValues(field);
      if (typeof value === "number" && Number.isFinite(value)) {
        setValue(field, value * (field === "weight" ? weightFactor : factor), { shouldDirty: true, shouldValidate: true });
      }
    }
    setUnit(nextUnit);
  };

  const advance = async () => {
    if (currentStep.fields.length) {
      const missing = currentStep.fields.find((field) => {
        if (currentStep.kind === "extras") return false;
        const value = getValues(field);
        return typeof value !== "number" || !Number.isFinite(value);
      });
      if (missing) {
        setError(missing, { type: "required", message: "Add this measurement to continue." });
        return;
      }
      const valid = await trigger(currentStep.fields as FieldPath<FormInput>[]);
      if (!valid) return;
    }
    if (currentStep.kind === "age" && !getValues("age_range")) {
      setError("age_range", { type: "required", message: "Choose an age range to continue." });
      return;
    }
    if (currentStep.kind === "shape" && !getValues("body_shape")) {
      setError("body_shape", { type: "required", message: "Choose a silhouette to continue." });
      return;
    }
    if (stepIndex < steps.length - 1) setStepIndex((current) => current + 1);
  };

  const submit = (submitted: FormValues) => {
    const measurements: Record<string, number> = {};
    for (const [key, value] of Object.entries(submitted)) {
      if (typeof value === "number" && key !== "weight") {
        measurements[key] = unit === "imperial" ? value * 2.54 : value;
      }
    }
    onComplete({
      gender,
      unit,
      mode,
      consent: submitted.consent,
      height: submitted.height ? (unit === "imperial" ? submitted.height * 2.54 : submitted.height) : undefined,
      weight: submitted.weight ? (unit === "imperial" ? submitted.weight * 0.453592 : submitted.weight) : undefined,
      age_range: submitted.age_range,
      body_shape: (submitted.body_shape || computedShape || undefined) as SizeProfile["body_shape"],
      fit_preference: submitted.fit_preference,
      bra_size: submitted.bra_size || undefined,
      skirt_length: submitted.skirt_length,
      measurements,
    });
  };

  const numericInput = (field: NumericField) => register(field, { valueAsNumber: true });
  const displayUnit = unit === "metric" ? "cm" : "in";

  return (
    <form className="fit-wizard" onSubmit={handleSubmit(submit)}>
      <aside className="fit-wizard-visual">
        <FitAvatar3D
          gender={gender}
          activeMeasurement={focusMeasurement}
          measurements={modelMeasurements}
          bodyShape={String(values.body_shape ?? computedShape ?? "")}
          fitPreference={values.fit_preference ?? "regular"}
          unit={unit}
        />
        <div className="fit-wizard-progress">
          <div className="fit-wizard-progress-copy"><span>YOUR FIT PROFILE</span><strong>{String(stepIndex + 1).padStart(2, "0")} <i>/</i> {String(steps.length).padStart(2, "0")}</strong></div>
          <div className="fit-wizard-progress-track"><i style={{ width: `${percent}%` }} /></div>
          <p>Every answer refines your fit model.</p>
        </div>
      </aside>

      <section className="fit-wizard-question" key={`${mode}-${stepIndex}`}>
        <div className="fit-wizard-topbar">
          <button type="button" className="fit-wizard-back" onClick={() => stepIndex ? setStepIndex((current) => current - 1) : onExit?.()} disabled={!stepIndex && !onExit} aria-label={stepIndex ? "Previous question" : "Change fit method"}>
            <ChevronLeft size={17} /> {stepIndex ? "BACK" : "METHOD"}
          </button>
          <fieldset className="size-unit-toggle" aria-label="Measurement units">
            <legend>UNITS</legend>
            <button type="button" className={unit === "metric" ? "is-active" : ""} aria-pressed={unit === "metric"} onClick={() => changeUnit("metric")}>CM <span>/</span> KG</button>
            <button type="button" className={unit === "imperial" ? "is-active" : ""} aria-pressed={unit === "imperial"} onClick={() => changeUnit("imperial")}>IN <span>/</span> LB</button>
          </fieldset>
        </div>
        <span className="fit-wizard-kicker">{currentStep.kind === "measure" ? "MEASUREMENT" : "YOUR PREFERENCE"}</span>
        <h3>{currentStep.title}</h3>
        <p className="fit-wizard-subtitle">{currentStep.subtitle}</p>

        {currentStep.kind === "measure" && (
          <div className={`fit-wizard-measures ${currentStep.fields.length > 1 ? "has-pair" : ""}`}>
            {currentStep.fields.map((field) => {
              const isWeight = field === "weight";
              const definition = isWeight
                ? { title: "Weight", hint: "Used only for a quick estimate.", min: 30, max: 250 }
                : definitions[field as Exclude<NumericField, "weight">];
              const unitFactor = unit === "metric" ? 1 : field === "weight" ? 2.20462 : 1 / 2.54;
              const min = Math.round(definition.min * unitFactor);
              const max = Math.round(definition.max * unitFactor);
              const numberValue = values[field];
              const defaultValue = Math.round((min + max) / 2);
              const activeValue = typeof numberValue === "number" && Number.isFinite(numberValue) ? numberValue : defaultValue;
              return (
                <article className="fit-wizard-measure" key={field}>
                  {!isWeight && field !== "height" && <MeasurementGuide measurement={field} gender={gender} />}
                  <label htmlFor={`measure-${field}`}>
                    <span>{definition.title}</span>
                    <small>{isWeight ? unit === "metric" ? "kg" : "lb" : displayUnit}</small>
                  </label>
                  <div className="fit-wizard-number-wrap">
                    <input
                      id={`measure-${field}`}
                      type="number"
                      step="any"
                      min={min}
                      max={max}
                      inputMode="decimal"
                      placeholder={String(defaultValue)}
                      {...numericInput(field)}
                      required={currentStep.kind !== "extras"}
                    />
                    <span>{isWeight ? unit === "metric" ? "kg" : "lb" : displayUnit}</span>
                  </div>
                  <input
                    className="fit-wizard-slider"
                    type="range"
                    min={min}
                    max={max}
                    step={unit === "metric" ? "1" : "0.5"}
                    value={activeValue}
                    aria-label={`Adjust ${definition.title.toLowerCase()}`}
                    onChange={(event) => setValue(field, Number(event.target.value), { shouldDirty: true, shouldValidate: true })}
                  />
                  <div className="fit-wizard-slider-labels"><span>{min} {isWeight ? unit === "metric" ? "kg" : "lb" : displayUnit}</span><span>{max} {isWeight ? unit === "metric" ? "kg" : "lb" : displayUnit}</span></div>
                  <p>{definition.hint}</p>
                  {errors[field] && <span className="advisor-error">Check the value and re-measure.</span>}
                </article>
              );
            })}
          </div>
        )}

        {currentStep.kind === "age" && (
          <div className="fit-wizard-choice-grid" role="group" aria-label="Age range">
            {["18–29", "30–44", "45–59", "60+"].map((age) => (
              <button type="button" key={age} className={values.age_range === age ? "is-selected" : ""} aria-pressed={values.age_range === age} onClick={() => setValue("age_range", age, { shouldDirty: true })}>
                <span>{age}</span>{values.age_range === age && <Check size={15} />}
              </button>
            ))}
            {errors.age_range && <span className="advisor-error">{errors.age_range.message}</span>}
          </div>
        )}

        {currentStep.kind === "shape" && (
          <div className="fit-wizard-shape">
            {computedShape && mode === "exact" && <p className="fit-wizard-insight"><Ruler size={14} /> Based on your measurements, our model reads <strong>{computedShape.replace("-", " ")}</strong>. Confirm or change it.</p>}
            <BodyShapePicker gender={gender} value={selectedShape || (mode === "exact" ? computedShape ?? "" : "")} onChange={(value) => setValue("body_shape", value, { shouldDirty: true })} />
            {errors.body_shape && <span className="advisor-error">{errors.body_shape.message}</span>}
          </div>
        )}

        {currentStep.kind === "fit" && (
          <div className="advisor-fit-options fit-wizard-fit" role="group" aria-label="Fit preference">
            {([
              ["fitted", "Close", "A defined silhouette"],
              ["regular", "Classic", "Easy, balanced comfort"],
              ["relaxed", "Relaxed", "A little extra room"],
            ] as const).map(([value, title, description]) => (
              <button type="button" key={value} aria-pressed={values.fit_preference === value} className={values.fit_preference === value ? "is-selected" : ""} onClick={() => setValue("fit_preference", value, { shouldDirty: true })}>
                <span className={`fit-preference-shape fit-${value}`} />
                <strong>{title}</strong><small>{description}</small>
              </button>
            ))}
          </div>
        )}

        {currentStep.kind === "privacy" && (
          <div className="fit-wizard-privacy-card">
            <span className="fit-privacy-icon"><Check size={18} /></span>
            <strong>Your measurements stay yours.</strong>
            <p>We don’t upload measurements or collect photos. Your answers are used to calculate this recommendation in your browser.</p>
            <label className="advisor-consent">
              <input type="checkbox" {...register("consent")} />
              Save my measurements on this device for next time (optional).
            </label>
          </div>
        )}

        {currentStep.kind === "extras" && (
          <div className="fit-wizard-extras">
            {currentStep.fields.map((field) => {
              if (field === "weight") {
                return (
                  <div className="fit-wizard-number-wrap" key={field}>
                    <label htmlFor="measure-weight">Weight <small>{unit === "metric" ? "kg" : "lb"} · optional</small></label>
                    <input id="measure-weight" type="number" step="any" min={unit === "metric" ? 30 : 66} max={unit === "metric" ? 250 : 550} {...numericInput("weight")} />
                  </div>
                );
              }
              const definition = definitions[field as Exclude<NumericField, "weight">];
              const min = Math.round(definition.min * (unit === "metric" ? 1 : 1 / 2.54));
              const max = Math.round(definition.max * (unit === "metric" ? 1 : 1 / 2.54));
              return (
                <div className="fit-wizard-number-wrap" key={field}>
                  <label htmlFor={`extra-${field}`}>{definition.title} <small>{displayUnit} · optional</small></label>
                  <input id={`extra-${field}`} type="number" step="any" min={min} max={max} {...numericInput(field)} />
                </div>
              );
            })}
            {gender === "women" && (
              <>
                <div className="fit-wizard-number-wrap">
                  <label htmlFor="bra-size">Bra size <small>optional</small></label>
                  <input id="bra-size" placeholder="e.g. 75C" {...register("bra_size")} />
                </div>
                <div>
                  <span className="advisor-label">Preferred skirt length</span>
                  <div className="advisor-choice-row" role="group" aria-label="Preferred skirt length">
                    {(["knee", "midi", "long"] as const).map((length) => (
                      <button type="button" key={length} className={values.skirt_length === length ? "is-selected" : ""} aria-pressed={values.skirt_length === length} onClick={() => setValue("skirt_length", length, { shouldDirty: true })}>{length}</button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div className="fit-wizard-footer">
          {stepIndex < steps.length - 1 ? (
            <button type="button" className="advisor-primary-button" onClick={() => void advance()}>
              NEXT QUESTION <ChevronRight size={17} />
            </button>
          ) : (
            <>
              <button type="submit" className="advisor-primary-button">REVEAL MY SIZE <ArrowRight size={16} /></button>
            </>
          )}
        </div>
        <span className="fit-wizard-step-note">STEP {String(stepIndex + 1).padStart(2, "0")} <i>/</i> {String(steps.length).padStart(2, "0")}</span>
      </section>
    </form>
  );
}
