"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Ruler, ScanLine, Sparkles, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { recommendSize, calculateBodyShape, validateMeasurements } from "@/lib/size-engine";
import { getSizeChart, inferSizingGender } from "@/lib/size-recommendation-utils";
import { useSizeProfileStore } from "@/lib/size-profile-store";
import type { Gender, SizeProfile, SizeRecommendation } from "@/lib/size-types";
import { MeasurementForm } from "./measurement-form";
import { SizeResultCard } from "./size-result-card";

function quickEstimate(profile: SizeProfile): SizeProfile {
  if (profile.mode !== "quick" || !profile.height || !profile.weight) return profile;
  const h = profile.height / 100;
  const bmi = profile.weight / (h * h);
  const waist = Math.round(profile.height * (profile.gender === "women" ? 0.39 : 0.43) + (bmi - 22) * 1.15);
  const measurements: Record<string, number> = { ...profile.measurements, waist };
  if (profile.gender === "women") {
    measurements.bust = waist + (profile.body_shape === "pear" ? 18 : 24);
    measurements.underbust = measurements.bust - 12;
    measurements.high_hip = waist + 10;
    measurements.hip = waist + (profile.body_shape === "pear" ? 30 : 24);
    measurements.back_length = Math.round(profile.height * 0.24);
    measurements.shoulder = Math.round(profile.height * 0.22);
  } else {
    measurements.hip = waist + 18;
    measurements.thigh = Math.round(profile.height * 0.35);
    measurements.rise = Math.round(profile.height * 0.17);
  }
  return { ...profile, measurements };
}

function applyBodyShape(profile: SizeProfile) {
  if (profile.gender !== "women" || profile.mode !== "exact") return profile;
  return { ...profile, body_shape: profile.body_shape ?? calculateBodyShape(profile.measurements) ?? undefined };
}

export function SizeAdvisorDrawer({
  open,
  onClose,
  productTitle,
  productType,
  sizeChartValue,
  availableSizes,
  onSelectSize,
}: {
  open: boolean;
  onClose: () => void;
  productTitle: string;
  productType: string;
  sizeChartValue?: string;
  availableSizes: string[];
  onSelectSize: (size: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef<HTMLElement>(null);
  const { profile, hydrate, saveProfile, deleteProfile } = useSizeProfileStore();
  const [gender, setGender] = useState<Gender>(inferSizingGender(productType, productTitle));
  const [mode, setMode] = useState<"quick" | "exact" | "scan" | null>(null);
  const [selectedMode, setSelectedMode] = useState<"quick" | "exact">("exact");
  const [result, setResult] = useState<SizeRecommendation | null>(null);
  const [error, setError] = useState("");
  const chart = useMemo(() => getSizeChart(sizeChartValue, gender, productType), [sizeChartValue, gender, productType]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (open) window.dispatchEvent(new CustomEvent("advisor_opened", { detail: { product: productTitle } }));
  }, [open, productTitle]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => dialogRef.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  const onComplete = (rawProfile: SizeProfile) => {
    setError("");
    const completed = applyBodyShape(quickEstimate(rawProfile));
    const validation = validateMeasurements(completed.measurements, completed.gender);
    if (completed.weight && (completed.weight < 30 || completed.weight > 250)) {
      validation.weight = "This weight looks outside the expected range. Please check the value and units.";
    }
    if (Object.keys(validation).length) {
      setError(Object.values(validation)[0]);
      return;
    }
    if (completed.consent) {
      try {
        saveProfile(completed);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not save your profile to this device.");
        return;
      }
    }
    const activeChart = getSizeChart(sizeChartValue, completed.gender, productType);
    const computed = recommendSize(completed, activeChart);
    const bodiceRow = [...activeChart.sizes].sort((a, b) => {
      const bBust = b.body_ranges.bust;
      const aBust = a.body_ranges.bust;
      const value = completed.measurements.bust ?? 0;
      return Math.abs(value - ((aBust?.min ?? value) + (aBust?.max ?? value)) / 2)
        - Math.abs(value - ((bBust?.min ?? value) + (bBust?.max ?? value)) / 2);
    })[0];
    const skirtRow = [...activeChart.sizes].sort((a, b) => {
      const value = completed.measurements.waist ?? 0;
      const rangeA = a.body_ranges.waist;
      const rangeB = b.body_ranges.waist;
      return Math.abs(value - ((rangeA?.min ?? value) + (rangeA?.max ?? value)) / 2)
        - Math.abs(value - ((rangeB?.min ?? value) + (rangeB?.max ?? value)) / 2);
    })[0];
    if (activeChart.category === "dirndl") {
      computed.bodiceSize = bodiceRow?.size;
      computed.skirtSize = skirtRow?.size;
      if (bodiceRow?.adjustable === false) computed.fixedBodiceWarning = "This style has a fixed bodice. Please check the bust fit carefully.";
      if (completed.measurements.bust && completed.measurements.underbust) {
        computed.cupEstimate = completed.measurements.bust - completed.measurements.underbust;
      }
    }
    if (completed.measurements.waist && completed.measurements.hip) {
      computed.waistHipRatio = completed.measurements.waist / completed.measurements.hip;
    }
    computed.bodyShape = completed.body_shape?.replaceAll("-", " ");
    if (availableSizes.length && computed.recommendedSize !== "—") {
      const recommendedRow = activeChart.sizes.find((row) => row.size === computed.recommendedSize);
      const aliases = [computed.recommendedSize, recommendedRow?.eu, recommendedRow?.us, recommendedRow?.uk]
        .filter((label): label is string => Boolean(label))
        .map((label) => label.toLowerCase().replace(/^(eu|us|uk)\s*/, "").trim());
      const euSize = Number(recommendedRow?.eu ?? computed.recommendedSize);
      if (activeChart.gender === "women" && euSize) {
        aliases.push(
          euSize <= 32 ? "xs" : euSize <= 34 ? "s" : euSize <= 36 ? "s" :
          euSize <= 40 ? "m" : euSize <= 44 ? "l" : euSize <= 48 ? "xl" :
          euSize <= 52 ? "xxl" : "3xl",
        );
      }
      if (activeChart.gender === "men" && euSize) {
        aliases.push(euSize <= 46 ? "s" : euSize <= 50 ? "m" : euSize <= 54 ? "l" : euSize <= 58 ? "xl" : "xxl");
      }
      const matching = availableSizes.find((size) =>
        aliases.includes(size.toLowerCase().replace(/^(eu|us|uk)\s*/, "").trim()),
      );
      if (!matching) {
        const numericSizes = availableSizes.filter((size) => Number.isFinite(Number(size)));
        if (numericSizes.length) {
          computed.recommendedSize = numericSizes.reduce((best, size) =>
              Math.abs(Number(size) - Number(recommendedRow?.eu ?? computed.recommendedSize)) < Math.abs(Number(best) - Number(recommendedRow?.eu ?? computed.recommendedSize)) ? size : best,
            numericSizes[0])
        } else {
          computed.variantMappingWarning = "Your product's size options do not match its chart. Please contact us before ordering.";
        }
      } else computed.recommendedSize = matching;
    }
    window.dispatchEvent(new CustomEvent("size_recommended", { detail: { product: productTitle, size: computed.recommendedSize, confidence: computed.confidence } }));
    window.dispatchEvent(new CustomEvent("profile_completed", { detail: { product: productTitle, mode: completed.mode } }));
    setResult(computed);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="size-advisor-scrim"
            aria-label="Close size advisor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="size-advisor-drawer"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-advisor-title"
            tabIndex={-1}
            initial={{ x: reduceMotion ? 0 : "100%", y: reduceMotion ? 0 : 24 }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: reduceMotion ? 0 : "100%", y: reduceMotion ? 0 : 24 }}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <header className="size-advisor-header">
              <div>
                <span className="eyebrow"><Ruler size={14} /> PERSONAL FIT</span>
                <h2 id="size-advisor-title">Find your size</h2>
                <p>{productTitle}</p>
              </div>
              <button type="button" className="size-advisor-close" onClick={onClose} aria-label="Close size advisor"><X size={20} /></button>
            </header>
            <div className="size-advisor-content">
              {profile && profile.gender === gender && !mode && !result && (
                <section className="size-profile-existing">
                  <p>Your saved fit profile is ready. This product-specific recommendation stays on your device.</p>
                  <button type="button" className="advisor-primary-button" onClick={() => onComplete(profile)}>Use saved measurements</button>
                  <button type="button" className="advisor-text-button" onClick={() => { setMode(profile.mode === "quick" ? "quick" : "exact"); setResult(null); }}>Edit measurements</button>
                  <button type="button" className="advisor-text-button is-danger" onClick={() => { deleteProfile(); setMode(null); setResult(null); }}>Delete my data</button>
                </section>
              )}
              {result ? (
                <>
                  <button type="button" className="advisor-back-button" onClick={() => setResult(null)}><ArrowLeft size={15} /> Edit answers</button>
                  <SizeResultCard result={result} onSelect={() => { onSelectSize(result.recommendedSize); window.dispatchEvent(new CustomEvent("size_applied", { detail: { product: productTitle, size: result.recommendedSize } })); onClose(); }} />
                  {chart.disclaimer && <p className="advisor-disclaimer">{chart.disclaimer}</p>}
                </>
              ) : profile && profile.gender !== gender && !mode && !result ? (
                <section className="size-profile-existing">
                  <p>Your saved {profile.gender} fit profile doesn&apos;t match this product. Create a separate set of measurements for this fit.</p>
                  <button type="button" className="advisor-primary-button" onClick={() => { setMode("exact"); }}>Enter measurements for this product</button>
                </section>
              ) : !mode && !profile ? (
                <>
                  <div className="advisor-progress" aria-label="Step 1 of 2">
                    <span className="is-current">01</span><i /><span>02</span>
                    <small>YOUR FIT PROFILE</small>
                  </div>
                  <p className="size-advisor-intro">A few details are all we need to recommend a more considered fit.</p>
                  <fieldset className="advisor-gender">
                    <legend>WHO ARE YOU DRESSING?</legend>
                    {(["women", "men"] as const).map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={gender === option ? "is-selected" : ""}
                        aria-pressed={gender === option}
                        onClick={() => setGender(option)}
                      >
                        <UserRound size={17} strokeWidth={1.6} />
                        <span>{option === "women" ? "Women" : "Men"}</span>
                        {gender === option && <Check className="advisor-selected-check" size={15} />}
                      </button>
                    ))}
                  </fieldset>
                  <fieldset className="advisor-mode-options">
                    <legend>CHOOSE YOUR FIT METHOD</legend>
                    <button
                      type="button"
                      aria-pressed={selectedMode === "quick"}
                      className={`advisor-mode-card ${selectedMode === "quick" ? "is-selected" : ""}`}
                      onClick={() => setSelectedMode("quick")}
                    >
                      <span className="advisor-mode-icon"><Sparkles size={18} /></span>
                      <span className="advisor-mode-copy"><strong>Quick estimate</strong><small>Height, weight &amp; a few quick details</small></span>
                      <span className="advisor-mode-tag">ESTIMATED</span>
                      <span className="advisor-radio-mark" />
                    </button>
                    <button
                      type="button"
                      aria-pressed={selectedMode === "exact"}
                      className={`advisor-mode-card ${selectedMode === "exact" ? "is-selected" : ""}`}
                      onClick={() => setSelectedMode("exact")}
                    >
                      <span className="advisor-mode-icon"><Ruler size={18} /></span>
                      <span className="advisor-mode-copy"><strong>Exact measurements</strong><small>Guided step-by-step for your closest fit</small></span>
                      <span className="advisor-mode-tag is-precise">MORE PRECISE</span>
                      <span className="advisor-radio-mark" />
                    </button>
                    <div className="advisor-mode-card is-disabled" aria-disabled="true">
                      <span className="advisor-mode-icon"><ScanLine size={18} /></span>
                      <span className="advisor-mode-copy"><strong>Phone scan</strong><small>Fast body scan, coming soon</small></span>
                      <span className="advisor-mode-tag">SOON</span>
                    </div>
                  </fieldset>
                  <button type="button" className="advisor-primary-button advisor-continue-button" onClick={() => setMode(selectedMode)}>
                    Continue <ArrowRight size={16} />
                  </button>
                  <p className="advisor-privacy">Private by design: no photos, only sizing measurements. Saving is optional.</p>
                </>
              ) : mode === "scan" ? (
                <p className="advisor-hint">No scan provider is configured yet.</p>
              ) : mode ? (
                <>
                  <button type="button" className="advisor-back-button" onClick={() => setMode(null)}><ArrowLeft size={15} /> All options</button>
                  {mode === "exact" && (
                    <div className="measurement-tips">
                      <strong>Before you begin</strong>
                      <span>Light clothing · tape snug, not tight · stand relaxed · breathe normally · ask a friend for back measurements.</span>
                      <span className="measurement-video-placeholder" role="img" aria-label="Five-second measuring guide animation placeholder">How to measure · 00:05</span>
                    </div>
                  )}
                  {error && <p className="advisor-error" role="alert">{error}</p>}
                  <MeasurementForm gender={gender} mode={mode} productType={productType} onComplete={onComplete} />
                </>
              ) : null}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
